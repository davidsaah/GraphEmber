export declare const EDITABLE_FIELDS: readonly string[];
export declare const emptyLog: () => { version: number; entries: never[] };
export declare class CurationError extends Error {}
export declare const pairKey: (a: string, b: string) => string;
export declare const applyCuration: (data: { entries: unknown[] }, input: unknown) => unknown;
