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
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Issue } from '@prisma/client';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { IssueIndexerService } from './service/issue-indexer.service';
import { IssueService } from './service/issue.service';

@ApiTags('Issue')
@Controller('issue')
export class IssueController {
  constructor(
    private readonly issueService: IssueService,
    private readonly issueIndexer: IssueIndexerService,
  ) {}

  @Post()
  @ApiOperation({ summary: '이슈 등록' })
  async create(@Body() dto: CreateIssueDto): Promise<Issue> {
    return this.issueService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '이슈 목록 조회' })
  async findAll(): Promise<Issue[]> {
    return this.issueService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '이슈 단건 조회' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Issue> {
    return this.issueService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '이슈 수정' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIssueDto,
  ): Promise<Issue> {
    return this.issueService.update(id, dto);
  }

  @Post(':id/index')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '이슈 인덱싱 (1이슈=1벡터 → Qdrant 저장)' })
  async index(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.issueIndexer.index(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '이슈 삭제' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.issueService.remove(id);
  }
}
