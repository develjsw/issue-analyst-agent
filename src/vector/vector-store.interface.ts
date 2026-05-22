export const VECTOR_STORE = Symbol('VECTOR_STORE');

// Qdrant에 저장되는 청크 단위 메타데이터
export interface ChunkPayload {
  documentId: number;
  chunkIndex: number;
  content: string;
  type: string; // Document.type과 동일 — Qdrant 메타 필터링에 활용
  source?: string;
}

export interface VectorPoint {
  id: string; // `${documentId}-${chunkIndex}`
  vector: number[];
  payload: ChunkPayload;
}

export interface SearchResult {
  score: number;
  payload: ChunkPayload;
}

export interface SearchFilter {
  type?: string;
}

export interface VectorStore {
  upsert(points: VectorPoint[]): Promise<void>;
  search(
    vector: number[],
    limit: number,
    filter?: SearchFilter,
  ): Promise<SearchResult[]>;
  deleteByDocumentId(documentId: number): Promise<void>;
}
