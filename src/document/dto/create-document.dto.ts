import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DOCUMENT_TYPES } from '../constant/document-type';
import type { DocumentType } from '../constant/document-type';

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
  @IsIn(DOCUMENT_TYPES)
  type: DocumentType;

  @ApiProperty({
    required: false,
    example: 'https://wiki.internal/payments-api',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  source?: string;
}
