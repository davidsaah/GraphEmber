import React from 'react';
import { Search, Route, BarChart3, Plus, X, Download, Network, ExternalLink } from 'lucide-react';
import type { GraphNode, GraphEdge } from '../types/graph';

interface HeaderProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenPathFinder: () => void;
  onOpenAnalytics: () => void;
  onOpenOntology: () => void;
  onOpenAbout: () => void;
  onOpenAddModal: () => void;
  onExportData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  nodes,
  edges,
  searchQuery,
  onSearchChange,
  onOpenPathFinder,
  onOpenAnalytics,
  onOpenOntology,
  onOpenAbout,
  onOpenAddModal,
  onExportData,
}) => {
  return (
    <header
      className="glass-panel"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 30,
        borderRadius: 0,
        border: 'none',
        borderBottom: '1px solid #E6E2DA',
        boxShadow: 'none',
      }}
    >
      {/* AIC:W lockup: logo, then the deck-style kicker and title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onOpenAbout} title="About AI Collaborative: Wildfires (AIC:W)" style={{ display: 'flex', alignItems: 'center', padding: 0 }}>
          <img src={`${import.meta.env.BASE_URL}aicw-logo.png`} alt="AI Collaborative: Wildfires" style={{ height: 38, width: 'auto', display: 'block' }} />
        </button>
        <div style={{ borderLeft: '3px solid #FF9F40', paddingLeft: 10 }}>
          <div style={{ fontFamily: 'var(--font-label)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', color: '#5F6368', textTransform: 'uppercase' }}>
            Network · GraphEmber
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: '#202124', lineHeight: 1.15, whiteSpace: 'nowrap' }}>
            AIC:W network over time
          </h1>
        </div>
      </div>

      {/* Center Search Input */}
      <div
        style={{
          position: 'relative',
          width: 260,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: 12,
            color: 'var(--text-muted)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          placeholder="Search entities, topics, papers, grants..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            height: 38,
            padding: '0 36px 0 36px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-primary)',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--border-accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            style={{
              position: 'absolute',
              right: 10,
              padding: 4,
              color: 'var(--text-muted)',
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* AIC:W Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={onOpenAbout}
          title="North Star, workstreams and how impact is rated"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 4,
            background: '#FFFFFF',
            border: '1px solid #E6E2DA',
            color: '#202124',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#FF9F40';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#E6E2DA';
          }}
        >
          <img src={`${import.meta.env.BASE_URL}aicw-flame.svg`} alt="" style={{ height: 15, width: 'auto' }} />
          <span style={{ whiteSpace: 'nowrap' }}>About AIC:W</span>
        </button>

        <a
          href="https://aicw.wildfirecommons.org/"
          target="_blank"
          rel="noopener noreferrer"
          title="Open the AIC:W website"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '6px 11px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            fontSize: '0.75rem',
            fontWeight: 500,
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
            e.currentTarget.style.color = '#202124';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <span>aicw.wildfirecommons.org</span>
          <ExternalLink size={12} />
        </a>

      </div>

      {/* Network Stats & Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Quick Stats Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              paddingRight: 4,
            }}
          >
            <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.66rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Network
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#202124', whiteSpace: 'nowrap' }}>
              {nodes.length} nodes · {edges.length} links
            </span>
          </div>

        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={onOpenPathFinder}
            title="Find connection path between two entities"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
              e.currentTarget.style.borderColor = 'var(--color-collaborative)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <Route size={15} color="var(--color-collaborative)" />
            <span>Path Finder</span>
          </button>

          <button
            onClick={onOpenAnalytics}
            title="Ecosystem metrics & centrality analysis"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
              e.currentTarget.style.borderColor = 'var(--color-program)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <BarChart3 size={15} color="var(--color-program)" />
            <span>Analytics</span>
          </button>

          <button
            onClick={onOpenOntology}
            title="View Firelines Graph Ontology Blueprint"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid rgba(255, 159, 64, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
              e.currentTarget.style.borderColor = 'var(--accent-ember)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
              e.currentTarget.style.borderColor = 'rgba(255, 159, 64, 0.3)';
            }}
          >
            <Network size={15} color="#B85C00" />
            <span style={{ color: '#202124', fontWeight: 600 }}>Ontology</span>
          </button>

          <button
            onClick={onExportData}
            title="Export Graph JSON"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 10px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface)')}
          >
            <Download size={15} />
          </button>

          <button
            onClick={onOpenAddModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              background: '#202124',
              border: 'none',
              borderRadius: 4,
              color: '#FFFFFF',
              fontSize: '0.8rem',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <Plus size={16} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </header>
  );
};
