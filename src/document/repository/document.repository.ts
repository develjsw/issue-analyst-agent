import { Injectable } from '@nestjs/common';
import { Document, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/service/prisma.service';

export interface FindManyFilter {
  type?: string;
  isIndexed?: boolean;
  skip: number;
  take: number;
}

@Injectable()
export class DocumentRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: Prisma.DocumentCreateInput): Promise<Document> {
    return this.prismaService.document.create({ data });
  }

  async findMany({
    type,
    isIndexed,
    skip,
    take,
  }: FindManyFilter): Promise<Document[]> {
    return this.prismaService.document.findMany({
      where: { type, isIndexed },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  async count(
    filter: Pick<FindManyFilter, 'type' | 'isIndexed'>,
  ): Promise<number> {
    return this.prismaService.document.count({
      where: { type: filter.type, isIndexed: filter.isIndexed },
    });
  }

  async findById(id: number): Promise<Document | null> {
    return this.prismaService.document.findUnique({ where: { id } });
  }

  async update(
    id: number,
    data: Prisma.DocumentUpdateInput,
  ): Promise<Document> {
    return this.prismaService.document.update({ where: { id }, data });
  }

  async delete(id: number): Promise<Document> {
    return this.prismaService.document.delete({ where: { id } });
  }
}
