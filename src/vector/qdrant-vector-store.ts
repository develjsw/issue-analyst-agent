import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import {
  ChunkPayload,
  SearchFilter,
  SearchResult,
  VectorPoint,
  VectorStore,
} from './vector-store.interface';

const EMBEDDING_DIMENSION = 1536; // text-embedding-3-small
const DISTANCE = 'Cosine';

@Injectable()
export class QdrantVectorStore implements VectorStore, OnModuleInit {
  private readonly logger = new Logger(QdrantVectorStore.name);
  private readonly qdrant: QdrantClient;
  private readonly collection: string;

  constructor(private readonly config: ConfigService) {
    this.qdrant = new QdrantClient({
      url: this.config.get<string>('QDRANT_URL'),
    });
    this.collection = this.config.get<string>('QDRANT_COLLECTION', 'documents');
  }

  // 부팅 시 컬렉션 없으면 자동 생성
  async onModuleInit(): Promise<void> {
    const exists = await this.qdrant
      .collectionExists(this.collection)
      .then((r) => r.exists)
      .catch(() => false);

    if (!exists) {
      await this.qdrant.createCollection(this.collection, {
        vectors: { size: EMBEDDING_DIMENSION, distance: DISTANCE },
      });
      this.logger.log(`Qdrant 컬렉션 생성: ${this.collection}`);
    }
  }

  async upsert(points: VectorPoint[]): Promise<void> {
    await this.qdrant.upsert(this.collection, {
      wait: true,
      points: points.map((p) => ({
        id: p.id,
        vector: p.vector,
        payload: p.payload as unknown as Record<string, unknown>,
      })),
    });
  }

  async search(
    vector: number[],
    limit: number,
    filter?: SearchFilter,
  ): Promise<SearchResult[]> {
    const results = await this.qdrant.search(this.collection, {
      vector,
      limit,
      with_payload: true,
      ...(filter?.type && {
        filter: {
          must: [{ key: 'type', match: { value: filter.type } }],
        },
      }),
    });

    return results.map((r) => ({
      score: r.score,
      payload: r.payload as unknown as ChunkPayload,
    }));
  }

  async deleteByDocumentId(documentId: number): Promise<void> {
    await this.qdrant.delete(this.collection, {
      wait: true,
      filter: {
        must: [{ key: 'documentId', match: { value: documentId } }],
      },
    });
  }
}
