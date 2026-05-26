export const ISSUE_CATEGORIES = [
  'BUG',
  'API_ERROR',
  'SPEC_QUESTION',
  'DATA_ISSUE',
  'PERFORMANCE',
  'ENV_CONFIG',
  'ETC',
] as const;

export type IssueCategory = (typeof ISSUE_CATEGORIES)[number];
