import React from 'react';
import type { NodeType, GraphNode } from '../types/graph';
import { Layers, DollarSign, Tag, RefreshCcw } from 'lucide-react';

interface FilterBarProps {
  nodes: GraphNode[];
  activeTypes: Set<NodeType>;
  onToggleType: (type: NodeType) => void;
  onSelectAllTypes: () => void;
  selectedTags: Set<string>;
  onToggleTag: (tag: string) => void;
  minFunding: number;
  onMinFundingChange: (amount: number) => void;
  onResetFilters: () => void;
}

const TYPE_CONFIG: Array<{ type: NodeType; label: string; icon: string; color: string }> = [
  { type: 'person', label: 'People', icon: '👤', color: 'var(--color-person)' },
  { type: 'institution', label: 'Institutions', icon: '🏛️', color: 'var(--color-institution)' },
  { type: 'collaborative', label: 'Collaboratives', icon: '🤝', color: 'var(--color-collaborative)' },
  { type: 'program', label: 'Programs', icon: '🚀', color: 'var(--color-program)' },
  { type: 'product', label: 'Products', icon: '📦', color: 'var(--color-product)' },
  { type: 'grant', label: 'Grants', icon: '💰', color: 'var(--color-grant)' },
  { type: 'research', label: 'Research', icon: '📄', color: 'var(--color-research)' },
  { type: 'meeting', label: 'Meetings', icon: '📅', color: 'var(--color-meeting)' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  nodes,
  activeTypes,
  onToggleType,
  onSelectAllTypes,
  selectedTags,
  onToggleTag,
  minFunding,
  onMinFundingChange,
  onResetFilters,
}) => {
  // Count nodes per type
  const typeCounts = React.useMemo(() => {
    const counts: Record<NodeType, number> = {
      person: 0,
      institution: 0,
      collaborative: 0,
      program: 0,
      product: 0,
      grant: 0,
      research: 0,
      meeting: 0,
    };
    nodes.forEach((n) => {
      if (counts[n.type] !== undefined) {
        counts[n.type]++;
      }
    });
    return counts;
  }, [nodes]);

  // Extract top tags
  const topTags = React.useMemo(() => {
    const tagMap = new Map<string, number>();
    nodes.forEach((n) => {
      n.tags?.forEach((t) => tagMap.set(t, (tagMap.get(t) || 0) + 1));
    });
    return Array.from(tagMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [nodes]);

  const areFiltersApplied =
    activeTypes.size < TYPE_CONFIG.length || selectedTags.size > 0 || minFunding > 0;

  return (
    <div
      className="glass-panel"
      style={{
        position: 'absolute',
        top: 92,
        left: 16,
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        zIndex: 25,
        maxWidth: 'calc(100vw - 32px)',
        width: 'fit-content',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      {/* Top Row: Entity Type Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 4 }}>
          <Layers size={15} color="var(--text-muted)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Entity Types:
          </span>
        </div>

        {TYPE_CONFIG.map(({ type, label, icon, color }) => {
          const isActive = activeTypes.has(type);
          const count = typeCounts[type] || 0;

          return (
            <button
              key={type}
              onClick={() => onToggleType(type)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'rgba(15, 23, 42, 0.4)',
                border: `1px solid ${isActive ? color : 'var(--border-subtle)'}`,
                color: isActive ? '#f8fafc' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.borderColor = 'var(--border-strong)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <span>{icon}</span>
              <span>{label}</span>
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '1px 5px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isActive ? color + '2a' : 'rgba(255, 255, 255, 0.05)',
                  color: isActive ? color : 'var(--text-muted)',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}

        {activeTypes.size < TYPE_CONFIG.length && (
          <button
            onClick={onSelectAllTypes}
            style={{
              fontSize: '0.72rem',
              color: 'var(--color-collaborative)',
              textDecoration: 'underline',
              padding: '2px 6px',
            }}
          >
            Select All
          </button>
        )}
      </div>

      {/* Bottom Row: Tags & Funding Threshold Slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        {/* Thematic Tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Tag size={14} color="var(--text-muted)" />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tags:</span>
          {topTags.map((tag) => {
            const isSelected = selectedTags.has(tag);
            return (
              <button
                key={tag}
                onClick={() => onToggleTag(tag)}
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'rgba(249, 115, 22, 0.2)' : 'var(--bg-surface)',
                  border: `1px solid ${isSelected ? 'var(--color-collaborative)' : 'var(--border-subtle)'}`,
                  color: isSelected ? '#fb923c' : 'var(--text-secondary)',
                }}
              >
                #{tag}
              </button>
            );
          })}
        </div>

        {/* Min Grant Funding Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <DollarSign size={14} color="var(--color-grant)" />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Min Grant:</span>
          <input
            type="range"
            min="0"
            max="2500000"
            step="100000"
            value={minFunding}
            onChange={(e) => onMinFundingChange(Number(e.target.value))}
            style={{
              width: 90,
              accentColor: 'var(--color-grant)',
              cursor: 'pointer',
            }}
          />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: minFunding > 0 ? 'var(--color-grant)' : 'var(--text-muted)', minWidth: 50 }}>
            {minFunding > 0 ? `$${(minFunding / 1000000).toFixed(1)}M+` : 'All'}
          </span>
        </div>

        {/* Reset Filter Button */}
        {areFiltersApplied && (
          <button
            onClick={onResetFilters}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <RefreshCcw size={12} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
