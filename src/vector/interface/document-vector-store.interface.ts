export const DOCUMENT_VECTOR_STORE = Symbol('DOCUMENT_VECTOR_STORE');

export interface DocumentChunkPayload {
  documentId: number;
  chunkIndex: number;
  content: string;
  type: string; // DocumentType
  source?: string;
}

export interface DocumentVectorPoint {
  id: string;
  vector: number[];
  payload: DocumentChunkPayload;
}

export interface DocumentSearchResult {
  score: number;
  payload: DocumentChunkPayload;
}

export interface DocumentSearchFilter {
  type?: string;
  documentId?: number;
}

export interface DocumentVectorStore {
  upsert(points: DocumentVectorPoint[]): Promise<void>;
  search(
    vector: number[],
    limit: number,
    filter?: DocumentSearchFilter,
  ): Promise<DocumentSearchResult[]>;
  deleteByDocumentId(documentId: number): Promise<void>;
}
