import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { ISSUE_STATUSES } from '../constant/issue-status';
import type { IssueStatus } from '../constant/issue-status';
import { CreateIssueDto } from './create-issue.dto';

export class UpdateIssueDto extends PartialType(CreateIssueDto) {
  @ApiProperty({ required: false, enum: ISSUE_STATUSES })
  @IsOptional()
  @IsIn(ISSUE_STATUSES)
  status?: IssueStatus;
}
