import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
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

const TYPE_COLORS: Record<NodeType, string> = {
  person: '#10b981',
  institution: '#f59e0b',
  collaborative: '#f97316',
  program: '#3b82f6',
  product: '#6366f1',
  grant: '#ef4444',
  research: '#a855f7',
  meeting: '#06b6d4',
  topic: '#e11d48',
};

const TYPE_ICONS: Record<NodeType, string> = {
  person: '👤',
  institution: '🏛️',
  collaborative: '🤝',
  program: '🚀',
  product: '📦',
  grant: '💰',
  research: '📄',
  meeting: '📅',
  topic: '🎯',
};

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
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphEdge> | null>(null);
  const [isPhysicsRunning, setIsPhysicsRunning] = useState<boolean>(true);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: GraphNode } | null>(null);

  // Compute connected neighbor lookup for fast hover isolation
  const activeFocusNodeId = hoveredNodeId || selectedNodeId;

  const connectedMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    edges.forEach((e) => {
      const s = typeof e.source === 'object' ? e.source.id : e.source;
      const t = typeof e.target === 'object' ? e.target.id : e.target;
      if (!map.has(s)) map.set(s, new Set());
      if (!map.has(t)) map.set(t, new Set());
      map.get(s)!.add(t);
      map.get(t)!.add(s);
    });
    return map;
  }, [edges]);

  // Determine node size based on type and importance
  const getNodeRadius = useCallback((node: GraphNode): number => {
    switch (node.type) {
      case 'institution':
      case 'collaborative':
        return 28;
      case 'program':
      case 'product':
      case 'grant':
      case 'topic':
        return 24;
      case 'person':
        return 22;
      case 'research':
      case 'meeting':
      default:
        return 19;
    }
  }, []);

  // Initialize and run D3 force simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Simulation setup
    const simulation = d3
      .forceSimulation<GraphNode, GraphEdge>(nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphEdge>(edges)
          .id((d) => d.id)
          .distance((d) => {
            const edgeType = d.type;
            if (edgeType === 'MEMBER_OF' || edgeType === 'STEERS') return 95;
            if (edgeType === 'DEVELOPS' || edgeType === 'POWERS') return 80;
            if (edgeType === 'AFFILIATED_WITH') return 75;
            if (edgeType === 'LEADS' || edgeType === 'HOSTS') return 80;
            if (edgeType === 'FUNDS' || edgeType === 'AWARDED_TO') return 100;
            return 85;
          })
          .strength(0.7)
      )
      .force('charge', d3.forceManyBody().strength(-460).distanceMax(650))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.08))
      .force(
        'collide',
        d3
          .forceCollide<GraphNode>()
          .radius((d) => getNodeRadius(d) + 16)
          .iterations(2)
      );

    simulationRef.current = simulation;

    // Main draw loop
    const render = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const transform = transformRef.current;

      ctx.save();
      ctx.clearRect(0, 0, width * dpr, height * dpr);
      ctx.scale(dpr, dpr);

      // Apply zoom & pan transform
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      // Render subtle background grid
      const gridSize = 40;
      const minX = -transform.x / transform.k;
      const minY = -transform.y / transform.k;
      const maxX = minX + width / transform.k;
      const maxY = minY + height / transform.k;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = Math.floor(minX / gridSize) * gridSize; x <= maxX; x += gridSize) {
        ctx.moveTo(x, minY);
        ctx.lineTo(x, maxY);
      }
      for (let y = Math.floor(minY / gridSize) * gridSize; y <= maxY; y += gridSize) {
        ctx.moveTo(minX, y);
        ctx.lineTo(maxX, y);
      }
      ctx.stroke();

      const isFilteringActive = activeFocusNodeId !== null || highlightedPathNodeIds.length > 0;
      const pathEdgeSet = new Set(highlightedPathEdgeIds);
      const pathNodeSet = new Set(highlightedPathNodeIds);
      const directNeighbors = activeFocusNodeId ? connectedMap.get(activeFocusNodeId) || new Set() : new Set();

      // --- RENDER EDGES ---
      edges.forEach((edge) => {
        const source = edge.source as GraphNode;
        const target = edge.target as GraphNode;
        if (!source.x || !source.y || !target.x || !target.y) return;

        const isPathEdge = pathEdgeSet.has(edge.id);
        const isConnectedToFocus =
          activeFocusNodeId && (source.id === activeFocusNodeId || target.id === activeFocusNodeId);

        let alpha = 0.25;
        let strokeColor = 'rgba(148, 163, 184, 0.35)';
        let lineWidth = 1.5;

        if (isPathEdge) {
          alpha = 1.0;
          strokeColor = '#f97316';
          lineWidth = 3.5;
        } else if (isConnectedToFocus) {
          alpha = 0.9;
          strokeColor = '#fbbf24';
          lineWidth = 2.5;
        } else if (isFilteringActive) {
          alpha = 0.05;
        }

        ctx.strokeStyle = strokeColor;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = lineWidth;

        // Draw line with directional offset
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.hypot(dx, dy);

        if (dist === 0) return;

        const targetRadius = getNodeRadius(target) + 6;
        const arrowX = target.x - (dx / dist) * targetRadius;
        const arrowY = target.y - (dy / dist) * targetRadius;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(arrowX, arrowY);
        ctx.stroke();

        // Directional arrow head
        const arrowAngle = Math.atan2(dy, dx);
        const arrowLength = isConnectedToFocus || isPathEdge ? 8 : 6;

        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(
          arrowX - arrowLength * Math.cos(arrowAngle - Math.PI / 7),
          arrowY - arrowLength * Math.sin(arrowAngle - Math.PI / 7)
        );
        ctx.lineTo(
          arrowX - arrowLength * Math.cos(arrowAngle + Math.PI / 7),
          arrowY - arrowLength * Math.sin(arrowAngle + Math.PI / 7)
        );
        ctx.closePath();
        ctx.fill();

        // Render relationship label if highlighted (with how / modality attributes)
        const rawLabel = edge.label || edge.type;
        const displayLabel = edge.how
          ? `${rawLabel} (${edge.how})`
          : edge.modality
          ? `${rawLabel} [${edge.modality}]`
          : rawLabel;

        if ((isConnectedToFocus || isPathEdge) && displayLabel) {
          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;

          ctx.font = '500 10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const textWidth = ctx.measureText(displayLabel).width;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
          ctx.fillRect(midX - textWidth / 2 - 5, midY - 8, textWidth + 10, 16);

          ctx.strokeStyle = isPathEdge ? 'rgba(249, 115, 22, 0.5)' : 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 1;
          ctx.strokeRect(midX - textWidth / 2 - 5, midY - 8, textWidth + 10, 16);

          ctx.fillStyle = isPathEdge ? '#fb923c' : '#cbd5e1';
          ctx.fillText(displayLabel, midX, midY);
        }
      });

      // --- RENDER NODES ---
      nodes.forEach((node) => {
        if (!node.x || !node.y) return;

        const isSelected = selectedNodeId === node.id;
        const isHovered = hoveredNodeId === node.id;
        const isPathNode = pathNodeSet.has(node.id);
        const isNeighbor = directNeighbors.has(node.id);
        const isFocus = node.id === activeFocusNodeId;

        let alpha = 1.0;
        if (isFilteringActive) {
          if (!isFocus && !isNeighbor && !isPathNode) {
            alpha = 0.15;
          }
        }

        ctx.globalAlpha = alpha;
        const radius = getNodeRadius(node);
        const baseColor = TYPE_COLORS[node.type] || '#64748b';

        // Outer glow halo for selected / focused nodes
        if (isSelected || isHovered || isPathNode) {
          ctx.save();
          const gradient = ctx.createRadialGradient(node.x, node.y, radius * 0.8, node.x, node.y, radius * 2.2);
          gradient.addColorStop(0, baseColor + '99');
          gradient.addColorStop(1, baseColor + '00');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius * 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Main node background circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();

        // Node border ring
        ctx.lineWidth = isSelected || isHovered || isPathNode ? 3.5 : 2;
        ctx.strokeStyle = isSelected ? '#ffffff' : baseColor;
        ctx.stroke();

        // Node inner fill
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius - 3, 0, Math.PI * 2);
        ctx.fillStyle = baseColor + '28';
        ctx.fill();

        // Node Icon or Glyph
        ctx.font = `${Math.round(radius * 0.72)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(TYPE_ICONS[node.type] || '●', node.x, node.y + 1);

        // Label below node
        const showLabel = transform.k > 0.42 || isSelected || isHovered || isFocus || isNeighbor;
        if (showLabel) {
          ctx.font = `${isSelected || isHovered ? '600 12px Outfit, sans-serif' : '500 11px Inter, sans-serif'}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';

          const label = node.label.length > 28 ? node.label.slice(0, 26) + '...' : node.label;
          const labelY = node.y + radius + 5;
          const textWidth = ctx.measureText(label).width;

          ctx.fillStyle = 'rgba(7, 9, 14, 0.75)';
          ctx.fillRect(node.x - textWidth / 2 - 3, labelY - 1, textWidth + 6, 14);

          ctx.fillStyle = isSelected || isHovered ? '#ffffff' : '#cbd5e1';
          ctx.fillText(label, node.x, labelY);
        }
      });

      ctx.restore();
    };

    simulation.on('tick', render);

    return () => {
      simulation.stop();
    };
  }, [nodes, edges, activeFocusNodeId, selectedNodeId, hoveredNodeId, highlightedPathNodeIds, highlightedPathEdgeIds, connectedMap, getNodeRadius]);

  // Zoom and Drag Handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const zoom = d3
      .zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.15, 3.5])
      .on('zoom', (event) => {
        transformRef.current = event.transform;
        if (simulationRef.current) {
          simulationRef.current.alpha(0.01).restart();
        }
      });

    d3.select(canvas).call(zoom);

    // Hit test helper
    const getNodeAtPosition = (px: number, py: number): GraphNode | null => {
      const transform = transformRef.current;
      const x = (px - transform.x) / transform.k;
      const y = (py - transform.y) / transform.k;

      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        if (n.x && n.y) {
          const r = getNodeRadius(n);
          if (Math.hypot(n.x - x, n.y - y) <= r + 4) {
            return n;
          }
        }
      }
      return null;
    };

    // Canvas click & drag interactions
    let isDragging = false;
    let draggedNode: GraphNode | null = null;

    const onMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      const hit = getNodeAtPosition(px, py);
      if (hit) {
        isDragging = true;
        draggedNode = hit;
        hit.fx = hit.x;
        hit.fy = hit.y;
        if (simulationRef.current) {
          simulationRef.current.alphaTarget(0.3).restart();
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      if (isDragging && draggedNode) {
        const transform = transformRef.current;
        draggedNode.fx = (px - transform.x) / transform.k;
        draggedNode.fy = (py - transform.y) / transform.k;
      } else {
        const hit = getNodeAtPosition(px, py);
        canvas.style.cursor = hit ? 'pointer' : 'grab';
        onHoverNode(hit ? hit.id : null);
        if (hit) {
          setTooltip({ x: e.clientX, y: e.clientY, node: hit });
        } else {
          setTooltip(null);
        }
      }
    };

    const onMouseUp = () => {
      if (isDragging && draggedNode) {
        draggedNode.fx = null;
        draggedNode.fy = null;
        isDragging = false;
        draggedNode = null;
        if (simulationRef.current) {
          simulationRef.current.alphaTarget(0);
        }
      }
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const hit = getNodeAtPosition(px, py);
      onSelectNode(hit || null);
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('click', onClick);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('click', onClick);
    };
  }, [nodes, getNodeRadius, onSelectNode, onHoverNode]);

  // Controls Actions
  const handleZoom = (direction: 'in' | 'out') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const factor = direction === 'in' ? 1.35 : 0.75;
    d3.select(canvas)
      .transition()
      .duration(280)
      .call(d3.zoom<HTMLCanvasElement, unknown>().scaleBy, factor);
  };

  const handleReset = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    d3.select(canvas)
      .transition()
      .duration(450)
      .call(d3.zoom<HTMLCanvasElement, unknown>().transform, d3.zoomIdentity);
  };

  const togglePhysics = () => {
    if (!simulationRef.current) return;
    if (isPhysicsRunning) {
      simulationRef.current.stop();
      setIsPhysicsRunning(false);
    } else {
      simulationRef.current.alpha(0.3).restart();
      setIsPhysicsRunning(true);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-canvas)',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />

      {/* Floating Canvas Controls HUD */}
      <div
        className="glass-panel"
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          padding: 8,
          zIndex: 20,
        }}
      >
        <button
          onClick={() => handleZoom('in')}
          title="Zoom In"
          style={{
            padding: 8,
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={() => handleZoom('out')}
          title="Zoom Out"
          style={{
            padding: 8,
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={handleReset}
          title="Reset View"
          style={{
            padding: 8,
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Maximize2 size={18} />
        </button>
        <div style={{ height: 1, backgroundColor: 'var(--border-subtle)', margin: '2px 0' }} />
        <button
          onClick={togglePhysics}
          title={isPhysicsRunning ? 'Pause Physics' : 'Resume Physics'}
          style={{
            padding: 8,
            color: isPhysicsRunning ? 'var(--color-collaborative)' : 'var(--text-muted)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {isPhysicsRunning ? <Pause size={18} /> : <Play size={18} />}
        </button>
      </div>

      {/* Hover Tooltip */}
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
            maxWidth: 260,
            boxShadow: 'var(--shadow-lg)',
            border: `1px solid ${TYPE_COLORS[tooltip.node.type]}55`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span className={`badge badge-${tooltip.node.type}`}>{tooltip.node.type}</span>
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f8fafc', marginBottom: 2 }}>
            {tooltip.node.label}
          </div>
          {tooltip.node.description && (
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.3,
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
