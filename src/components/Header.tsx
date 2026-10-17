import React from 'react';
import { Search, Route, BarChart3, Plus, X, Download, Network, Share2, Map as MapIcon, Table2, FileText } from 'lucide-react';
import { CwiLogo } from './CwiLogo';

export type AppView = 'network' | 'map' | 'data' | 'reports';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenPathFinder: () => void;
  onOpenAnalytics: () => void;
  onOpenOntology: () => void;
  onOpenCwiModal: () => void;
  onOpenAddModal: () => void;
  onExportData: () => void;
  view: AppView;
  onViewChange: (view: AppView) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenPathFinder,
  onOpenAnalytics,
  onOpenOntology,
  onOpenCwiModal,
  onOpenAddModal,
  onExportData,
  view,
  onViewChange,
}) => {
  return (
    <header className="app-header">
      {/* Brand lockup: the mark opens the CWI panel */}
      <button
        onClick={onOpenCwiModal}
        title="About the Climate & Wildfire Institute"
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 0, flexShrink: 0, textAlign: 'left' }}
      >
        <CwiLogo variant="mark" size={30} glow={false} />
        <div className="hide-xs" style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span className="eyebrow">Climate & Wildfire Institute</span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
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

      <span className="header-divider hide-xs" />

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
        <button aria-pressed={view === 'data'} onClick={() => onViewChange('data')} title="Data tables">
          <Table2 size={14} />
          <span className="hide-sm">Data</span>
        </button>
        <button aria-pressed={view === 'reports'} onClick={() => onViewChange('reports')} title="Stakeholder reports">
          <FileText size={14} />
          <span className="hide-sm">Reports</span>
        </button>
      </div>

      {/* Search */}
      <div
        style={{
          position: 'relative',
          flex: '0 1 340px',
          minWidth: 160,
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
        }}
      >
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
        {!searchQuery && <kbd className="search-kbd hide-sm">/</kbd>}
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

      {/* Tools */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
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
        <span className="header-divider" />
        <button className="btn btn-primary" onClick={onOpenAddModal}>
          <Plus size={15} />
          <span className="hide-xs">Add</span>
        </button>
      </nav>
    </header>
  );
};
