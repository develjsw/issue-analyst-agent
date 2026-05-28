import { Logger } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

const DEFAULT_DISTANCE = 'Cosine';

export type QdrantMatch = { key: string; match: { value: string | number } };

export type AdapterPoint<P> = {
  id: string;
  vector: number[];
  payload: P;
};

export type AdapterSearchResult<P> = {
  score: number;
  payload: P;
};

export class QdrantCollectionAdapter {
  private readonly logger = new Logger(QdrantCollectionAdapter.name);

  constructor(
    private readonly qdrant: QdrantClient,
    private readonly collection: string,
    private readonly embeddingDimension: number,
  ) {}

  async ensureCollection(): Promise<void> {
    const exists = await this.qdrant
      .collectionExists(this.collection)
      .then((r) => r.exists)
      .catch(() => false);

    if (!exists) {
      await this.qdrant.createCollection(this.collection, {
        vectors: {
          size: this.embeddingDimension,
          distance: DEFAULT_DISTANCE,
        },
      });
      this.logger.log(`Qdrant 컬렉션 생성: ${this.collection}`);
    }
  }

  async upsert<P>(points: AdapterPoint<P>[]): Promise<void> {
    if (points.length === 0) return;
    await this.qdrant.upsert(this.collection, {
      wait: true,
      points: points.map((p) => ({
        id: p.id,
        vector: p.vector,
        payload: p.payload as Record<string, unknown>,
      })),
    });
  }

  async search<P>(
    vector: number[],
    limit: number,
    must: QdrantMatch[],
  ): Promise<AdapterSearchResult<P>[]> {
    const results = await this.qdrant.search(this.collection, {
      vector,
      limit,
      with_payload: true,
      ...(must.length > 0 && { filter: { must } }),
    });

    return results.map((r) => ({
      score: r.score,
      payload: r.payload as P,
    }));
  }

  async deleteByMust(must: QdrantMatch[]): Promise<void> {
    // 빈 must는 전체 삭제로 동작하므로 차단
    if (must.length === 0) {
      throw new Error('deleteByMust requires at least one match condition');
    }
    await this.qdrant.delete(this.collection, {
      wait: true,
      filter: { must },
    });
  }
}
