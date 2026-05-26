import { Module } from '@nestjs/common';
import { DocumentModule } from '../document/document.module';
import { EmbeddingModule } from '../embedding/embedding.module';
import { VectorModule } from '../vector/vector.module';
import { RagController } from './rag.controller';
import { RagService } from './service/rag.service';
import { RetrieverService } from './service/retriever.service';

@Module({
  imports: [VectorModule, EmbeddingModule, DocumentModule],
  controllers: [RagController],
  providers: [RagService, RetrieverService],
  exports: [RagService],
})
export class RagModule {}
