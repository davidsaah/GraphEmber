import type { NodeType } from '../types/graph';

// One outline glyph per entity type, on Lucide's 24px grid with a 2px stroke (path data from
// lucide v1, ISC). Kept as raw paths so the SVG icons and the canvas node markers share it.
export const TYPE_ICON_PATHS: Record<NodeType, string[]> = {
  // user
  person: ['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', 'M8 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0'],
  // landmark
  institution: [
    'M10 18v-7',
    'M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z',
    'M14 18v-7',
    'M18 18v-7',
    'M3 22h18',
    'M6 18v-7',
  ],
  // handshake
  collaborative: [
    'm11 17 2 2a1 1 0 1 0 3-3',
    'm14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4',
    'm21 3 1 11h-2',
    'M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3',
    'M3 4h8',
  ],
  // folder-kanban
  program: [
    'M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z',
    'M8 10v4',
    'M12 10v2',
    'M16 10v6',
  ],
  // box
  product: [
    'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z',
    'm3.3 7 8.7 5 8.7-5',
    'M12 22V12',
  ],
  // banknote
  grant: [
    'M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-16a2 2 0 0 1 -2 -2v-8a2 2 0 0 1 2 -2z',
    'M10 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
    'M6 12h.01M18 12h.01',
  ],
  // file-text
  research: [
    'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
    'M14 2v5a1 1 0 0 0 1 1h5',
    'M10 9H8',
    'M16 13H8',
    'M16 17H8',
  ],
  // calendar
  meeting: ['M8 2v3', 'M16 2v3', 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2z', 'M3 9h18'],
  // tag
  topic: [
    'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z',
    'M7 7.5a0.5 0.5 0 1 0 1 0a0.5 0.5 0 1 0 -1 0',
  ],
};

export const TYPE_LABELS: Record<NodeType, string> = {
  person: 'Person',
  institution: 'Organization',
  collaborative: 'Collaborative',
  program: 'Program',
  product: 'Tool / system',
  grant: 'Grant',
  research: 'Research',
  meeting: 'Meeting',
  topic: 'Topic',
};

// Path2D objects for the canvas, built once per type on first use.
const path2dCache = new Map<NodeType, Path2D>();
export const typeIconPath2D = (type: NodeType): Path2D | null => {
  if (typeof Path2D === 'undefined') return null;
  let p = path2dCache.get(type);
  if (!p) {
    p = new Path2D();
    for (const d of TYPE_ICON_PATHS[type] || []) p.addPath(new Path2D(d));
    path2dCache.set(type, p);
  }
  return p;
};
