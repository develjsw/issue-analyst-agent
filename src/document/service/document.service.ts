import { Injectable, NotFoundException } from '@nestjs/common';
import { Document } from '@prisma/client';
import { CreateDocumentDto } from '../dto/create-document.dto';
import { QueryDocumentDto } from '../dto/query-document.dto';
import { UpdateDocumentDto } from '../dto/update-document.dto';
import { DocumentRepository } from '../repository/document.repository';

export interface PaginatedDocuments {
  items: Document[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class DocumentService {
  constructor(private readonly repo: DocumentRepository) {}

  create(dto: CreateDocumentDto): Promise<Document> {
    return this.repo.create(dto);
  }

  async findAll(query: QueryDocumentDto): Promise<PaginatedDocuments> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.repo.findMany({
        type: query.type,
        isIndexed: query.isIndexed,
        skip,
        take: limit,
      }),
      this.repo.count({ type: query.type, isIndexed: query.isIndexed }),
    ]);

    return { items, total, page, limit };
  }

  async findOne(id: number): Promise<Document> {
    const doc = await this.repo.findById(id);
    if (!doc) {
      throw new NotFoundException(`문서를 찾을 수 없음: id=${id}`);
    }
    return doc;
  }

  async update(id: number, dto: UpdateDocumentDto): Promise<Document> {
    await this.findOne(id);
    return this.repo.update(id, dto);
  }

  // RAG 파이프라인이 임베딩 완료 후 호출
  async markIndexed(id: number): Promise<Document> {
    await this.findOne(id);
    return this.repo.update(id, { isIndexed: true });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
