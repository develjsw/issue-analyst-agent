import { Module } from '@nestjs/common';
import { VECTOR_STORE } from './interface/vector-store.interface';
import { QdrantVectorStoreService } from './service/qdrant-vector-store.service';

@Module({
  providers: [
    {
      provide: VECTOR_STORE,
      useClass: QdrantVectorStoreService,
    },
  ],
  exports: [VECTOR_STORE],
})
export class VectorModule {}
