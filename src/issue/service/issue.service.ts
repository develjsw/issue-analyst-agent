import { Injectable, NotFoundException } from '@nestjs/common';
import { Issue } from '@prisma/client';
import { CreateIssueDto } from '../dto/create-issue.dto';
import { UpdateIssueDto } from '../dto/update-issue.dto';
import { IssueRepository } from '../repository/issue.repository';

@Injectable()
export class IssueService {
  constructor(private readonly issueRepository: IssueRepository) {}

  async create(dto: CreateIssueDto): Promise<Issue> {
    return this.issueRepository.create(dto);
  }

  async findAll(): Promise<Issue[]> {
    return this.issueRepository.findMany();
  }

  async findOne(id: number): Promise<Issue> {
    const issue = await this.issueRepository.findById(id);
    if (!issue) {
      throw new NotFoundException(`이슈를 찾을 수 없음: id=${id}`);
    }
    return issue;
  }

  async update(id: number, dto: UpdateIssueDto): Promise<Issue> {
    await this.findOne(id);
    return this.issueRepository.update(id, dto);
  }

  async markIndexed(id: number): Promise<Issue> {
    await this.findOne(id);
    return this.issueRepository.update(id, { isIndexed: true });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.issueRepository.delete(id);
  }
}
