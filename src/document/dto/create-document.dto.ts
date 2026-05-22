import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export const DOCUMENT_TYPES = [
  'API_DOC',
  'PLANNING_DOC',
  'ERROR_LOG',
  'ISSUE_HISTORY',
] as const;

export class CreateDocumentDto {
  @ApiProperty({ example: '결제 API v2 명세서' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'POST /payments\nRequest: { orderId, amount }...' })
  @IsString()
  @MinLength(1)
  content: string;

  @ApiProperty({ enum: DOCUMENT_TYPES, example: 'API_DOC' })
  @IsString()
  @IsIn(DOCUMENT_TYPES)
  type: string;

  @ApiProperty({
    required: false,
    example: 'https://wiki.internal/payments-api',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  source?: string;
}
