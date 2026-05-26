import { ApiProperty } from '@nestjs/swagger';
import { ISSUE_CATEGORIES } from '../../issue/constant/issue-category';
import type { IssueCategory } from '../../issue/constant/issue-category';

export class IssueClassificationDto {
  @ApiProperty({ enum: ISSUE_CATEGORIES, example: 'BUG' })
  category: IssueCategory;

  @ApiProperty({
    example: '결제 콜백 후 상태 미갱신은 로직 결함이므로 BUG로 분류',
  })
  reason: string;
}
