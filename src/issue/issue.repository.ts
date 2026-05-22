import { Injectable } from '@nestjs/common';
import { Issue, Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class IssueRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.IssueCreateInput): Promise<Issue> {
    return this.prisma.issue.create({ data });
  }

  findMany(): Promise<Issue[]> {
    return this.prisma.issue.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findById(id: number): Promise<Issue | null> {
    return this.prisma.issue.findUnique({ where: { id } });
  }

  update(id: number, data: Prisma.IssueUpdateInput): Promise<Issue> {
    return this.prisma.issue.update({ where: { id }, data });
  }

  delete(id: number): Promise<Issue> {
    return this.prisma.issue.delete({ where: { id } });
  }
}
