import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ISSUE_CATEGORIES } from '../constant/issue-category';
import type { IssueCategory } from '../constant/issue-category';

export class CreateIssueDto {
  @ApiProperty({ example: '결제 완료 후 주문 상태가 변경되지 않음' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: '결제 승인 콜백 이후 order_status가 PAID로 갱신되지 않음',
  })
  @IsString()
  @MinLength(1)
  body: string;

  @ApiProperty({ required: false, enum: ISSUE_CATEGORIES, example: 'BUG' })
  @IsOptional()
  @IsIn(ISSUE_CATEGORIES)
  category?: IssueCategory;
}
