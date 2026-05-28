import { Module } from '@nestjs/common';
import { EmbeddingModule } from '../embedding/embedding.module';
import { VectorModule } from '../vector/vector.module';
import { IssueController } from './issue.controller';
import { IssueRepository } from './repository/issue.repository';
import { IssueIndexerService } from './service/issue-indexer.service';
import { IssueService } from './service/issue.service';

@Module({
  imports: [VectorModule, EmbeddingModule],
  controllers: [IssueController],
  providers: [IssueService, IssueRepository, IssueIndexerService],
  exports: [IssueService, IssueIndexerService],
})
export class IssueModule {}
