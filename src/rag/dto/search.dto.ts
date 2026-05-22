import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { DOCUMENT_TYPES } from '../../document/dto/create-document.dto';

export class SearchDto {
  @IsString()
  @MinLength(1)
  query: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  topK?: number;

  @IsOptional()
  @IsString()
  @IsIn(DOCUMENT_TYPES)
  type?: string;
}
