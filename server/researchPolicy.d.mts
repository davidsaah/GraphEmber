export declare const LIMITS: {
  maxTargets: number;
  searchesPerTarget: number;
  maxSearches: number;
  maxFetches: number;
  maxFindings: number;
  maxQuoteWords: number;
  staleYears: number;
};
export declare const hostOf: (url: string) => string;
export declare const canApprove: (proposal: { sources: { verification?: string }[] }, override?: boolean) => boolean;
