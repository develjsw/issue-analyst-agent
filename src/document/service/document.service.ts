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
  constructor(private readonly documentRepository: DocumentRepository) {}

  async create(dto: CreateDocumentDto): Promise<Document> {
    return this.documentRepository.create(dto);
  }

  async findAll(query: QueryDocumentDto): Promise<PaginatedDocuments> {
    const { type, isIndexed, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.documentRepository.findMany({ type, isIndexed, skip, take: limit }),
      this.documentRepository.count({ type, isIndexed }),
    ]);

    return { items, total, page, limit };
  }

  async findOne(id: number): Promise<Document> {
    const doc = await this.documentRepository.findById(id);
    if (!doc) {
      throw new NotFoundException(`문서를 찾을 수 없음: id=${id}`);
    }
    return doc;
  }

  async update(id: number, dto: UpdateDocumentDto): Promise<Document> {
    await this.findOne(id);
    return this.documentRepository.update(id, dto);
  }

  async markIndexed(id: number): Promise<Document> {
    await this.findOne(id);
    return this.documentRepository.update(id, { isIndexed: true });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.documentRepository.delete(id);
  }
}
