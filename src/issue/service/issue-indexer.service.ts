import { randomUUID } from 'node:crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { EMBEDDER } from '../../embedding/interface/embedder.interface';
import type { EmbedderInterface } from '../../embedding/interface/embedder.interface';
import { ISSUE_VECTOR_STORE } from '../../vector/interface/issue-vector-store.interface';
import type {
  IssuePayload,
  IssueVectorStore,
} from '../../vector/interface/issue-vector-store.interface';
import { IssueService } from './issue.service';

// 1 issue = 1 vector. 본문이 매우 길면 임베딩 토큰 한도(~8K) 주의
@Injectable()
export class IssueIndexerService {
  private readonly logger = new Logger(IssueIndexerService.name);

  constructor(
    @Inject(EMBEDDER) private readonly embedder: EmbedderInterface,
    @Inject(ISSUE_VECTOR_STORE)
    private readonly vectorStore: IssueVectorStore,
    private readonly issueService: IssueService,
  ) {}

  async index(issueId: number): Promise<void> {
    const issue = await this.issueService.findOne(issueId);
    const text = `${issue.title}\n${issue.body}`;

    const [vector] = await this.embedder.embedMany([text]);

    await this.vectorStore.deleteByIssueId(issueId);

    const point = {
      id: randomUUID(),
      vector,
      payload: {
        issueId,
        title: issue.title,
        category: issue.category,
        status: issue.status,
      } satisfies IssuePayload,
    };

    await this.vectorStore.upsert([point]);
    await this.issueService.markIndexed(issueId);

    this.logger.log(`이슈 ${issueId} 인덱싱 완료`);
  }
}
