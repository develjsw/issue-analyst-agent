import { Module } from '@nestjs/common';
import { DocumentModule } from '../document/document.module';
import { VectorModule } from '../vector/vector.module';
import { RagController } from './rag.controller';
import { EmbeddingService } from './service/embedding.service';
import { RagService } from './service/rag.service';
import { RetrieverService } from './service/retriever.service';
import { TextChunker } from './service/text-chunker.service';

@Module({
  imports: [VectorModule, DocumentModule],
  controllers: [RagController],
  providers: [RagService, TextChunker, EmbeddingService, RetrieverService],
})
export class RagModule {}
