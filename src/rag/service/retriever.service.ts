import { Inject, Injectable } from '@nestjs/common';
import { VECTOR_STORE } from '../../vector/interface/vector-store.interface';
import type {
  SearchFilter,
  SearchResult,
  VectorStoreInterface,
} from '../../vector/interface/vector-store.interface';
import { EMBEDDER } from '../../embedding/interface/embedder.interface';
import type { EmbedderInterface } from '../../embedding/interface/embedder.interface';

const DEFAULT_TOP_K = 5;

@Injectable()
export class RetrieverService {
  constructor(
    @Inject(VECTOR_STORE) private readonly vectorStore: VectorStoreInterface,
    @Inject(EMBEDDER) private readonly embedder: EmbedderInterface,
  ) {}

  async retrieve(
    query: string,
    topK: number = DEFAULT_TOP_K,
    filter?: SearchFilter,
  ): Promise<SearchResult[]> {
    const vector = await this.embedder.embedOne(query);
    return this.vectorStore.search(vector, topK, filter);
  }
}
