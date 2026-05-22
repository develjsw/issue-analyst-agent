import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { CreateIssueDto } from './create-issue.dto';

export class UpdateIssueDto extends PartialType(CreateIssueDto) {
  @ApiProperty({ required: false, enum: ['open', 'in_progress', 'closed'] })
  @IsOptional()
  @IsString()
  @IsIn(['open', 'in_progress', 'closed'])
  status?: string;
}
