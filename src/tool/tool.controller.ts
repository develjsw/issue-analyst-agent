import { Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IssueService } from '../issue/service/issue.service';
import { IssueClassificationDto } from './dto/issue-classification.dto';
import { IssueClassifierService } from './service/issue-classifier.service';

@ApiTags('Tool')
@Controller('tool')
export class ToolController {
  constructor(
    private readonly issueClassifierService: IssueClassifierService,
    private readonly issueService: IssueService,
  ) {}

  @Post('classify/:issueId')
  @ApiOperation({ summary: 'Tool Calling 기반 이슈 분류' })
  async classify(
    @Param('issueId', ParseIntPipe) issueId: number,
  ): Promise<IssueClassificationDto> {
    const result = await this.issueClassifierService.classify(issueId);
    await this.issueService.update(issueId, { category: result.category });
    return result;
  }
}
