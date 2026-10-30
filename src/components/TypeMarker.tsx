import React from 'react';
import type { NodeType } from '../types/graph';
import { TYPE_STYLE } from '../theme';

// Small SVG version of the canvas marker, for legends, filters and the dossier
export const TypeMarker: React.FC<{ type: NodeType; size?: number; color?: string }> = ({ type, size = 12, color }) => {
  const { shape, color: c } = TYPE_STYLE[type];
  const fill = color || c;
  const s = size;
  const h = s / 2;
  const stroke = 'rgba(32, 33, 36, 0.35)';
  let el: React.ReactNode;
  switch (shape) {
    case 'square':
      el = <rect x={1.5} y={1.5} width={s - 3} height={s - 3} fill={fill} stroke={stroke} />;
      break;
    case 'diamond':
      el = <polygon points={`${h},0.5 ${s - 0.5},${h} ${h},${s - 0.5} 0.5,${h}`} fill={fill} stroke={stroke} />;
      break;
    case 'triangle':
      el = <polygon points={`${h},0.5 ${s - 0.5},${s - 1} 0.5,${s - 1}`} fill={fill} stroke={stroke} />;
      break;
    case 'hexagon': {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i + Math.PI / 6;
        return `${h + (h - 0.5) * Math.cos(a)},${h + (h - 0.5) * Math.sin(a)}`;
      }).join(' ');
      el = <polygon points={pts} fill={fill} stroke={stroke} />;
      break;
    }
    case 'ring':
      el = <circle cx={h} cy={h} r={h - 2} fill="#FFFFFF" stroke={fill === '#FFE563' ? '#C9A800' : fill} strokeWidth={2.5} />;
      break;
    case 'dot':
      el = <circle cx={h} cy={h} r={h - 2.5} fill={fill} stroke={stroke} />;
      break;
    default:
      el = <circle cx={h} cy={h} r={h - 1} fill={fill} stroke={stroke} />;
  }
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ flexShrink: 0, display: 'block' }} aria-hidden>
      {el}
    </svg>
  );
};
