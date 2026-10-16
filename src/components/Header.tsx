import React from 'react';
import { Search, Route, BarChart3, Plus, X, Download, Network, ExternalLink } from 'lucide-react';
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
      {/* CWI Brand & App Lockup */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={onOpenCwiModal}
          title="Learn about Climate & Wildfire Institute (CWI) and Initiatives"
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
          }}
        >
          <CwiLogo variant="mark" size={40} glow={true} className="cwi-flame-pulse" />
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontFamily: 'var(--font-brand, "Poppins", sans-serif)',
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#f6ba13',
              }}
            >
              Climate & Wildfire Institute
            </span>
            <span
              style={{
                fontSize: '0.62rem',
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(246, 186, 19, 0.15)',
                color: '#fed7aa',
                border: '1px solid rgba(246, 186, 19, 0.35)',
              }}
            >
              501(c)(3)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 1 }}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(to right, #ffffff, #fed7aa)',
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
                background: 'rgba(235, 124, 38, 0.18)',
                color: '#fb923c',
                border: '1px solid rgba(249, 115, 22, 0.4)',
              }}
            >
              Firelines Landscape
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

      {/* CWI Ecosystem Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={onOpenCwiModal}
          title="Learn about Climate & Wildfire Institute boundary initiatives"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, rgba(246, 186, 19, 0.15) 0%, rgba(235, 124, 38, 0.15) 100%)',
            border: '1px solid rgba(246, 186, 19, 0.35)',
            color: '#fed7aa',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(246, 186, 19, 0.25)';
            e.currentTarget.style.borderColor = '#f6ba13';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(246, 186, 19, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(246, 186, 19, 0.35)';
          }}
        >
          <CwiLogo variant="mark" size={15} glow={false} />
          <span>About CWI</span>
        </button>

        <a
          href="https://www.climateandwildfire.org/"
          target="_blank"
          rel="noopener noreferrer"
          title="Open Climate & Wildfire Institute official website"
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
          <span>climateandwildfire.org</span>
          <ExternalLink size={12} />
        </a>

        <a
          href="https://www.resilienthomefund.org/"
          target="_blank"
          rel="noopener noreferrer"
          title="Explore Resilient Home Fund - Wildfire Risk Reduction Grants for Homeowners"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.16) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#a7f3d0',
            fontSize: '0.75rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.22)';
            e.currentTarget.style.borderColor = '#10b981';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.12)';
            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.35)';
          }}
        >
          <span>Resilient Home Fund</span>
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: 'var(--radius-sm)',
              background: '#10b981',
              color: '#064e3b',
            }}
          >
            Grants
          </span>
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
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fb923c' }}>
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
              border: '1px solid rgba(249, 115, 22, 0.3)',
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
              e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.3)';
            }}
          >
            <Network size={15} color="#fb923c" />
            <span style={{ color: '#fed7aa', fontWeight: 600 }}>Ontology</span>
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
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 600,
              boxShadow: '0 2px 10px rgba(249, 115, 22, 0.35)',
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
