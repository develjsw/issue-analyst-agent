import { Injectable } from '@nestjs/common';
import { Document, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface FindManyFilter {
  type?: string;
  isIndexed?: boolean;
  skip: number;
  take: number;
}

@Injectable()
export class DocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.DocumentCreateInput): Promise<Document> {
    return this.prisma.document.create({ data });
  }

  findMany({
    type,
    isIndexed,
    skip,
    take,
  }: FindManyFilter): Promise<Document[]> {
    return this.prisma.document.findMany({
      where: { type, isIndexed },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  count(filter: Pick<FindManyFilter, 'type' | 'isIndexed'>): Promise<number> {
    return this.prisma.document.count({
      where: { type: filter.type, isIndexed: filter.isIndexed },
    });
  }

  findById(id: number): Promise<Document | null> {
    return this.prisma.document.findUnique({ where: { id } });
  }

  update(id: number, data: Prisma.DocumentUpdateInput): Promise<Document> {
    return this.prisma.document.update({ where: { id }, data });
  }

  delete(id: number): Promise<Document> {
    return this.prisma.document.delete({ where: { id } });
  }
}
