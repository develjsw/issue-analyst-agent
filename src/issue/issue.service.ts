import { Injectable, NotFoundException } from '@nestjs/common';
import { Issue } from '@prisma/client';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { IssueRepository } from './issue.repository';

@Injectable()
export class IssueService {
  constructor(private readonly repo: IssueRepository) {}

  create(dto: CreateIssueDto): Promise<Issue> {
    return this.repo.create(dto);
  }

  findAll(): Promise<Issue[]> {
    return this.repo.findMany();
  }

  async findOne(id: number): Promise<Issue> {
    const issue = await this.repo.findById(id);
    if (!issue) {
      throw new NotFoundException(`이슈를 찾을 수 없음: id=${id}`);
    }
    return issue;
  }

  async update(id: number, dto: UpdateIssueDto): Promise<Issue> {
    await this.findOne(id);
    return this.repo.update(id, dto);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
