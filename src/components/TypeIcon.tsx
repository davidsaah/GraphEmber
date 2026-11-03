import React from 'react';
import type { NodeType } from '../types/graph';
import { TYPE_ICON_PATHS, TYPE_LABELS } from '../utils/typeIcons';

interface TypeIconProps {
  type: NodeType;
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

// Outline glyph for an entity type, drawn like the lucide-react icons used elsewhere.
export const TypeIcon: React.FC<TypeIconProps> = ({ type, size = 16, strokeWidth = 2, className, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    aria-hidden="true"
  >
    {(TYPE_ICON_PATHS[type] || []).map((d) => (
      <path key={d} d={d} />
    ))}
  </svg>
);

// A type's glyph in a rounded tile tinted with the type colour: the entity "avatar".
export const TypeBadge: React.FC<{ type: NodeType; size?: number; title?: string }> = ({ type, size = 36, title }) => (
  <span
    className={`type-badge badge-${type}`}
    style={{ width: size, height: size }}
    title={title ?? TYPE_LABELS[type]}
  >
    <TypeIcon type={type} size={Math.round(size * 0.5)} strokeWidth={1.75} />
  </span>
);
