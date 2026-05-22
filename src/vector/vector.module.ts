import { Module } from '@nestjs/common';
import { QdrantVectorStore } from './qdrant-vector-store';
import { VECTOR_STORE } from './vector-store.interface';

@Module({
  providers: [
    {
      provide: VECTOR_STORE,
      useClass: QdrantVectorStore,
    },
  ],
  exports: [VECTOR_STORE],
})
export class VectorModule {}
