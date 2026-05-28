import { Injectable } from '@nestjs/common';
import {
  IssuePayload,
  IssueSearchFilter,
  IssueSearchResult,
  IssueVectorPoint,
  IssueVectorStore,
} from '../interface/issue-vector-store.interface';
import {
  QdrantCollectionAdapter,
  QdrantMatch,
} from './qdrant-collection-adapter';

@Injectable()
export class QdrantIssueVectorStore implements IssueVectorStore {
  constructor(private readonly adapter: QdrantCollectionAdapter) {}

  async upsert(points: IssueVectorPoint[]): Promise<void> {
    await this.adapter.upsert(
      points.map((p) => ({
        id: p.id,
        vector: p.vector,
        payload: p.payload as unknown as Record<string, unknown>,
      })),
    );
  }

  async search(
    vector: number[],
    limit: number,
    filter?: IssueSearchFilter,
  ): Promise<IssueSearchResult[]> {
    const must = this.buildMust(filter);
    const raw = await this.adapter.search(vector, limit, must);
    return raw.map((r) => ({
      score: r.score,
      payload: r.payload as unknown as IssuePayload,
    }));
  }

  async deleteByIssueId(issueId: number): Promise<void> {
    await this.adapter.deleteByMust([
      { key: 'issueId', match: { value: issueId } },
    ]);
  }

  private buildMust(filter?: IssueSearchFilter): QdrantMatch[] {
    if (!filter) return [];
    const entries: [string, string | number | undefined][] = [
      ['issueId', filter.issueId],
      ['category', filter.category],
      ['status', filter.status],
    ];
    return entries
      .filter((e): e is [string, string | number] => e[1] !== undefined)
      .map(([key, value]) => ({ key, match: { value } }));
  }
}
