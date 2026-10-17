import type { IncomingMessage, ServerResponse } from 'node:http';
export declare const handleResearch: (req: IncomingMessage, res: ServerResponse) => Promise<void>;
export declare const handleProposals: (req: IncomingMessage, res: ServerResponse) => Promise<void>;
