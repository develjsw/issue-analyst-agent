import { Inject, Injectable } from '@nestjs/common';
import { EMBEDDER } from '../../embedding/interface/embedder.interface';
import type { EmbedderInterface } from '../../embedding/interface/embedder.interface';
import { DOCUMENT_VECTOR_STORE } from '../../vector/interface/document-vector-store.interface';
import type {
  DocumentSearchFilter,
  DocumentSearchResult,
  DocumentVectorStore,
} from '../../vector/interface/document-vector-store.interface';

const DEFAULT_TOP_K = 5;

@Injectable()
export class DocumentSearchService {
  constructor(
    @Inject(EMBEDDER) private readonly embedder: EmbedderInterface,
    @Inject(DOCUMENT_VECTOR_STORE)
    private readonly vectorStore: DocumentVectorStore,
  ) {}

  async search(
    query: string,
    topK: number = DEFAULT_TOP_K,
    filter?: DocumentSearchFilter,
  ): Promise<DocumentSearchResult[]> {
    const vector = await this.embedder.embedOne(query);
    return this.vectorStore.search(vector, topK, filter);
  }
}
