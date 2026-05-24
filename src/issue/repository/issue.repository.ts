import { Injectable } from '@nestjs/common';
import { Issue, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/service/prisma.service';

@Injectable()
export class IssueRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: Prisma.IssueCreateInput): Promise<Issue> {
    return this.prismaService.issue.create({ data });
  }

  async findMany(): Promise<Issue[]> {
    return this.prismaService.issue.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number): Promise<Issue | null> {
    return this.prismaService.issue.findUnique({ where: { id } });
  }

  async update(id: number, data: Prisma.IssueUpdateInput): Promise<Issue> {
    return this.prismaService.issue.update({ where: { id }, data });
  }

  async delete(id: number): Promise<Issue> {
    return this.prismaService.issue.delete({ where: { id } });
  }
}
