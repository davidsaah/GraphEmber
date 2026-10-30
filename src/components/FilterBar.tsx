import React from 'react';
import type { NodeType, GraphNode } from '../types/graph';
import { Layers, DollarSign, Tag, RefreshCcw } from 'lucide-react';
import { TYPE_STYLE } from '../theme';
import { TypeMarker } from './TypeMarker';

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

const TYPE_ORDER: NodeType[] = ['institution', 'collaborative', 'program', 'product', 'grant', 'person', 'meeting', 'topic', 'research'];
const TYPE_CONFIG = TYPE_ORDER.map((type) => ({ type, label: TYPE_STYLE[type].label }));

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
      topic: 0,
    };
    nodes.forEach((n) => {
      if (counts[n.type] !== undefined) {
        counts[n.type]++;
      }
    });
    return counts;
  }, [nodes]);

  // Extract top tags, prioritizing the AIC:W views
  const topTags = React.useMemo(() => {
    const tagMap = new Map<string, number>();
    nodes.forEach((n) => {
      n.tags?.forEach((t) => tagMap.set(t, (tagMap.get(t) || 0) + 1));
    });
    const sorted = Array.from(tagMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);
    const priority = ['AIC:W', 'Rated project', 'Live now', 'AIC:W partner network', 'Sandbox Round 1', 'AIC:W logo board', 'Workstream', 'North Star'];
    const result: string[] = [];
    priority.forEach((p) => {
      if (sorted.includes(p)) result.push(p);
    });
    sorted.forEach((t) => {
      if (!result.includes(t)) result.push(t);
    });
    return result.slice(0, 9);
  }, [nodes]);

  const areFiltersApplied =
    activeTypes.size < TYPE_CONFIG.length || selectedTags.size > 0 || minFunding > 0;

  return (
    <div
      className="glass-panel"
      style={{
        position: 'absolute',
        top: 76,
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
            Show
          </span>
        </div>

        {TYPE_CONFIG.map(({ type, label }) => {
          const isActive = activeTypes.has(type);
          const count = typeCounts[type] || 0;
          if (count === 0) return null;

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
                backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'rgba(255, 255, 255, 0.96)',
                border: `1px solid ${isActive ? '#C9CCD1' : 'var(--border-subtle)'}`,
                opacity: isActive ? 1 : 0.55,
                color: isActive ? '#202124' : 'var(--text-muted)',
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
              <TypeMarker type={type} size={11} />
              <span>{label}</span>
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '1px 5px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isActive ? '#F1F0EC' : 'rgba(32, 33, 36, 0.04)',
                  color: isActive ? '#202124' : 'var(--text-muted)',
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
                  backgroundColor: isSelected ? 'rgba(255, 159, 64, 0.2)' : 'var(--bg-surface)',
                  border: `1px solid ${isSelected ? 'var(--color-collaborative)' : 'var(--border-subtle)'}`,
                  color: isSelected ? '#B85C00' : 'var(--text-secondary)',
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
            onMouseEnter={(e) => (e.currentTarget.style.color = '#202124')}
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
