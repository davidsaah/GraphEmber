import React from 'react';
import { Search, Route, BarChart3, Plus, X, Download, Network, Sparkles, Share2, Map as MapIcon } from 'lucide-react';
import type { GraphNode, GraphEdge } from '../types/graph';
import { CwiLogo } from './CwiLogo';

interface HeaderProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenPathFinder: () => void;
  onOpenAnalytics: () => void;
  onOpenOntology: () => void;
  onOpenCwiModal: () => void;
  onOpenAddModal: () => void;
  onExportData: () => void;
  onOpenChat: () => void;
  view: 'network' | 'map';
  onViewChange: (view: 'network' | 'map') => void;
}

export const Header: React.FC<HeaderProps> = ({
  nodes,
  edges,
  searchQuery,
  onSearchChange,
  onOpenPathFinder,
  onOpenAnalytics,
  onOpenOntology,
  onOpenCwiModal,
  onOpenAddModal,
  onExportData,
  onOpenChat,
  view,
  onViewChange,
}) => {
  return (
    <header
      className="glass-panel"
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '0 10px 0 14px',
        zIndex: 30,
      }}
    >
      {/* Brand lockup: the mark opens the CWI panel */}
      <button
        onClick={onOpenCwiModal}
        title="About the Climate & Wildfire Institute"
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 0, flexShrink: 0, textAlign: 'left' }}
      >
        <CwiLogo variant="mark" size={30} glow={false} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span className="eyebrow">Climate & Wildfire Institute</span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.05rem',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: 'var(--text-primary)',
              lineHeight: 1.1,
            }}
          >
            GraphEmber
          </h1>
        </div>
      </button>

      {/* Search */}
      <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: 440, minWidth: 160, display: 'flex', alignItems: 'center' }}>
        <Search size={15} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)', pointerEvents: 'none' }} />
        <input
          id="graph-search"
          type="search"
          aria-label="Search the network"
          placeholder="Search organizations, tools, topics"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            height: 36,
            padding: '0 34px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'rgba(246, 186, 19, 0.5)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            style={{ position: 'absolute', right: 8, padding: 4, color: 'var(--text-muted)', display: 'flex' }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* View switch */}
      <div className="segmented" role="group" aria-label="View">
        <button aria-pressed={view === 'network'} onClick={() => onViewChange('network')} title="Network view">
          <Share2 size={14} />
          <span className="hide-sm">Network</span>
        </button>
        <button aria-pressed={view === 'map'} onClick={() => onViewChange('map')} title="Map view">
          <MapIcon size={14} />
          <span className="hide-sm">Map</span>
        </button>
      </div>

      {/* Network size */}
      <span
        className="hide-md"
        style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}
      >
        <strong style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{nodes.length}</strong> entities ·{' '}
        <strong style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{edges.length}</strong> links
      </span>

      {/* Tools */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0, marginLeft: 'auto' }}>
        <button className="btn" onClick={onOpenChat} title="Ask questions about the network" style={{ color: 'var(--color-cwi-gold)' }}>
          <Sparkles size={15} />
          <span className="hide-sm">Ask</span>
        </button>
        <button className="btn" onClick={onOpenPathFinder} title="Find the shortest connection between two entities">
          <Route size={15} />
          <span className="hide-md">Path Finder</span>
        </button>
        <button className="btn" onClick={onOpenAnalytics} title="Most connected entities">
          <BarChart3 size={15} />
          <span className="hide-md">Analytics</span>
        </button>
        <button className="btn" onClick={onOpenOntology} title="Firelines graph ontology">
          <Network size={15} />
          <span className="hide-md">Ontology</span>
        </button>
        <button className="icon-btn" onClick={onExportData} title="Export graph as JSON" aria-label="Export graph as JSON">
          <Download size={15} />
        </button>
        <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', margin: '0 6px' }} />
        <button className="btn btn-primary" onClick={onOpenAddModal}>
          <Plus size={15} />
          <span>Add</span>
        </button>
      </nav>
    </header>
  );
};
