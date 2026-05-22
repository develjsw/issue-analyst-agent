import { Module } from '@nestjs/common';
import { DocumentModule } from '../document/document.module';
import { VectorModule } from '../vector/vector.module';
import { TextChunker } from './chunker/text-chunker';
import { EmbeddingService } from './embedding/embedding.service';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { RetrieverService } from './retriever/retriever.service';

@Module({
  imports: [VectorModule, DocumentModule],
  controllers: [RagController],
  providers: [RagService, TextChunker, EmbeddingService, RetrieverService],
})
export class RagModule {}
