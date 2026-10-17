import { createContext, useContext } from 'react';
import type { GraphNode } from '../types/graph';
import type { CurationInput, CurationLog } from './types';
import type { CurationMode } from './api';

// Shared by the dossier tools and the Inbox, so they don't need props threaded through the dossier.
export interface CurationContextValue {
  reviewer: string;
  setReviewer: (name: string) => void;
  mode: CurationMode;
  log: CurationLog | null;
  save: (input: CurationInput) => Promise<void>;
  // Opens the Inbox ready to research these entities on the web
  research: (nodes: GraphNode[]) => void;
  researchAvailable: boolean;
  // Web findings waiting for review that mention this entity
  pendingFor: (nodeId: string) => number;
  openInbox: (tab?: 'pending' | 'duplicates') => void;
}

export const CurationContext = createContext<CurationContextValue | null>(null);

export const useCuration = () => useContext(CurationContext);

const REVIEWER_KEY = 'graphember.reviewer';
export const readReviewer = () => {
  try {
    return localStorage.getItem(REVIEWER_KEY) || '';
  } catch {
    return '';
  }
};
export const storeReviewer = (name: string) => {
  try {
    localStorage.setItem(REVIEWER_KEY, name);
  } catch {
    /* per-viewer convenience only */
  }
};
