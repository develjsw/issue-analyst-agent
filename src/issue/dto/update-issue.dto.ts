import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { CreateIssueDto } from './create-issue.dto';

export class UpdateIssueDto extends PartialType(CreateIssueDto) {
  @ApiProperty({ required: false, enum: ['OPEN', 'IN_PROGRESS', 'CLOSED'] })
  @IsOptional()
  @IsString()
  @IsIn(['OPEN', 'IN_PROGRESS', 'CLOSED'])
  status?: string;
}
