import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Document } from '@prisma/client';
import type { DocumentSearchResult } from '../vector/interface/document-vector-store.interface';
import { CreateDocumentDto } from './dto/create-document.dto';
import { QueryDocumentDto } from './dto/query-document.dto';
import { SearchDocumentDto } from './dto/search-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentIndexerService } from './service/document-indexer.service';
import { DocumentSearchService } from './service/document-search.service';
import {
  DocumentService,
  PaginatedDocuments,
} from './service/document.service';

@ApiTags('Document')
@Controller('document')
export class DocumentController {
  constructor(
    private readonly documentService: DocumentService,
    private readonly documentIndexer: DocumentIndexerService,
    private readonly documentSearch: DocumentSearchService,
  ) {}

  @Post()
  @ApiOperation({ summary: '문서 등록' })
  async create(@Body() dto: CreateDocumentDto): Promise<Document> {
    return this.documentService.create(dto);
  }

  @Post('search')
  @ApiOperation({ summary: '유사 문서 청크 검색' })
  async search(
    @Body() dto: SearchDocumentDto,
  ): Promise<DocumentSearchResult[]> {
    const { query, topK, type } = dto;
    return this.documentSearch.search(query, topK, { type });
  }

  @Get()
  @ApiOperation({
    summary: '문서 목록 조회 (타입·인덱싱 여부 필터, 페이지네이션)',
  })
  async findAll(@Query() query: QueryDocumentDto): Promise<PaginatedDocuments> {
    return this.documentService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '문서 단건 조회' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Document> {
    return this.documentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '문서 수정' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDocumentDto,
  ): Promise<Document> {
    return this.documentService.update(id, dto);
  }

  @Post(':id/index')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '문서 인덱싱 (청킹 → 임베딩 → Qdrant 저장)' })
  async index(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.documentIndexer.index(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '문서 삭제' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.documentService.remove(id);
  }
}
