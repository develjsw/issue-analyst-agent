import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { DOCUMENT_TYPES } from './create-document.dto';

export class QueryDocumentDto {
  @ApiProperty({ required: false, enum: DOCUMENT_TYPES })
  @IsOptional()
  @IsString()
  @IsIn(DOCUMENT_TYPES)
  type?: string;

  @ApiProperty({ required: false, description: '임베딩 완료 여부 필터' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isIndexed?: boolean;

  @ApiProperty({ required: false, default: 1, minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(String(value), 10))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => parseInt(String(value), 10))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
