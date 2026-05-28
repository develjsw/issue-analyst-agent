export const ISSUE_VECTOR_STORE = Symbol('ISSUE_VECTOR_STORE');

// 1이슈=1벡터, payload는 검색 결과 즉시 표시용 최소만
// 본문(body)은 호출측이 DB에서 lazy load (payload 경량화)
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
