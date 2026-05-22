import { Inject, Injectable } from '@nestjs/common';
import { VECTOR_STORE } from '../../vector/vector-store.interface';
import type {
  SearchFilter,
  SearchResult,
  VectorStore,
} from '../../vector/vector-store.interface';
import { EmbeddingService } from './embedding.service';

const DEFAULT_TOP_K = 5;

@Injectable()
export class RetrieverService {
  constructor(
    @Inject(VECTOR_STORE) private readonly vectorStore: VectorStore,
    private readonly embedding: EmbeddingService,
  ) {}

  async retrieve(
    query: string,
    topK: number = DEFAULT_TOP_K,
    filter?: SearchFilter,
  ): Promise<SearchResult[]> {
    const vector = await this.embedding.embedOne(query);
    return this.vectorStore.search(vector, topK, filter);
  }
}
