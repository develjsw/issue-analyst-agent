export const DOCUMENT_TYPES = [
  'API_DOC',
  'PLANNING_DOC',
  'ERROR_LOG',
  'ISSUE_HISTORY',
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];
