import { Inject, Injectable, Logger } from '@nestjs/common';
import { VECTOR_STORE } from '../../vector/vector-store.interface';
import type {
  SearchFilter,
  SearchResult,
  VectorStore,
} from '../../vector/vector-store.interface';
import { DocumentService } from '../../document/service/document.service';
import { TextChunker } from './text-chunker.service';
import { EmbeddingService } from './embedding.service';
import { RetrieverService } from './retriever.service';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    private readonly chunker: TextChunker,
    private readonly embedding: EmbeddingService,
    private readonly retriever: RetrieverService,
    @Inject(VECTOR_STORE) private readonly vectorStore: VectorStore,
    private readonly documentService: DocumentService,
  ) {}

  // 문서 1건을 청킹 → 임베딩 → Qdrant 저장 → isIndexed=true
  async indexDocument(documentId: number): Promise<void> {
    const doc = await this.documentService.findOne(documentId);

    // 이미 인덱싱된 문서는 재인덱싱 전에 기존 벡터 삭제
    if (doc.isIndexed) {
      await this.vectorStore.deleteByDocumentId(documentId);
    }

    const chunks = this.chunker.split(doc.content);
    this.logger.log(`문서 ${documentId} 청킹 완료: ${chunks.length}개`);

    const vectors = await this.embedding.embedMany(
      chunks.map((c) => c.content),
    );

    const points = chunks.map((chunk, i) => ({
      id: `${documentId}-${chunk.index}`,
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

  retrieve(
    query: string,
    topK?: number,
    filter?: SearchFilter,
  ): Promise<SearchResult[]> {
    return this.retriever.retrieve(query, topK, filter);
  }
}
