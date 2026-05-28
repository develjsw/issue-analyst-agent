export const ISSUE_VECTOR_STORE = Symbol('ISSUE_VECTOR_STORE');

// body는 제외 — payload 경량화, 필요 시 DB에서 lazy load
export interface IssuePayload {
  issueId: number;
  title: string;
  category: string | null;
  status: string;
}

export interface IssueVectorPoint {
  id: string;
  vector: number[];
  payload: IssuePayload;
}

export interface IssueSearchResult {
  score: number;
  payload: IssuePayload;
}

export interface IssueSearchFilter {
  issueId?: number;
  category?: string;
  status?: string;
}

export interface IssueVectorStore {
  upsert(points: IssueVectorPoint[]): Promise<void>;
  search(
    vector: number[],
    limit: number,
    filter?: IssueSearchFilter,
  ): Promise<IssueSearchResult[]>;
  deleteByIssueId(issueId: number): Promise<void>;
}
