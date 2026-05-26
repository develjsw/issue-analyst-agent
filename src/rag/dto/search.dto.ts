import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { DOCUMENT_TYPES } from '../../document/constant/document-type';
import type { DocumentType } from '../../document/constant/document-type';

export class SearchDto {
  @ApiProperty({ example: '결제 후 주문 상태가 변경되지 않는 문제' })
  @IsString()
  @MinLength(1)
  query: string;

  @ApiProperty({
    required: false,
    default: 5,
    minimum: 1,
    description: '반환할 상위 결과 개수',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  topK?: number;

  @ApiProperty({
    required: false,
    enum: DOCUMENT_TYPES,
    description: '문서 타입 필터',
  })
  @IsOptional()
  @IsIn(DOCUMENT_TYPES)
  type?: DocumentType;
}
