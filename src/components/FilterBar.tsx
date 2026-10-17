import React from 'react';
import type { NodeType, GraphNode } from '../types/graph';
import { RotateCcw, PanelLeft } from 'lucide-react';
import { CwiLogo } from './CwiLogo';

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
  cwiOnly: boolean;
  onToggleCwiOnly: () => void;
  insightsOpen?: boolean;
  onToggleInsights?: () => void;
}

const TYPE_CONFIG: Array<{ type: NodeType; label: string; color: string }> = [
  { type: 'topic', label: 'Topics', color: 'var(--color-topic)' },
  { type: 'collaborative', label: 'Collaboratives', color: 'var(--color-collaborative)' },
  { type: 'institution', label: 'Organizations', color: 'var(--color-institution)' },
  { type: 'product', label: 'Tools & systems', color: 'var(--color-product)' },
  { type: 'program', label: 'Programs', color: 'var(--color-program)' },
  { type: 'person', label: 'People', color: 'var(--color-person)' },
  { type: 'grant', label: 'Grants', color: 'var(--color-grant)' },
  { type: 'research', label: 'Research', color: 'var(--color-research)' },
  { type: 'meeting', label: 'Meetings', color: 'var(--color-meeting)' },
];

// Tags that make useful lenses on this dataset, shown when present.
const FEATURED_TAGS = ['AI Charter', 'GWFC Funded', 'California', 'Primary Delivery', 'Program Funders', 'Government'];

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
  cwiOnly,
  onToggleCwiOnly,
  insightsOpen,
  onToggleInsights,
}) => {
  const typeCounts = React.useMemo(() => {
    const counts = new Map<NodeType, number>();
    nodes.forEach((n) => counts.set(n.type, (counts.get(n.type) || 0) + 1));
    return counts;
  }, [nodes]);

  // Only offer types that actually have data
  const visibleTypes = TYPE_CONFIG.filter((t) => (typeCounts.get(t.type) || 0) > 0);

  const tags = React.useMemo(() => {
    // The featured tags describe the AI landscape sheet, so they only show outside the CWI scope
    if (cwiOnly) return [];
    const present = new Set(nodes.flatMap((n) => n.tags || []));
    return FEATURED_TAGS.filter((t) => present.has(t));
  }, [nodes, cwiOnly]);

  const hasGrants = (typeCounts.get('grant') || 0) > 0;
  const allTypesOn = visibleTypes.every((t) => activeTypes.has(t.type));
  const areFiltersApplied = !allTypesOn || selectedTags.size > 0 || minFunding > 0;

  return (
    <div className="app-toolbar">
      {onToggleInsights && (
        <>
          <button
            className="icon-btn hide-sm"
            aria-pressed={insightsOpen}
            onClick={onToggleInsights}
            title={insightsOpen ? 'Hide overview' : 'Show overview'}
            aria-label={insightsOpen ? 'Hide overview' : 'Show overview'}
          >
            <PanelLeft size={16} />
          </button>
          <span className="toolbar-divider hide-sm" />
        </>
      )}
      <div className="toolbar-group">
        <span className="toolbar-label">Scope</span>
        {/* Scope: CWI's own projects and partners, or everything including the AI landscape */}
        <button
          className="chip chip-scope"
          aria-pressed={cwiOnly}
          onClick={onToggleCwiOnly}
          title={
            cwiOnly
              ? 'Showing CWI projects and partners. Click to include the full AI wildfire landscape.'
              : 'Show only CWI projects and partners'
          }
        >
          <CwiLogo variant="mark" size={13} glow={false} />
          <span>CWI network</span>
        </button>
        <span className="toolbar-divider" />
        <span className="toolbar-label">Show</span>
        {visibleTypes.map(({ type, label, color }) => (
          <button
            key={type}
            className="chip"
            aria-pressed={activeTypes.has(type)}
            onClick={() => onToggleType(type)}
            style={{ '--c': color } as React.CSSProperties}
          >
            <span className="dot" />
            <span>{label}</span>
            <span className="count">{typeCounts.get(type)}</span>
          </button>
        ))}
        {!allTypesOn && (
          <button className="chip" onClick={onSelectAllTypes} style={{ borderStyle: 'dashed' }}>
            Show all
          </button>
        )}
      </div>

      {(tags.length > 0 || hasGrants) && (
        <div className="toolbar-group">
          <span className="toolbar-divider" />
          {tags.map((tag) => (
            <button key={tag} className="chip" aria-pressed={selectedTags.has(tag)} onClick={() => onToggleTag(tag)}>
              {tag}
            </button>
          ))}

          {hasGrants && (
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginLeft: 8,
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
              }}
            >
              Min grant
              <input
                id="min-grant"
                type="range"
                min="0"
                max="2500000"
                step="100000"
                value={minFunding}
                onChange={(e) => onMinFundingChange(Number(e.target.value))}
                style={{ width: 90, accentColor: 'var(--color-cwi-gold)' }}
              />
              <span style={{ minWidth: 40, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                {minFunding > 0 ? `$${(minFunding / 1000000).toFixed(1)}M+` : 'Any'}
              </span>
            </label>
          )}
        </div>
      )}

      {areFiltersApplied && (
        <button className="chip" onClick={onResetFilters} style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <RotateCcw size={12} />
          Reset
        </button>
      )}
    </div>
  );
};
