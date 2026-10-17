export type EditableField = 'label' | 'description' | 'acronym' | 'website' | 'location' | 'tags';

interface EntryBase {
  id: string;
  by: string;
  at: string;
  note?: string;
  undoneBy?: string;
  undoneAt?: string;
}

export interface EditEntry extends EntryBase {
  type: 'edit';
  nodeId: string;
  changes: Partial<Record<EditableField, { from: string | string[]; to: string | string[] }>>;
}

export interface MergeEntry extends EntryBase {
  type: 'merge';
  keepId: string;
  mergeId: string;
  keepLabel?: string;
  mergeLabel?: string;
  reasons?: string[];
}

export interface DismissEntry extends EntryBase {
  type: 'dismiss';
  pair: string;
  aLabel?: string;
  bLabel?: string;
}

export type CurationEntry = EditEntry | MergeEntry | DismissEntry;

export interface CurationLog {
  version: number;
  entries: CurationEntry[];
}

export type CurationInput =
  | { type: 'edit'; nodeId: string; changes: EditEntry['changes']; note?: string }
  | { type: 'merge'; keepId: string; mergeId: string; keepLabel: string; mergeLabel: string; reasons?: string[] }
  | { type: 'dismiss'; aId: string; bId: string; aLabel: string; bLabel: string }
  | { type: 'undo'; entryId: string };
