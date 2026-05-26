export const ISSUE_STATUSES = ['OPEN', 'IN_PROGRESS', 'CLOSED'] as const;

export type IssueStatus = (typeof ISSUE_STATUSES)[number];
