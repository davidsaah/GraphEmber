import React, { useRef, useEffect, useLayoutEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import type { GraphNode, GraphEdge, NodeType } from '../types/graph';
import { ZoomIn, ZoomOut, Maximize2, Play, Pause } from 'lucide-react';

interface NetworkCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  highlightedPathNodeIds?: string[];
  highlightedPathEdgeIds?: string[];
  onSelectNode: (node: GraphNode | null) => void;
  hoveredNodeId: string | null;
  onHoverNode: (nodeId: string | null) => void;
}

// Mirrors the --color-* tokens in index.css (canvas can't read CSS variables cheaply per frame).
const TYPE_COLORS: Record<NodeType, string> = {
  person: '#a78bfa',
  institution: '#8fa3bf',
  collaborative: '#eb7c26',
  program: '#34c38f',
  product: '#4fb3d9',
  grant: '#e23e1d',
  research: '#c084fc',
  meeting: '#22d3ee',
  topic: '#f6ba13',
};

const HIGHLIGHT = '#f6ba13';
const BG = '#07090e';
// Screen space taken by the floating header and filter bar, kept clear when fitting the graph.
const VIEW_PADDING = { top: 170, right: 40, bottom: 40, left: 40 };

const edgeEnds = (e: GraphEdge) => ({
  s: typeof e.source === 'object' ? e.source.id : e.source,
  t: typeof e.target === 'object' ? e.target.id : e.target,
});

export const NetworkCanvas: React.FC<NetworkCanvasProps> = ({
  nodes,
  edges,
  selectedNodeId,
  highlightedPathNodeIds = [],
  highlightedPathEdgeIds = [],
  onSelectNode,
  hoveredNodeId,
  onHoverNode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const zoomRef = useRef<d3.ZoomBehavior<HTMLCanvasElement, unknown> | null>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphEdge> | null>(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const drawRef = useRef<() => void>(() => {});
  const [isPhysicsRunning, setIsPhysicsRunning] = useState<boolean>(false);
  const runningRef = useRef(false);
  const markRunning = useCallback((running: boolean) => {
    if (runningRef.current === running) return;
    runningRef.current = running;
    setIsPhysicsRunning(running);
  }, []);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: GraphNode } | null>(null);

  const activeFocusNodeId = hoveredNodeId || selectedNodeId;

  const { connectedMap, degree } = useMemo(() => {
    const map = new Map<string, Set<string>>();
    edges.forEach((e) => {
      const { s, t } = edgeEnds(e);
      if (!map.has(s)) map.set(s, new Set());
      if (!map.has(t)) map.set(t, new Set());
      map.get(s)!.add(t);
      map.get(t)!.add(s);
    });
    const deg = new Map<string, number>();
    map.forEach((set, id) => deg.set(id, set.size));
    return { connectedMap: map, degree: deg };
  }, [edges]);

  // Size encodes connectedness, so hubs read first and the long tail stays small.
  const getNodeRadius = useCallback(
    (node: GraphNode): number => {
      const d = degree.get(node.id) || 0;
      const base = node.type === 'topic' || node.type === 'collaborative' ? 7 : 5;
      return Math.min(30, base + Math.sqrt(d) * 2.4);
    },
    [degree]
  );

  // Labels for hubs are always on; the rest appear on zoom or focus.
  const labelThreshold = useMemo(() => {
    const sorted = [...degree.values()].sort((a, b) => b - a);
    return sorted[Math.min(sorted.length - 1, 24)] ?? 0;
  }, [degree]);

  const fitToView = useCallback((duration = 0) => {
    const canvas = canvasRef.current;
    const zoom = zoomRef.current;
    const { width, height } = sizeRef.current;
    const placed = nodes.filter((n) => n.x !== undefined && n.y !== undefined);
    if (!canvas || !zoom || placed.length === 0 || !width) return;

    const xs = placed.map((n) => n.x!);
    const ys = placed.map((n) => n.y!);
    const [x0, x1] = [Math.min(...xs) - 30, Math.max(...xs) + 30];
    const [y0, y1] = [Math.min(...ys) - 30, Math.max(...ys) + 40];
    const availW = width - VIEW_PADDING.left - VIEW_PADDING.right;
    const availH = height - VIEW_PADDING.top - VIEW_PADDING.bottom;
    const k = Math.min(2, availW / (x1 - x0), availH / (y1 - y0));
    const tx = VIEW_PADDING.left + (availW - k * (x1 - x0)) / 2 - k * x0;
    const ty = VIEW_PADDING.top + (availH - k * (y1 - y0)) / 2 - k * y0;
    const target = d3.zoomIdentity.translate(tx, ty).scale(k);
    const sel = d3.select(canvas);
    if (duration > 0) sel.transition().duration(duration).call(zoom.transform, target);
    else sel.call(zoom.transform, target);
  }, [nodes]);

  // Draw function: reads the latest props on every call, so hover/selection only redraws.
  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const { width, height } = sizeRef.current;
    const dpr = window.devicePixelRatio || 1;
    const transform = transformRef.current;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, width, height);
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);

    const pathEdgeSet = new Set(highlightedPathEdgeIds);
    const pathNodeSet = new Set(highlightedPathNodeIds);
    const isFiltering = activeFocusNodeId !== null || pathNodeSet.size > 0;
    const neighbors = activeFocusNodeId ? connectedMap.get(activeFocusNodeId) || new Set<string>() : new Set<string>();
    const px = 1 / transform.k; // one screen pixel in graph units

    // --- edges ---
    const emphasized: GraphEdge[] = [];
    ctx.lineWidth = px;
    ctx.strokeStyle = isFiltering ? 'rgba(143, 163, 191, 0.05)' : 'rgba(143, 163, 191, 0.16)';
    ctx.beginPath();
    for (const edge of edges) {
      const s = edge.source as GraphNode;
      const t = edge.target as GraphNode;
      if (s.x === undefined || t.x === undefined) continue;
      const focused = activeFocusNodeId && (s.id === activeFocusNodeId || t.id === activeFocusNodeId);
      if (pathEdgeSet.has(edge.id) || focused) {
        emphasized.push(edge);
        continue;
      }
      ctx.moveTo(s.x, s.y!);
      ctx.lineTo(t.x, t.y!);
    }
    ctx.stroke();

    for (const edge of emphasized) {
      const s = edge.source as GraphNode;
      const t = edge.target as GraphNode;
      const onPath = pathEdgeSet.has(edge.id);
      ctx.strokeStyle = onPath ? HIGHLIGHT : 'rgba(246, 186, 19, 0.6)';
      ctx.lineWidth = (onPath ? 2.5 : 1.5) * px;
      ctx.beginPath();
      ctx.moveTo(s.x!, s.y!);
      ctx.lineTo(t.x!, t.y!);
      ctx.stroke();

      // Arrowhead at the target's edge to show direction
      const dx = t.x! - s.x!;
      const dy = t.y! - s.y!;
      const dist = Math.hypot(dx, dy);
      if (dist === 0) continue;
      const r = getNodeRadius(t) + 2 * px;
      const ax = t.x! - (dx / dist) * r;
      const ay = t.y! - (dy / dist) * r;
      const ang = Math.atan2(dy, dx);
      const len = 7 * px;
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - len * Math.cos(ang - 0.45), ay - len * Math.sin(ang - 0.45));
      ctx.lineTo(ax - len * Math.cos(ang + 0.45), ay - len * Math.sin(ang + 0.45));
      ctx.closePath();
      ctx.fill();
    }

    // --- nodes ---
    for (const node of nodes) {
      if (node.x === undefined || node.y === undefined) continue;
      const isFocus = node.id === activeFocusNodeId;
      const lit = isFocus || neighbors.has(node.id) || pathNodeSet.has(node.id);
      const radius = getNodeRadius(node);
      const color = TYPE_COLORS[node.type] || '#8fa3bf';

      ctx.globalAlpha = isFiltering && !lit ? 0.18 : 1;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = 1.5 * px;
      ctx.strokeStyle = BG;
      ctx.stroke();

      if (node.id === selectedNodeId || (isFocus && node.id === hoveredNodeId)) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 4 * px, 0, Math.PI * 2);
        ctx.lineWidth = 2 * px;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    // --- labels (drawn last, most important first, skipping any that would overlap) ---
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.lineJoin = 'round';
    const candidates = nodes
      .filter((node) => {
        if (node.x === undefined || node.y === undefined) return false;
        const d = degree.get(node.id) || 0;
        const lit = node.id === activeFocusNodeId || neighbors.has(node.id) || pathNodeSet.has(node.id);
        const isHub = d >= labelThreshold && d > 2;
        return isFiltering ? lit : isHub || transform.k > 1.6;
      })
      .sort((a, b) => {
        const rank = (n: GraphNode) =>
          (n.id === activeFocusNodeId || n.id === selectedNodeId ? 1000 : 0) + (degree.get(n.id) || 0);
        return rank(b) - rank(a);
      });
    const placed: Array<[number, number, number, number]> = [];
    for (const node of candidates) {
      const isFocus = node.id === activeFocusNodeId || node.id === selectedNodeId;
      const strong = isFocus || node.type === 'topic' || node.type === 'collaborative';
      const size = (strong ? 12 : 11) * px;
      ctx.font = `${strong ? 600 : 500} ${size}px Inter, system-ui, sans-serif`;
      const label = node.label.length > 32 ? node.label.slice(0, 30) + '…' : node.label;
      const y = node.y! + getNodeRadius(node) + 4 * px;
      const w = ctx.measureText(label).width;
      const box: [number, number, number, number] = [node.x! - w / 2 - 2 * px, y, node.x! + w / 2 + 2 * px, y + size * 1.25];
      const overlaps = placed.some((p) => box[0] < p[2] && box[2] > p[0] && box[1] < p[3] && box[3] > p[1]);
      if (overlaps && !isFocus) continue;
      placed.push(box);
      ctx.lineWidth = 3 * px;
      ctx.strokeStyle = BG;
      ctx.strokeText(label, node.x!, y);
      ctx.fillStyle = strong ? '#f1f5f9' : '#aab8cc';
      ctx.fillText(label, node.x!, y);
    }

    ctx.restore();
  };

  // Keep the latest draw closure for the simulation and zoom callbacks, and redraw on any
  // visual change (hover, selection, path highlight) without restarting the physics.
  useLayoutEffect(() => {
    drawRef.current = draw;
    draw();
  });

  // Canvas sizing + zoom behaviour (once)
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth;
      const height = container.clientHeight;
      sizeRef.current = { width, height };
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      drawRef.current();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    const zoom = d3
      .zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.1, 5])
      .on('zoom', (event) => {
        transformRef.current = event.transform;
        drawRef.current();
      });
    zoomRef.current = zoom;
    d3.select(canvas).call(zoom).on('dblclick.zoom', null);

    return () => observer.disconnect();
  }, []);

  // Force simulation: rebuilt only when the graph itself changes
  useEffect(() => {
    const { width, height } = sizeRef.current;
    const isFirstLayout = nodes.every((n) => n.x === undefined);

    const simulation = d3
      .forceSimulation<GraphNode, GraphEdge>(nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphEdge>(edges)
          .id((d) => d.id)
          .distance((d) => (d.type === 'PARTNERS_IN' ? 110 : d.type === 'HAS_TOPIC' ? 70 : 60))
          .strength((d) => {
            const { s, t } = edgeEnds(d);
            // Weaker pull on links into big hubs keeps them from collapsing into a ball
            return 1 / Math.min(degree.get(s) || 1, degree.get(t) || 1);
          })
      )
      .force('charge', d3.forceManyBody<GraphNode>().strength((d) => -60 - getNodeRadius(d) * 8).distanceMax(500))
      // Loosely connected nodes get a stronger pull to the centre so they don't drift to the edges
      .force('x', d3.forceX<GraphNode>(width / 2).strength((d) => ((degree.get(d.id) || 0) <= 1 ? 0.18 : 0.05)))
      .force('y', d3.forceY<GraphNode>(height / 2).strength((d) => ((degree.get(d.id) || 0) <= 1 ? 0.22 : 0.07)))
      .force('collide', d3.forceCollide<GraphNode>().radius((d) => getNodeRadius(d) + 3).iterations(2));

    simulationRef.current = simulation;

    if (isFirstLayout) {
      // Settle the layout before the first frame so the opening view is still and framed
      simulation.stop();
      simulation.tick(320);
      fitToView();
      drawRef.current();
    } else {
      simulation.alpha(0.3).restart();
    }

    simulation.on('tick', () => {
      markRunning(true);
      drawRef.current();
    });
    simulation.on('end', () => markRunning(false));

    return () => {
      simulation.stop();
    };
  }, [nodes, edges, degree, getNodeRadius, fitToView, markRunning]);

  // Pointer interactions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getNodeAt = (px: number, py: number): GraphNode | null => {
      const [x, y] = transformRef.current.invert([px, py]);
      const slack = 4 / transformRef.current.k;
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        if (n.x === undefined || n.y === undefined) continue;
        if (Math.hypot(n.x - x, n.y - y) <= getNodeRadius(n) + slack) return n;
      }
      return null;
    };

    let dragged: GraphNode | null = null;
    let moved = false;

    const local = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top] as const;
    };

    const onMouseDown = (e: MouseEvent) => {
      const hit = getNodeAt(...local(e));
      if (!hit) return;
      e.stopImmediatePropagation(); // don't start a pan
      dragged = hit;
      moved = false;
      hit.fx = hit.x;
      hit.fy = hit.y;
    };

    const onMouseMove = (e: MouseEvent) => {
      const [px, py] = local(e);
      if (dragged) {
        if (!moved) {
          moved = true;
          simulationRef.current?.alphaTarget(0.2).restart();
        }
        const [x, y] = transformRef.current.invert([px, py]);
        dragged.fx = x;
        dragged.fy = y;
        return;
      }
      if (e.target !== canvas) return;
      const hit = getNodeAt(px, py);
      canvas.style.cursor = hit ? 'pointer' : 'grab';
      onHoverNode(hit ? hit.id : null);
      setTooltip(hit ? { x: e.clientX, y: e.clientY, node: hit } : null);
    };

    const onMouseUp = () => {
      if (!dragged) return;
      dragged.fx = null;
      dragged.fy = null;
      dragged = null;
      simulationRef.current?.alphaTarget(0);
    };

    const onClick = (e: MouseEvent) => {
      if (moved) {
        moved = false;
        return;
      }
      onSelectNode(getNodeAt(...local(e)));
    };

    const onLeave = () => {
      onHoverNode(null);
      setTooltip(null);
    };

    canvas.addEventListener('mousedown', onMouseDown, { capture: true });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('mouseleave', onLeave);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown, { capture: true });
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, [nodes, getNodeRadius, onSelectNode, onHoverNode]);

  const handleZoom = (direction: 'in' | 'out') => {
    const canvas = canvasRef.current;
    if (!canvas || !zoomRef.current) return;
    d3.select(canvas)
      .transition()
      .duration(250)
      .call(zoomRef.current.scaleBy, direction === 'in' ? 1.4 : 0.7);
  };

  const togglePhysics = () => {
    const sim = simulationRef.current;
    if (!sim) return;
    if (isPhysicsRunning) {
      sim.stop();
      markRunning(false);
    } else {
      sim.alpha(0.4).restart();
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: 'var(--bg-canvas)' }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

      {/* Canvas controls */}
      <div
        className="glass-panel"
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          padding: 4,
          zIndex: 20,
          borderRadius: 'var(--radius-md)',
        }}
      >
        <button className="icon-btn" onClick={() => handleZoom('in')} title="Zoom in" aria-label="Zoom in">
          <ZoomIn size={16} />
        </button>
        <button className="icon-btn" onClick={() => handleZoom('out')} title="Zoom out" aria-label="Zoom out">
          <ZoomOut size={16} />
        </button>
        <button className="icon-btn" onClick={() => fitToView(450)} title="Fit graph to screen" aria-label="Fit graph to screen">
          <Maximize2 size={16} />
        </button>
        <div style={{ height: 1, backgroundColor: 'var(--border-subtle)', margin: '2px 4px' }} />
        <button
          className="icon-btn"
          onClick={togglePhysics}
          title={isPhysicsRunning ? 'Pause layout' : 'Re-run layout'}
          aria-label={isPhysicsRunning ? 'Pause layout' : 'Re-run layout'}
        >
          {isPhysicsRunning ? <Pause size={16} /> : <Play size={16} />}
        </button>
      </div>

      {/* Legend */}
      <Legend nodes={nodes} />

      {/* Hover tooltip */}
      {tooltip && (
        <div
          className="glass-panel"
          style={{
            position: 'fixed',
            left: tooltip.x + 14,
            top: tooltip.y + 14,
            pointerEvents: 'none',
            zIndex: 100,
            padding: '8px 12px',
            maxWidth: 280,
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span className={`badge badge-${tooltip.node.type}`}>{tooltip.node.type}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {degree.get(tooltip.node.id) || 0} connections
            </span>
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 2 }}>
            {tooltip.node.label}
          </div>
          {tooltip.node.description && (
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.35,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {tooltip.node.description}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const LEGEND_LABELS: Record<NodeType, string> = {
  topic: 'Topic',
  collaborative: 'Collaborative',
  institution: 'Organization',
  product: 'Tool / system',
  program: 'Program',
  person: 'Person',
  grant: 'Grant',
  research: 'Research',
  meeting: 'Meeting',
};

const Legend: React.FC<{ nodes: GraphNode[] }> = ({ nodes }) => {
  const present = new Set(nodes.map((n) => n.type));
  const types = (Object.keys(LEGEND_LABELS) as NodeType[]).filter((t) => present.has(t));
  return (
    <div
      className="hide-sm"
      style={{
        position: 'absolute',
        bottom: 20,
        right: 72,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '8px 12px',
        zIndex: 20,
        fontSize: '0.72rem',
        color: 'var(--text-secondary)',
        pointerEvents: 'none',
      }}
    >
      {types.map((t) => (
        <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: TYPE_COLORS[t] }} />
          {LEGEND_LABELS[t]}
        </span>
      ))}
      <span style={{ color: 'var(--text-muted)' }}>· size = connections</span>
    </div>
  );
};
