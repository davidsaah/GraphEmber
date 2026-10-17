import type { NodeType, RelationType } from '../types/graph';

export type Verification = 'verified' | 'partial' | 'missing' | 'pdf' | 'unreachable';
export type SourceTier = 'primary' | 'secondary' | 'weak';

export interface ProposalSource {
  url: string;
  title: string;
  publisher: string;
  published?: string;
  quote: string;
  quoteTrimmed?: boolean;
  tier: SourceTier;
  verification: Verification;
  verificationNote?: string;
}

export type ProposalKind = 'connection' | 'entity' | 'update' | 'impact';
export type ProposalStatus = 'pending' | 'approved' | 'rejected';

// One web finding waiting for, or past, human review. Written by server/research.mjs.
export interface Proposal {
  id: string;
  runId?: string;
  status: ProposalStatus;
  kind: ProposalKind;
  subjectId: string;
  summary: string;
  date?: string;
  targetId?: string;
  targetName?: string;
  targetType?: NodeType;
  relation?: RelationType;
  direction?: 'subject_to_target' | 'target_to_subject';
  how?: string;
  field?: 'description' | 'location' | 'website' | 'status';
  value?: string;
  metric?: string;
  unit?: string;
  sources: ProposalSource[];
  confidence: 'high' | 'medium' | 'low';
  flags: string[];
  visibility: 'public' | 'internal';
  fingerprint: string;
  foundAt: string;
  decidedBy?: string;
  decidedAt?: string;
  rejectReason?: string;
  override?: boolean;
  edits?: Record<string, { from: string | null; to: string }>;
}

export interface ResearchRun {
  id: string;
  at: string;
  targets: { id: string; name: string }[];
  queries: string[];
  resultsSeen: number;
  found: number;
  dropped: { summary: string; reason: string }[];
  refused?: boolean;
  incomplete?: boolean;
}

export interface ReviewQueue {
  version: number;
  proposals: Proposal[];
  runs: ResearchRun[];
}

export type Decision = 'approve' | 'reject' | 'revert';

export interface DecisionInput {
  id: string;
  decision: Decision;
  reviewer: string;
  reason?: string;
  edits?: Partial<Record<'summary' | 'how' | 'value' | 'metric' | 'unit' | 'targetName', string>>;
  override?: boolean;
}
