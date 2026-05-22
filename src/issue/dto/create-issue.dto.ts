import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

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

  @ApiProperty({ required: false, example: '결제' })
  @IsOptional()
  @IsString()
  category?: string;
}
