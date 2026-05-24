import { randomUUID } from 'node:crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { VECTOR_STORE } from '../../vector/interface/vector-store.interface';
import type {
  SearchFilter,
  SearchResult,
  VectorStoreInterface,
} from '../../vector/interface/vector-store.interface';
import { EMBEDDER } from '../../embedding/interface/embedder.interface';
import type { EmbedderInterface } from '../../embedding/interface/embedder.interface';
import { DocumentService } from '../../document/service/document.service';
import { chunkText } from '../helper/chunker';
import { RetrieverService } from './retriever.service';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    @Inject(EMBEDDER) private readonly embedder: EmbedderInterface,
    @Inject(VECTOR_STORE) private readonly vectorStore: VectorStoreInterface,
    private readonly retrieverService: RetrieverService,
    private readonly documentService: DocumentService,
  ) {}

  // 문서 1건을 청킹 → 임베딩 → Qdrant 저장 → isIndexed=true
  async indexDocument(documentId: number): Promise<void> {
    const doc = await this.documentService.findOne(documentId);

    const chunks = chunkText(doc.content);
    this.logger.log(`문서 ${documentId} 청킹 완료: ${chunks.length}개`);

    const vectors = await this.embedder.embedMany(chunks.map((c) => c.content));

    // 재인덱싱 시 고아벡터 방지를 위해 기존벡터 제거
    await this.vectorStore.deleteById(documentId);

    const points = chunks.map((chunk, i) => ({
      id: randomUUID(),
      vector: vectors[i],
      payload: {
        documentId,
        chunkIndex: chunk.index,
        content: chunk.content,
        type: doc.type,
        ...(doc.source && { source: doc.source }),
      },
    }));

    await this.vectorStore.upsert(points);
    await this.documentService.markIndexed(documentId);

    this.logger.log(`문서 ${documentId} 인덱싱 완료`);
  }

  async retrieve(
    query: string,
    topK?: number,
    filter?: SearchFilter,
  ): Promise<SearchResult[]> {
    return this.retrieverService.retrieve(query, topK, filter);
  }
}
