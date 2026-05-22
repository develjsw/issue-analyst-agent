import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { envValidationSchema } from './common/config/env.validation';
import { loggerConfig } from './common/logger/logger.config';
import { PrismaModule } from './common/prisma/prisma.module';
import { DocumentModule } from './document/document.module';
import { IssueModule } from './issue/issue.module';
import { RagModule } from './rag/rag.module';
import { VectorModule } from './vector/vector.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    LoggerModule.forRoot(loggerConfig),
    PrismaModule,
    IssueModule,
    DocumentModule,
    VectorModule,
    RagModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
