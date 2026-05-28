import { Injectable } from '@nestjs/common';
import {
  DocumentChunkPayload,
  DocumentSearchFilter,
  DocumentSearchResult,
  DocumentVectorPoint,
  DocumentVectorStore,
} from '../interface/document-vector-store.interface';
import {
  QdrantCollectionAdapter,
  QdrantMatch,
} from './qdrant-collection-adapter';

@Injectable()
export class QdrantDocumentVectorStore implements DocumentVectorStore {
  constructor(private readonly adapter: QdrantCollectionAdapter) {}

  async upsert(points: DocumentVectorPoint[]): Promise<void> {
    await this.adapter.upsert<DocumentChunkPayload>(points);
  }

  async search(
    vector: number[],
    limit: number,
    filter?: DocumentSearchFilter,
  ): Promise<DocumentSearchResult[]> {
    const must = this.buildMust(filter);
    return this.adapter.search<DocumentChunkPayload>(vector, limit, must);
  }

  async deleteByDocumentId(documentId: number): Promise<void> {
    await this.adapter.deleteByMust([
      { key: 'documentId', match: { value: documentId } },
    ]);
  }

  private buildMust(filter?: DocumentSearchFilter): QdrantMatch[] {
    if (!filter) return [];
    const entries: [string, string | number | undefined][] = [
      ['type', filter.type],
      ['documentId', filter.documentId],
    ];
    return entries
      .filter((e): e is [string, string | number] => e[1] !== undefined)
      .map(([key, value]) => ({ key, match: { value } }));
  }
}
