import { Module } from '@nestjs/common';
import { EmbeddingModule } from '../embedding/embedding.module';
import { VectorModule } from '../vector/vector.module';
import { DocumentController } from './document.controller';
import { DocumentRepository } from './repository/document.repository';
import { DocumentIndexerService } from './service/document-indexer.service';
import { DocumentSearchService } from './service/document-search.service';
import { DocumentService } from './service/document.service';

@Module({
  imports: [VectorModule, EmbeddingModule],
  controllers: [DocumentController],
  providers: [
    DocumentService,
    DocumentRepository,
    DocumentIndexerService,
    DocumentSearchService,
  ],
  exports: [DocumentService, DocumentSearchService],
})
export class DocumentModule {}
