import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUp, Sparkles, Square, Trash2 } from 'lucide-react';
import type { GraphNode, GraphEdge } from '../types/graph';
import { buildGraphContext } from '../chat/graphContext';
import { askClaude, describeError, ChatError, type ChatTurn } from '../chat/askClaude';

interface ChatPanelProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectNode: (node: GraphNode) => void;
  onHighlight: (nodeIds: string[], edgeIds: string[]) => void;
}

interface Message extends ChatTurn {
  error?: string;
}

const SUGGESTIONS = [
  'Which partners work on the most CWI projects?',
  'Who attended the 2026 Convening?',
  'Which CWI partners are based around Lake Tahoe?',
  'How is CWI connected to Earth Fire Alliance?',
];

const REF = /\[\[([^\]\s]+)\]\]/g;

const endpointId = (end: string | GraphNode) => (typeof end === 'string' ? end : end.id);

const referencedIds = (text: string, byId: Map<string, GraphNode>) =>
  [...new Set([...text.matchAll(REF)].map((m) => m[1]))].filter((id) => byId.has(id));

export const ChatPanel: React.FC<ChatPanelProps> = ({ nodes, edges, onSelectNode, onHighlight }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const context = useMemo(() => buildGraphContext(nodes, edges), [nodes, edges]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  // Light up the entities an answer mentions, plus the links between them
  const highlightAnswer = (text: string) => {
    const ids = referencedIds(text, byId);
    if (ids.length === 0) return;
    const set = new Set(ids);
    const edgeIds = edges.filter((e) => set.has(endpointId(e.source)) && set.has(endpointId(e.target))).map((e) => e.id);
    onHighlight(ids, edgeIds);
  };

  const send = async (question: string) => {
    const q = question.trim();
    if (!q || busy) return;
    // Only completed exchanges go back to Claude; failed answers are dropped
    const history: ChatTurn[] = [];
    for (let i = 0; i + 1 < messages.length; i += 2) {
      const [u, a] = [messages[i], messages[i + 1]];
      if (!a.error && a.content) history.push({ role: 'user', content: u.content }, { role: 'assistant', content: a.content });
    }
    const turns: ChatTurn[] = [...history.slice(-12), { role: 'user', content: q }];

    setDraft('');
    setBusy(true);
    setMessages((m) => [...m, { role: 'user', content: q }, { role: 'assistant', content: '' }]);
    const setAnswer = (patch: Partial<Message>) =>
      setMessages((m) => [...m.slice(0, -1), { ...m[m.length - 1], ...patch }]);

    const ctl = new AbortController();
    abortRef.current = ctl;
    try {
      const text = await askClaude({ context, turns, signal: ctl.signal, onText: (t) => setAnswer({ content: t }) });
      setAnswer({ content: text });
      highlightAnswer(text);
    } catch (err) {
      const partial = err instanceof ChatError ? err.partial : undefined;
      if (err instanceof ChatError && err.code === 'cancelled') {
        setAnswer({ content: partial || '', error: partial ? undefined : 'Stopped.' });
      } else {
        setAnswer({ content: partial || '', error: describeError(err) });
      }
    } finally {
      abortRef.current = null;
      setBusy(false);
    }
  };

  const clear = () => {
    abortRef.current?.abort();
    setMessages([]);
    onHighlight([], []);
  };

  return (
    <aside
      aria-label="Ask about the network"
      style={{
        width: 'var(--chat-width)',
        flexShrink: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'var(--bg-sidebar)',
        borderLeft: '1px solid var(--border-subtle)',
      }}
    >
      {/* Header row lines up with the app header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minHeight: 'var(--header-height)',
          padding: '0 12px 0 18px',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}
      >
        <Sparkles size={16} style={{ color: 'var(--color-cwi-gold)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem' }}>Ask the network</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Answers from the {nodes.length} entities in this network</div>
        </div>
        {messages.length > 0 && (
          <button className="icon-btn" onClick={clear} title="Clear conversation" aria-label="Clear conversation">
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            <span className="eyebrow">Try asking</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  lineHeight: 1.4,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div
              key={i}
              style={{
                alignSelf: 'flex-end',
                maxWidth: '85%',
                padding: '8px 12px',
                borderRadius: '14px 14px 4px 14px',
                background: 'var(--bg-surface-elevated)',
                fontSize: '0.85rem',
                lineHeight: 1.45,
                whiteSpace: 'pre-wrap',
              }}
            >
              {m.content}
            </div>
          ) : (
            <div key={i} style={{ fontSize: '0.85rem', lineHeight: 1.55, color: 'var(--text-primary)' }}>
              {m.content ? (
                <Markdown text={m.content} byId={byId} onSelect={onSelectNode} />
              ) : (
                !m.error && <span style={{ color: 'var(--text-muted)' }}>Thinking…</span>
              )}
              {m.error && <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: m.content ? 6 : 0 }}>{m.error}</p>}
            </div>
          ),
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(draft);
        }}
        style={{ padding: 12, borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8, alignItems: 'flex-end' }}
      >
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send(draft);
            }
          }}
          rows={1}
          maxLength={2000}
          placeholder="Ask about the network"
          aria-label="Your question"
          style={{
            flex: 1,
            resize: 'none',
            minHeight: 38,
            maxHeight: 120,
            padding: '9px 12px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            outline: 'none',
          }}
        />
        {busy ? (
          <button type="button" className="icon-btn" onClick={() => abortRef.current?.abort()} title="Stop" aria-label="Stop answering" style={{ height: 38, width: 38, border: '1px solid var(--border-strong)' }}>
            <Square size={13} fill="currentColor" />
          </button>
        ) : (
          <button type="submit" className="btn btn-primary" disabled={!draft.trim()} aria-label="Send" style={{ height: 38, width: 38, padding: 0, justifyContent: 'center', opacity: draft.trim() ? 1 : 0.4 }}>
            <ArrowUp size={16} />
          </button>
        )}
      </form>
    </aside>
  );
};

// Minimal markdown: paragraphs, "-"/"*"/"1." lists, **bold**, and [[node-id]] entity links.
const Markdown: React.FC<{ text: string; byId: Map<string, GraphNode>; onSelect: (n: GraphNode) => void }> = ({ text, byId, onSelect }) => {
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  const flush = () => {
    if (!list) return;
    const Tag = list.ordered ? 'ol' : 'ul';
    blocks.push(
      <Tag key={blocks.length} style={{ paddingLeft: 18, margin: '4px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {list.items.map((item, i) => (
          <li key={i}>
            <Inline text={item} byId={byId} onSelect={onSelect} />
          </li>
        ))}
      </Tag>,
    );
    list = null;
  };

  for (const line of text.split('\n')) {
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (bullet || numbered) {
      const ordered = !!numbered;
      if (list && list.ordered !== ordered) flush();
      list ??= { ordered, items: [] };
      list.items.push((bullet || numbered)![1]);
    } else if (line.trim() === '') {
      flush();
    } else {
      flush();
      blocks.push(
        <p key={blocks.length} style={{ margin: '4px 0' }}>
          <Inline text={line.replace(/^#+\s*/, '')} byId={byId} onSelect={onSelect} />
        </p>,
      );
    }
  }
  flush();
  return <>{blocks}</>;
};

const Inline: React.FC<{ text: string; byId: Map<string, GraphNode>; onSelect: (n: GraphNode) => void }> = ({ text, byId, onSelect }) => {
  const parts = text.split(/(\[\[[^\]\s]+\]\]|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        const ref = part.match(/^\[\[([^\]\s]+)\]\]$/);
        if (ref) {
          const node = byId.get(ref[1]);
          if (!node) return <span key={i}>{ref[1]}</span>;
          return (
            <button
              key={i}
              className={`badge badge-${node.type}`}
              onClick={() => onSelect(node)}
              title={`Open ${node.label}`}
              style={{ cursor: 'pointer', verticalAlign: 'baseline', margin: '0 1px', fontSize: '0.78rem' }}
            >
              {node.label}
            </button>
          );
        }
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
};
