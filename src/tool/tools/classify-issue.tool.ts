import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { ISSUE_CATEGORIES } from '../../issue/constant/issue-category';

// LLM이 반환할 분류 결과 구조
export const issueClassificationSchema = z.object({
  category: z.enum(ISSUE_CATEGORIES).describe('이슈 분류 카테고리'),
  reason: z.string().describe('해당 카테고리로 분류한 근거 (한국어 1~2문장)'),
});

export type IssueClassification = z.infer<typeof issueClassificationSchema>;

// 분류값은 tool_call args로 받음 - 실행 결과는 안 씀
export const classifyIssueTool = tool((args) => JSON.stringify(args), {
  name: 'classify_issue',
  description: '백엔드 이슈를 정해진 카테고리 중 가장 적합한 하나로 분류함',
  schema: issueClassificationSchema,
});
