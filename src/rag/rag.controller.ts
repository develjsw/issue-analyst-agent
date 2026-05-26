import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { SearchResult } from '../vector/interface/vector-store.interface';
import { SearchDto } from './dto/search.dto';
import { RagService } from './service/rag.service';

@ApiTags('RAG')
@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('index/:documentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '문서 인덱싱 (청킹 → 임베딩 → Qdrant 저장)' })
  async indexDocument(
    @Param('documentId', ParseIntPipe) documentId: number,
  ): Promise<void> {
    return this.ragService.indexDocument(documentId);
  }

  @Post('search')
  @ApiOperation({ summary: '유사 청크 검색' })
  async search(@Body() dto: SearchDto): Promise<SearchResult[]> {
    const { query, topK, type } = dto;
    return this.ragService.retrieve(query, topK, { type });
  }
}
