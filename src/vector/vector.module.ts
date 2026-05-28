import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import { DOCUMENT_VECTOR_STORE } from './interface/document-vector-store.interface';
import { ISSUE_VECTOR_STORE } from './interface/issue-vector-store.interface';
import { QdrantCollectionAdapter } from './service/qdrant-collection-adapter';
import { QdrantDocumentVectorStore } from './service/qdrant-document-vector-store.service';
import { QdrantIssueVectorStore } from './service/qdrant-issue-vector-store.service';

// text-embedding-3-small 차원. 모델 변경 시 재인덱싱 필요
const EMBEDDING_DIMENSION = 1536;

const DOCUMENT_ADAPTER = Symbol('DOCUMENT_ADAPTER');
const ISSUE_ADAPTER = Symbol('ISSUE_ADAPTER');

const buildAdapter = (collectionEnvKey: string, defaultName: string) => ({
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    const client = new QdrantClient({
      url: config.get<string>('QDRANT_URL'),
    });
    const collection = config.get<string>(collectionEnvKey, defaultName);
    const adapter = new QdrantCollectionAdapter(
      client,
      collection,
      EMBEDDING_DIMENSION,
    );
    await adapter.ensureCollection();
    return adapter;
  },
});

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DOCUMENT_ADAPTER,
      ...buildAdapter('QDRANT_COLLECTION_DOCUMENTS', 'documents'),
    },
    {
      provide: ISSUE_ADAPTER,
      ...buildAdapter('QDRANT_COLLECTION_ISSUES', 'issues'),
    },
    {
      provide: DOCUMENT_VECTOR_STORE,
      inject: [DOCUMENT_ADAPTER],
      useFactory: (adapter: QdrantCollectionAdapter) =>
        new QdrantDocumentVectorStore(adapter),
    },
    {
      provide: ISSUE_VECTOR_STORE,
      inject: [ISSUE_ADAPTER],
      useFactory: (adapter: QdrantCollectionAdapter) =>
        new QdrantIssueVectorStore(adapter),
    },
  ],
  exports: [DOCUMENT_VECTOR_STORE, ISSUE_VECTOR_STORE],
})
export class VectorModule {}
