import type { BaseMessage } from '@langchain/core/messages';
import type { StructuredToolInterface } from '@langchain/core/tools';
import { Inject, Injectable } from '@nestjs/common';
import type { ZodType } from 'zod';
import { LLM } from '../interface/llm.interface';
import type { LlmInterface } from '../interface/llm.interface';

@Injectable()
export class ToolRunnerService {
  constructor(@Inject(LLM) private readonly llm: LlmInterface) {}

  // tool_choice로 호출 강제
  async runSingleTool<T>(
    tool: StructuredToolInterface,
    schema: ZodType<T>,
    messages: BaseMessage[],
  ): Promise<T> {
    if (!this.llm.bindTools) {
      throw new Error('LLM이 tool calling을 지원하지 않음');
    }

    const llmWithTool = this.llm.bindTools([tool], { tool_choice: tool.name });
    const response = await llmWithTool.invoke(messages);

    const toolCall = response.tool_calls?.[0];
    if (!toolCall) {
      throw new Error(`LLM이 ${tool.name} tool을 호출하지 않음`);
    }

    // 외부 응답이라 런타임 재검증
    return schema.parse(toolCall.args);
  }
}
