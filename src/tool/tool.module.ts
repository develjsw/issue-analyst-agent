import { Module } from '@nestjs/common';
import { IssueModule } from '../issue/issue.module';
import { LlmModule } from '../llm/llm.module';
import { ToolController } from './tool.controller';
import { IssueClassifierService } from './service/issue-classifier.service';

@Module({
  imports: [LlmModule, IssueModule],
  controllers: [ToolController],
  providers: [IssueClassifierService],
})
export class ToolModule {}
