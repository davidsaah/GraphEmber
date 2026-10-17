import { CHAT_RULES } from '../../server/rules.mjs';

// Two ways to reach Claude:
// 1. Inside a claude.ai artifact, the host's `sample` capability (viewer's own Claude account).
// 2. Anywhere else, the app's own /api/chat endpoint (server/chat.mjs, needs ANTHROPIC_API_KEY).

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface AskOptions {
  context: string;
  turns: ChatTurn[];
  onText: (text: string) => void;
  signal: AbortSignal;
}

export class ChatError extends Error {
  code: string;
  partial?: string;
  constructor(code: string, message: string, partial?: string) {
    super(message);
    this.code = code;
    this.partial = partial;
  }
}

interface SampleFn {
  (
    input: ChatTurn[],
    opts: { cache: boolean; signal: AbortSignal; onText: (u: { text: string }) => void },
  ): Promise<{ text: string; truncated: boolean }>;
}

interface ClaudeHost {
  use?: (name: string) => Promise<unknown>;
}

const host = (): ClaudeHost | undefined => (window as unknown as { claude?: ClaudeHost }).claude;

let samplePromise: Promise<SampleFn | null> | null = null;
const getSample = () => {
  const claude = host();
  if (!claude?.use) return Promise.resolve(null);
  samplePromise ??= claude.use('sample').then((s) => (s as SampleFn | null) ?? null).catch(() => null);
  return samplePromise;
};

export const isArtifactHost = () => typeof host()?.use === 'function';

const MESSAGES: Record<string, string> = {
  not_granted: 'Chat needs permission to use your Claude account. Reopen the page and allow it to try again.',
  sampling_disabled: 'Chat is turned off for this page.',
  rate_limited: 'Too many questions at once. Give it a moment and ask again.',
  prompt_too_large: 'That conversation got too long. Clear it and start a new question.',
  refused: 'Claude declined to answer that one.',
  unavailable: 'Chat is not set up here. Start the app with npm run dev or npm start and set ANTHROPIC_API_KEY.',
};

export const describeError = (err: unknown): string => {
  if (err instanceof ChatError) return MESSAGES[err.code] || err.message || 'Something went wrong. Try again.';
  return 'Something went wrong. Try again.';
};

const viaSample = async (sample: SampleFn, { context, turns, onText, signal }: AskOptions) => {
  // `sample` is memoryless and has no system role: fold the rules and data into the first user turn.
  const [first, ...rest] = turns;
  const input: ChatTurn[] = [{ role: 'user', content: `${CHAT_RULES}\n\n${context}\n\nQuestion: ${first.content}` }, ...rest];
  try {
    const result = await sample(input, { cache: false, signal, onText: ({ text }) => onText(text) });
    return result.text;
  } catch (e) {
    const { code = 'upstream_error', message = '', text } = (e || {}) as { code?: string; message?: string; text?: string };
    throw new ChatError(code, message, text);
  }
};

const viaServer = async ({ context, turns, onText, signal }: AskOptions) => {
  let res: Response;
  try {
    res = await fetch('./api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context, messages: turns }),
      signal,
    });
  } catch (e) {
    if (signal.aborted) throw new ChatError('cancelled', 'Stopped');
    throw new ChatError('unavailable', String(e));
  }
  if (res.status === 404 || res.status === 405) throw new ChatError('unavailable', 'No chat endpoint');
  if (!res.ok || !res.body) {
    const body = await res.json().catch(() => ({}));
    throw new ChatError(body.code || 'upstream_error', body.error || `Chat failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
      onText(text);
    }
  } catch {
    throw new ChatError(signal.aborted ? 'cancelled' : 'upstream_error', 'Stream interrupted', text);
  }
  return text;
};

export const askClaude = async (opts: AskOptions): Promise<string> => {
  if (isArtifactHost()) {
    const sample = await getSample();
    if (!sample) throw new ChatError('not_granted', 'Chat is not available on this page.');
    return viaSample(sample, opts);
  }
  return viaServer(opts);
};
