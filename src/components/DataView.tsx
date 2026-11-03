import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Download } from 'lucide-react';
import { TypeIcon } from './TypeIcon';
import type { GraphNode, GraphEdge, NodeType } from '../types/graph';
import { RAW_SHEETS } from '../data/rawSheets';

interface DataViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  onSelectNode: (node: GraphNode) => void;
  searchQuery: string;
}

type Tab = 'entities' | 'relationships' | 'raw';
type Sort = { key: string; dir: 1 | -1 };

const TYPE_LABELS: Record<NodeType, string> = {
  topic: 'Topic',
  collaborative: 'Collaborative',
  institution: 'Organization',
  product: 'Tool / system',
  program: 'Program',
  person: 'Person',
  grant: 'Grant',
  research: 'Research',
  meeting: 'Meeting',
};

const endpointId = (end: string | GraphNode) => (typeof end === 'string' ? end : end.id);
const titleCase = (s: string) => s.toLowerCase().replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

const toCsv = (rows: string[][]) =>
  rows.map((r) => r.map((v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)).join(',')).join('\n');

const download = (name: string, text: string) => {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

export const DataView: React.FC<DataViewProps> = ({ nodes, edges, selectedNodeId, onSelectNode, searchQuery }) => {
  const [tab, setTab] = useState<Tab>('entities');
  const [sort, setSort] = useState<Sort>({ key: 'connections', dir: -1 });
  const [sheetIndex, setSheetIndex] = useState(0);
  const sheet = RAW_SHEETS[sheetIndex];

  // Raw rows are shown exactly as in the source sheet; only the search box narrows them
  const rawRows = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return q ? sheet.rows.filter((r) => r.some((v) => v.toLowerCase().includes(q))) : sheet.rows;
  }, [sheet, searchQuery]);

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const entityRows = useMemo(() => {
    const degree = new Map<string, number>();
    edges.forEach((e) => {
      [endpointId(e.source), endpointId(e.target)].forEach((id) => degree.set(id, (degree.get(id) || 0) + 1));
    });
    return nodes.map((n) => ({
      node: n,
      name: n.label,
      type: TYPE_LABELS[n.type] || n.type,
      location: n.location || '',
      connections: degree.get(n.id) || 0,
      tags: (n.tags || []).filter((t) => !t.startsWith('Works with:')).join(', '),
      description: n.description || '',
    }));
  }, [nodes, edges]);

  const relationshipRows = useMemo(
    () =>
      edges.flatMap((e) => {
        const source = byId.get(endpointId(e.source));
        const target = byId.get(endpointId(e.target));
        if (!source || !target) return [];
        return [{ id: e.id, source, target, relation: titleCase(e.type), how: e.how || e.label || '', modality: e.modality || '' }];
      }),
    [edges, byId],
  );

  const sorted = <T extends Record<string, unknown>>(rows: T[]) =>
    [...rows].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av ?? '').localeCompare(String(bv ?? ''));
      return cmp * sort.dir;
    });

  const sortBy = (key: string) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: key === 'connections' ? -1 : 1 }));

  const switchTab = (next: Tab) => {
    setTab(next);
    setSort(next === 'entities' ? { key: 'connections', dir: -1 } : { key: 'sourceName', dir: 1 });
  };

  const exportCsv = () => {
    if (tab === 'raw') {
      download(`${sheet.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`, toCsv([sheet.columns, ...sheet.rows]));
    } else if (tab === 'entities') {
      download(
        'graphember-entities.csv',
        toCsv([
          ['id', 'name', 'type', 'location', 'connections', 'tags', 'description'],
          ...entityRows.map((r) => [r.node.id, r.name, r.type, r.location, String(r.connections), r.tags, r.description]),
        ]),
      );
    } else {
      download(
        'graphember-relationships.csv',
        toCsv([
          ['source', 'relation', 'target', 'how', 'modality'],
          ...relationshipRows.map((r) => [r.source.label, r.relation, r.target.label, r.how, r.modality]),
        ]),
      );
    }
  };

  const th = (k: string, children: React.ReactNode, width?: number | string, align?: 'right') => (
    <th key={k} style={{ width, textAlign: align || 'left' }} aria-sort={sort.key === k ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
      <button className="th-sort" onClick={() => sortBy(k)} style={{ justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
        {children}
        {sort.key === k && (sort.dir === 1 ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
      </button>
    </th>
  );

  const entityLink = (node: GraphNode) => (
    <button className="cell-link" onClick={() => onSelectNode(node)}>
      <TypeIcon type={node.type} size={12} style={{ color: `var(--color-${node.type})`, flexShrink: 0 }} />
      {node.label}
    </button>
  );

  return (
    <div
      className="glass-panel"
      style={{
        position: 'absolute',
        inset: 12,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px 10px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="segmented" role="tablist" aria-label="Table">
          <button role="tab" aria-pressed={tab === 'entities'} aria-selected={tab === 'entities'} onClick={() => switchTab('entities')}>
            Entities <span className="count">{entityRows.length}</span>
          </button>
          <button role="tab" aria-pressed={tab === 'relationships'} aria-selected={tab === 'relationships'} onClick={() => switchTab('relationships')}>
            Relationships <span className="count">{relationshipRows.length}</span>
          </button>
          <button role="tab" aria-pressed={tab === 'raw'} aria-selected={tab === 'raw'} onClick={() => switchTab('raw')}>
            Raw sheets
          </button>
        </div>
        {tab === 'raw' ? (
          <div className="segmented" role="group" aria-label="Source sheet">
            {RAW_SHEETS.map((s, i) => (
              <button key={s.title} aria-pressed={sheetIndex === i} onClick={() => setSheetIndex(i)}>
                {s.title} <span className="count">{s.rows.length}</span>
              </button>
            ))}
          </div>
        ) : (
          <span className="hide-sm" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Filters and search apply · click a name to open it</span>
        )}
        <button className="btn" onClick={exportCsv} style={{ marginLeft: 'auto' }} title="Download this table as CSV">
          <Download size={14} />
          <span className="hide-sm">CSV</span>
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {tab === 'raw' ? (
          <table className="data-table raw-table">
            <thead>
              <tr>
                <th className="row-num">#</th>
                {sheet.columns.map((c, i) => (
                  <th key={i}>
                    <span className="th-sort" style={{ cursor: 'default' }}>{c}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rawRows.map((r, i) => (
                <tr key={i}>
                  <td className="row-num">{sheet.rows.indexOf(r) + 1}</td>
                  {r.map((v, j) => (
                    <td key={j} title={v}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : tab === 'entities' ? (
          <table className="data-table">
            <thead>
              <tr>
                {th('name', 'Name', '24%')}
                {th('type', 'Type', 130)}
                {th('location', 'Location', 150)}
                {th('connections', 'Connections', 110, 'right')}
                {th('tags', 'Tags')}
              </tr>
            </thead>
            <tbody>
              {sorted(entityRows).map((r) => (
                <tr key={r.node.id} aria-selected={r.node.id === selectedNodeId} title={r.description}>
                  <td>{entityLink(r.node)}</td>
                  <td className="muted">{r.type}</td>
                  <td className="muted">{r.location || '—'}</td>
                  <td className="num">{r.connections}</td>
                  <td className="muted clip">{r.tags || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {th('sourceName', 'From', '26%')}
                {th('relation', 'Relationship', 150)}
                {th('targetName', 'To', '26%')}
                {th('how', 'How')}
              </tr>
            </thead>
            <tbody>
              {sorted(relationshipRows.map((r) => ({ ...r, sourceName: r.source.label, targetName: r.target.label }))).map((r) => (
                <tr key={r.id} aria-selected={r.source.id === selectedNodeId || r.target.id === selectedNodeId}>
                  <td>{entityLink(r.source)}</td>
                  <td className="muted">{r.relation}</td>
                  <td>{entityLink(r.target)}</td>
                  <td className="muted clip" title={r.modality ? `${r.how} (${r.modality})` : r.how}>
                    {r.how || '—'}
                    {r.modality && <span className="faint"> · {r.modality}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
