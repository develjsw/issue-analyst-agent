import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { Injectable, Logger } from '@nestjs/common';
import { ISSUE_CATEGORIES } from '../../issue/constant/issue-category';
import { IssueService } from '../../issue/service/issue.service';
import { ToolRunnerService } from '../../llm/service/tool-runner.service';
import {
  classifyIssueTool,
  issueClassificationSchema,
} from '../tools/classify-issue.tool';
import type { IssueClassification } from '../tools/classify-issue.tool';

const SYSTEM_PROMPT = `당신은 백엔드 이슈를 분류하는 분석가임.
주어진 이슈를 반드시 classify_issue tool을 호출해 분류함.
category는 다음 중 가장 적합한 하나를 고름: ${ISSUE_CATEGORIES.join(', ')}.
어디에도 명확히 속하지 않으면 ETC를 사용함.
reason에는 그렇게 분류한 근거를 한국어로 간결히 작성함.`;

@Injectable()
export class IssueClassifierService {
  private readonly logger = new Logger(IssueClassifierService.name);

  constructor(
    private readonly toolRunner: ToolRunnerService,
    private readonly issueService: IssueService,
  ) {}

  // 분류 결과만 반환하고 저장은 호출측이 결정함 (CQS)
  async classify(issueId: number): Promise<IssueClassification> {
    const issue = await this.issueService.findOne(issueId);

    const result = await this.toolRunner.runSingleTool(
      classifyIssueTool,
      issueClassificationSchema,
      [
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(`제목: ${issue.title}\n본문: ${issue.body}`),
      ],
    );
    this.logger.log(`이슈 ${issueId} 분류: ${result.category}`);

    return result;
  }
}
