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
import { CreateDocumentDto } from './dto/create-document.dto';
import { QueryDocumentDto } from './dto/query-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import {
  DocumentService,
  PaginatedDocuments,
} from './service/document.service';

@ApiTags('Document')
@Controller('document')
export class DocumentController {
  constructor(private readonly service: DocumentService) {}

  @Post()
  @ApiOperation({ summary: '문서 등록' })
  create(@Body() dto: CreateDocumentDto): Promise<Document> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: '문서 목록 조회 (타입·인덱싱 여부 필터, 페이지네이션)',
  })
  findAll(@Query() query: QueryDocumentDto): Promise<PaginatedDocuments> {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '문서 단건 조회' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Document> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '문서 수정' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDocumentDto,
  ): Promise<Document> {
    return this.service.update(id, dto);
  }

  @Patch(':id/index')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '문서 임베딩 완료 처리 (RAG 파이프라인 호출용)' })
  markIndexed(@Param('id', ParseIntPipe) id: number): Promise<Document> {
    return this.service.markIndexed(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '문서 삭제' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
