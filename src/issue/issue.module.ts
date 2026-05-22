import { Module } from '@nestjs/common';
import { IssueController } from './issue.controller';
import { IssueRepository } from './repository/issue.repository';
import { IssueService } from './service/issue.service';

@Module({
  controllers: [IssueController],
  providers: [IssueService, IssueRepository],
})
export class IssueModule {}
