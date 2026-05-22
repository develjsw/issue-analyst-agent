import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentRepository } from './repository/document.repository';
import { DocumentService } from './service/document.service';

@Module({
  controllers: [DocumentController],
  providers: [DocumentService, DocumentRepository],
  exports: [DocumentService], // RAG 모듈에서 markIndexed 호출 대비
})
export class DocumentModule {}
