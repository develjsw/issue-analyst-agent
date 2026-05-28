import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import { DOCUMENT_VECTOR_STORE } from './interface/document-vector-store.interface';
import { ISSUE_VECTOR_STORE } from './interface/issue-vector-store.interface';
import { QdrantCollectionAdapter } from './service/qdrant-collection-adapter';
import { QdrantDocumentVectorStore } from './service/qdrant-document-vector-store.service';
import { QdrantIssueVectorStore } from './service/qdrant-issue-vector-store.service';

// text-embedding-3-small 차원에 맞춰 컬렉션 생성
// 임베딩 모델 변경으로 차원이 바뀌면 재인덱싱 필요
const EMBEDDING_DIMENSION = 1536;

const DOCUMENT_ADAPTER = Symbol('DOCUMENT_ADAPTER');
const ISSUE_ADAPTER = Symbol('ISSUE_ADAPTER');

// async factory로 adapter 생성과 컬렉션 보장을 한 단계에서 처리
// useFactory로 만든 provider도 OnModuleInit이 호출되긴 하나, ensure를 factory에 묶어두는 게 더 명시적
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
