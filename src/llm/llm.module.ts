import { ChatOpenAI } from '@langchain/openai';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLM } from './interface/llm.interface';
import type { LlmInterface } from './interface/llm.interface';
import { ToolRunnerService } from './service/tool-runner.service';

// 재현성 위해 별칭 대신 날짜 스냅샷 고정
const MODEL = 'gpt-4o-mini-2024-07-18';

@Module({
  providers: [
    {
      provide: LLM,
      useFactory: (configService: ConfigService): LlmInterface =>
        new ChatOpenAI({
          apiKey: configService.getOrThrow<string>('OPENAI_API_KEY'),
          model: MODEL,
          temperature: 0,
          timeout: 30000, // 외부 LLM 행(hang) 방지
          maxRetries: 2,
        }),
      inject: [ConfigService],
    },
    ToolRunnerService,
  ],
  exports: [LLM, ToolRunnerService],
})
export class LlmModule {}
