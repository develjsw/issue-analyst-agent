import { Logger } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

const DEFAULT_DISTANCE = 'Cosine';

// 도메인을 모르는 Qdrant 단일 컬렉션 어댑터
// 각 도메인 VectorStore 구현체가 자기 컬렉션의 어댑터를 합성해서 사용
export type QdrantMatch = { key: string; match: { value: string | number } };

export type RawPoint = {
  id: string;
  vector: number[];
  payload: Record<string, unknown>;
};

export type RawSearchResult = {
  score: number;
  payload: Record<string, unknown>;
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

  async upsert(points: RawPoint[]): Promise<void> {
    if (points.length === 0) return;
    await this.qdrant.upsert(this.collection, {
      wait: true,
      points,
    });
  }

  async search(
    vector: number[],
    limit: number,
    must: QdrantMatch[],
  ): Promise<RawSearchResult[]> {
    const results = await this.qdrant.search(this.collection, {
      vector,
      limit,
      with_payload: true,
      ...(must.length > 0 && { filter: { must } }),
    });

    return results.map((r) => ({
      score: r.score,
      payload: r.payload as Record<string, unknown>,
    }));
  }

  // 도메인 구현체가 빈 must를 못 넘기게 명시적 가드 - 전체 삭제 방지
  async deleteByMust(must: QdrantMatch[]): Promise<void> {
    if (must.length === 0) {
      throw new Error('deleteByMust requires at least one match condition');
    }
    await this.qdrant.delete(this.collection, {
      wait: true,
      filter: { must },
    });
  }
}
