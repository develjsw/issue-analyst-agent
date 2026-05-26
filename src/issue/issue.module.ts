import { Module } from '@nestjs/common';
import { IssueController } from './issue.controller';
import { IssueRepository } from './repository/issue.repository';
import { IssueService } from './service/issue.service';

@Module({
  controllers: [IssueController],
  providers: [IssueService, IssueRepository],
  exports: [IssueService], // tool 모듈이 분류 시 이슈 조회·갱신에 사용
})
export class IssueModule {}
