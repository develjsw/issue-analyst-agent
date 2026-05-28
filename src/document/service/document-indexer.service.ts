import { randomUUID } from 'node:crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { EMBEDDER } from '../../embedding/interface/embedder.interface';
import type { EmbedderInterface } from '../../embedding/interface/embedder.interface';
import { DOCUMENT_VECTOR_STORE } from '../../vector/interface/document-vector-store.interface';
import type {
  DocumentChunkPayload,
  DocumentVectorStore,
} from '../../vector/interface/document-vector-store.interface';
import { chunkText } from '../helper/chunker';
import { DocumentService } from './document.service';

@Injectable()
export class DocumentIndexerService {
  private readonly logger = new Logger(DocumentIndexerService.name);

  constructor(
    @Inject(EMBEDDER) private readonly embedder: EmbedderInterface,
    @Inject(DOCUMENT_VECTOR_STORE)
    private readonly vectorStore: DocumentVectorStore,
    private readonly documentService: DocumentService,
  ) {}

  async index(documentId: number): Promise<void> {
    const doc = await this.documentService.findOne(documentId);

    const chunks = chunkText(doc.content);
    this.logger.log(`문서 ${documentId} 청킹 완료: ${chunks.length}개`);

    const vectors = await this.embedder.embedMany(chunks.map((c) => c.content));

    // 재인덱싱 대비 기존 벡터 제거
    await this.vectorStore.deleteByDocumentId(documentId);

    const points = chunks.map((chunk, i) => ({
      id: randomUUID(),
      vector: vectors[i],
      payload: {
        documentId,
        chunkIndex: chunk.index,
        content: chunk.content,
        type: doc.type,
        ...(doc.source && { source: doc.source }),
      } satisfies DocumentChunkPayload,
    }));

    await this.vectorStore.upsert(points);
    await this.documentService.markIndexed(documentId);

    this.logger.log(`문서 ${documentId} 인덱싱 완료`);
  }
}
