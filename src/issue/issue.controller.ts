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
import { IssueService } from './service/issue.service';

@ApiTags('Issue')
@Controller('issue')
export class IssueController {
  constructor(private readonly service: IssueService) {}

  @Post()
  @ApiOperation({ summary: '이슈 등록' })
  create(@Body() dto: CreateIssueDto): Promise<Issue> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '이슈 목록 조회' })
  findAll(): Promise<Issue[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '이슈 단건 조회' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Issue> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '이슈 수정' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIssueDto,
  ): Promise<Issue> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '이슈 삭제' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
