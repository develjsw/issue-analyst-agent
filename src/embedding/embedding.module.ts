import { Module } from '@nestjs/common';
import { EMBEDDER } from './interface/embedder.interface';
import { OpenAIEmbedderService } from './service/openai-embedder.service';

@Module({
  providers: [
    {
      provide: EMBEDDER,
      useClass: OpenAIEmbedderService,
    },
  ],
  exports: [EMBEDDER],
})
export class EmbeddingModule {}
