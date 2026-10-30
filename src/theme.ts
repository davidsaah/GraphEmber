import type { NodeType } from './types/graph';

// AIC:W "Tahoe refreshed" palette (see the AIC:W deck style): greys from the logo, flame accents,
// fixed workstream colours. Every entity type gets a flat colour and a geometric marker.
export type MarkerShape = 'circle' | 'hexagon' | 'square' | 'diamond' | 'triangle' | 'ring' | 'dot';

export const TYPE_STYLE: Record<NodeType, { label: string; color: string; shape: MarkerShape }> = {
  institution: { label: 'Organisations', color: '#5F6368', shape: 'circle' },
  collaborative: { label: 'Collaboratives', color: '#FF9F40', shape: 'hexagon' },
  program: { label: 'Programmes', color: '#C0D1D8', shape: 'square' },
  product: { label: 'Projects and tools', color: '#F8CB9E', shape: 'square' },
  grant: { label: 'Funding', color: '#6AA84F', shape: 'diamond' },
  person: { label: 'People', color: '#9AA0A6', shape: 'dot' },
  meeting: { label: 'Convenings', color: '#FFE563', shape: 'ring' },
  topic: { label: 'Topics', color: '#E06666', shape: 'triangle' },
  research: { label: 'Research', color: '#C9CCD1', shape: 'square' },
};

export const INK = '#202124';
export const INK_2 = '#5F6368';
export const RULE = '#E6E2DA';

// Path for a marker centred on (x, y) with half-size r
export function markerPath(ctx: CanvasRenderingContext2D | Path2D, shape: MarkerShape, x: number, y: number, r: number) {
  switch (shape) {
    case 'square':
      ctx.rect(x - r * 0.88, y - r * 0.88, r * 1.76, r * 1.76);
      break;
    case 'diamond':
      ctx.moveTo(x, y - r * 1.15);
      ctx.lineTo(x + r * 1.15, y);
      ctx.lineTo(x, y + r * 1.15);
      ctx.lineTo(x - r * 1.15, y);
      ctx.closePath();
      break;
    case 'triangle':
      ctx.moveTo(x, y - r * 1.15);
      ctx.lineTo(x + r * 1.1, y + r * 0.85);
      ctx.lineTo(x - r * 1.1, y + r * 0.85);
      ctx.closePath();
      break;
    case 'hexagon':
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i + Math.PI / 6;
        const px = x + r * 1.08 * Math.cos(a);
        const py = y + r * 1.08 * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    default:
      ctx.moveTo(x + r, y);
      ctx.arc(x, y, r, 0, Math.PI * 2);
  }
}
