import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

const MODEL = 'text-embedding-3-small';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly openai: OpenAI;

  constructor(private readonly config: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.config.getOrThrow<string>('OPENAI_API_KEY'),
    });
  }

  async embedMany(texts: string[]): Promise<number[][]> {
    this.logger.debug(`임베딩 요청: ${texts.length}개 청크`);

    const response = await this.openai.embeddings.create({
      model: MODEL,
      input: texts,
    });

    // API 응답은 입력 순서를 보장하지 않으므로 index 기준으로 정렬
    return response.data
      .sort((a, b) => a.index - b.index)
      .map((item) => item.embedding);
  }

  async embedOne(text: string): Promise<number[]> {
    const [vector] = await this.embedMany([text]);
    return vector;
  }
}
