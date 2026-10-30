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
  // Aggregate summary statistics
  const totalFunding = nodes
    .filter((n) => n.type === 'grant')
    .reduce((sum, n) => sum + ((n as any).amount || 0), 0);

  const totalCollaboratives = nodes.filter((n) => n.type === 'collaborative').length;
  const totalProducts = nodes.filter((n) => n.type === 'product').length;

  const formattedFunding = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(totalFunding);

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
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 30,
        borderRadius: 'var(--radius-lg)',
      }}
    >
      {/* AIC:W Brand & App Lockup */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={onOpenAbout}
          title="About AI Collaborative: Wildfires (AIC:W)"
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
          }}
        >
          <img src="/aicw-logo-white.png" alt="AI Collaborative: Wildfires" style={{ height: 44, width: 'auto', display: 'block' }} />
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: '0.62rem',
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 190, 95, 0.15)',
                color: '#FFE8A5',
                border: '1px solid rgba(255, 190, 95, 0.35)',
              }}
            >
              with support from Google.org
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 1 }}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(to right, #ffffff, #FFE8A5)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.1,
              }}
            >
              GraphEmber
            </h1>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                padding: '2px 7px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 159, 64, 0.18)',
                color: '#FFBE5F',
                border: '1px solid rgba(255, 159, 64, 0.4)',
              }}
            >
              AIC:W Network
            </span>
          </div>
        </div>
      </div>

      {/* Center Search Input */}
      <div
        style={{
          position: 'relative',
          width: 340,
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
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, rgba(255, 190, 95, 0.15) 0%, rgba(255, 159, 64, 0.15) 100%)',
            border: '1px solid rgba(255, 190, 95, 0.35)',
            color: '#FFE8A5',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 190, 95, 0.25)';
            e.currentTarget.style.borderColor = '#FFBE5F';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 190, 95, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(255, 190, 95, 0.35)';
          }}
        >
          <img src="/aicw-flame.svg" alt="" style={{ height: 15, width: 'auto' }} />
          <span>About AIC:W</span>
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
            e.currentTarget.style.color = '#ffffff';
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
              paddingRight: 10,
              borderRight: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Network
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
              {nodes.length} Nodes · {edges.length} Edges
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              paddingRight: 10,
              borderRight: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Funding Active
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399' }}>
              {formattedFunding}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Alliances & Products
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFBE5F' }}>
              {totalCollaboratives} Collabs · {totalProducts} Prods
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
            <Network size={15} color="#FFBE5F" />
            <span style={{ color: '#FFE8A5', fontWeight: 600 }}>Ontology</span>
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
              background: 'linear-gradient(135deg, #FF9F40 0%, #ea580c 100%)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 600,
              boxShadow: '0 2px 10px rgba(255, 159, 64, 0.35)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <Plus size={16} />
            <span>Add Entity</span>
          </button>
        </div>
      </div>
    </header>
  );
};
