import React, { useState, useMemo, useCallback } from 'react';
import type { GraphNode, GraphEdge, NodeType } from './types/graph';
import { INITIAL_DATASET } from './data/initialData';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { NetworkCanvas } from './components/NetworkCanvas';
import { DossierDrawer } from './components/DossierDrawer';
import { PathFinderModal } from './components/PathFinderModal';
import { MetricsModal } from './components/MetricsModal';
import { AddEntityModal } from './components/AddEntityModal';
import { OntologyModal } from './components/OntologyModal';
import { AicwAboutModal } from './components/AicwAboutModal';
import { ImpactTimeline, ALL_TIME, IMPACT_INDICATORS, monthRange, ratingKeyAt } from './components/ImpactTimeline';
import type { TimePoint } from './components/ImpactTimeline';

const ALL_TYPES: NodeType[] = [
  'person',
  'institution',
  'collaborative',
  'program',
  'product',
  'grant',
  'research',
  'meeting',
  'topic',
];

export const App: React.FC = () => {
  // Graph dataset state
  const [nodes, setNodes] = useState<GraphNode[]>(INITIAL_DATASET.nodes);
  const [edges, setEdges] = useState<GraphEdge[]>(INITIAL_DATASET.edges);

  // Search & Filtering state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTypes, setActiveTypes] = useState<Set<NodeType>>(new Set(ALL_TYPES));
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [minFunding, setMinFunding] = useState<number>(0);
  const [month, setMonth] = useState<string>(ALL_TIME);
  const [highlightNew, setHighlightNew] = useState<boolean>(false);

  // Selection & Hover state
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Modal states
  const [isPathFinderOpen, setIsPathFinderOpen] = useState<boolean>(false);
  const [isMetricsOpen, setIsMetricsOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isOntologyOpen, setIsOntologyOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);

  // Path finder highlight state
  const [pathNodeIds, setPathNodeIds] = useState<string[]>([]);
  const [pathEdgeIds, setPathEdgeIds] = useState<string[]>([]);

  // Toggle node type filter
  const handleToggleType = useCallback((type: NodeType) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) {
          next.delete(type);
        }
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const handleSelectAllTypes = useCallback(() => {
    setActiveTypes(new Set(ALL_TYPES));
  }, []);

  const handleToggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setActiveTypes(new Set(ALL_TYPES));
    setSelectedTags(new Set());
    setMinFunding(0);
    setPathNodeIds([]);
    setPathEdgeIds([]);
  }, []);

  // Time: every dated node and link has a startDate (and sometimes an endDate). A month shows
  // what existed by its end, and each rated project carries the latest rating on or before it.
  const months = useMemo(() => {
    const dates = [...nodes.map((n) => n.startDate), ...edges.map((e) => e.startDate)].filter(Boolean) as string[];
    const first = dates.reduce((a, b) => (b < a ? b : a), '9999-12');
    const last = dates.reduce((a, b) => (b > a ? b : a), '0000-01');
    return monthRange(first, last);
  }, [nodes, edges]);

  const cutoff = month === ALL_TIME ? '9999-12-31' : `${month}-31`;
  const newFrom = useMemo(() => {
    if (month === ALL_TIME) return '9999-12-31';
    const i = months.indexOf(month);
    return `${months[Math.max(0, i - 2)]}-01`;
  }, [month, months]);

  const existsAt = useCallback(
    (item: { startDate?: string; endDate?: string }, end: string) =>
      (!item.startDate || item.startDate <= end) && (!item.endDate || item.endDate > end),
    []
  );

  // Node objects are annotated in place so the force layout keeps their positions between months
  const periodNodes = useMemo(() => {
    return nodes.filter((node) => {
      if (node.impact) {
        const key = ratingKeyAt(month, Object.keys(node.impact));
        node.activeImpact = key ? node.impact[key] : undefined;
      }
      node.isNew = highlightNew && !!node.startDate && node.startDate >= newFrom && node.startDate <= cutoff;
      return existsAt(node, cutoff);
    });
  }, [nodes, month, cutoff, newFrom, highlightNew, existsAt]);

  // Month-by-month series for the trend chart
  const timeSeries = useMemo<TimePoint[]>(() => {
    return months.map((m) => {
      const end = `${m}-31`;
      let live = 0;
      let rated = 0;
      nodes.forEach((n) => {
        if (n.type !== 'product' || !n.impact || !existsAt(n, end)) return;
        const key = ratingKeyAt(m, Object.keys(n.impact));
        if (!key) return;
        IMPACT_INDICATORS.forEach((i) => {
          rated += 1;
          if (n.impact![key][i] === 'live') live += 1;
        });
      });
      return {
        month: m,
        organisations: edges.filter((e) => e.type === 'MEMBER_OF' && e.startDate && existsAt(e, end)).length,
        links: edges.filter((e) => e.startDate && existsAt(e, end)).length,
        live,
        rated,
      };
    });
  }, [months, nodes, edges, existsAt]);

  // Filtered nodes and edges
  const filteredNodes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return periodNodes.filter((node) => {
      // 1. Type filter
      if (!activeTypes.has(node.type)) return false;

      // 2. Minimum grant funding filter
      if (minFunding > 0) {
        if (node.type === 'grant') {
          const grantAmount = (node as any).amount || 0;
          if (grantAmount < minFunding) return false;
        }
      }

      // 3. Tags filter
      if (selectedTags.size > 0) {
        const nodeTags = node.tags || [];
        const hasTag = Array.from(selectedTags).some((t) => nodeTags.includes(t));
        if (!hasTag) return false;
      }

      // 4. Search query filter
      if (q) {
        const matchesLabel = node.label.toLowerCase().includes(q);
        const matchesDesc = node.description?.toLowerCase().includes(q);
        const matchesType = node.type.toLowerCase().includes(q);
        const matchesTags = node.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesLabel && !matchesDesc && !matchesType && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [periodNodes, activeTypes, minFunding, selectedTags, searchQuery]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return edges.filter((edge) => {
      if (!existsAt(edge, cutoff)) return false;
      edge.isNew = highlightNew && !!edge.startDate && edge.startDate >= newFrom;
      const linkImpact = edge.properties?.impact as Record<string, string> | undefined;
      if (linkImpact) {
        const key = ratingKeyAt(month, Object.keys(linkImpact));
        edge.label = `${edge.properties!.linkage}: ${key ? linkImpact[key] : 'none'}`;
      }
      const s = typeof edge.source === 'object' ? edge.source.id : edge.source;
      const t = typeof edge.target === 'object' ? edge.target.id : edge.target;
      return filteredNodeIds.has(s) && filteredNodeIds.has(t);
    });
  }, [edges, filteredNodeIds, cutoff, newFrom, highlightNew, month, existsAt]);

  // Node & Edge Creation Handlers
  const handleAddNode = useCallback((newNode: GraphNode) => {
    setNodes((prev) => [newNode, ...prev]);
    setSelectedNode(newNode);
  }, []);

  const handleAddEdge = useCallback((newEdge: GraphEdge) => {
    setEdges((prev) => [newEdge, ...prev]);
  }, []);

  // Export dataset to JSON
  const handleExportData = useCallback(() => {
    const exportObject = {
      metadata: {
        title: 'GraphEmber Network Export',
        exportedAt: new Date().toISOString(),
        nodeCount: nodes.length,
        edgeCount: edges.length,
      },
      nodes,
      edges,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'graphember_network_export.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [nodes, edges]);

  // Path highlight handlers
  const handleApplyPathHighlight = useCallback((pNodes: string[], pEdges: string[]) => {
    setPathNodeIds(pNodes);
    setPathEdgeIds(pEdges);
  }, []);

  const handleClearPathHighlight = useCallback(() => {
    setPathNodeIds([]);
    setPathEdgeIds([]);
  }, []);

  // Highlight the Earth Fire Alliance (EFA) & FireSat ontology ecosystem
  const handleFocusEcosystem = useCallback(() => {
    const efaNodeIds = [
      'collab-efa',
      'prod-firesat',
      'inst-google-org',
      'inst-muon-space',
      'inst-cwi',
      'topic-fire-monitoring',
      'topic-firesat',
    ];
    const efaEdgeIds = [
      'edge-google-efa',
      'edge-muon-efa',
      'edge-cwi-efa',
      'edge-efa-firesat',
      'edge-firesat-topic-mon',
      'edge-firesat-topic-sat',
    ];
    setPathNodeIds(efaNodeIds);
    setPathEdgeIds(efaEdgeIds);
    const efaNode = nodes.find((n) => n.id === 'collab-efa');
    if (efaNode) setSelectedNode(efaNode);
  }, [nodes]);

  // Highlight every AIC:W node and the links between them
  const handleFocusAicw = useCallback(() => {
    const ids = new Set(nodes.filter((n) => n.tags?.some((t) => t.startsWith('AIC:W'))).map((n) => n.id));
    const edgeIds = edges
      .filter((e) => {
        const s = typeof e.source === 'object' ? e.source.id : e.source;
        const t = typeof e.target === 'object' ? e.target.id : e.target;
        return ids.has(s) && ids.has(t);
      })
      .map((e) => e.id);
    setPathNodeIds(Array.from(ids));
    setPathEdgeIds(edgeIds);
    const core = nodes.find((n) => n.id === 'aicw');
    if (core) setSelectedNode(core);
  }, [nodes, edges]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Top Header Bar */}
      <Header
        nodes={nodes}
        edges={edges}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenPathFinder={() => setIsPathFinderOpen(true)}
        onOpenAnalytics={() => setIsMetricsOpen(true)}
        onOpenOntology={() => setIsOntologyOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onExportData={handleExportData}
      />

      {/* Floating Filter Bar */}
      <FilterBar
        nodes={nodes}
        activeTypes={activeTypes}
        onToggleType={handleToggleType}
        onSelectAllTypes={handleSelectAllTypes}
        selectedTags={selectedTags}
        onToggleTag={handleToggleTag}
        minFunding={minFunding}
        onMinFundingChange={setMinFunding}
        onResetFilters={handleResetFilters}
      />

      {/* Interactive 60fps Network Canvas */}
      <NetworkCanvas
        nodes={filteredNodes}
        edges={filteredEdges}
        selectedNodeId={selectedNode ? selectedNode.id : null}
        highlightedPathNodeIds={pathNodeIds}
        highlightedPathEdgeIds={pathEdgeIds}
        onSelectNode={setSelectedNode}
        hoveredNodeId={hoveredNodeId}
        onHoverNode={setHoveredNodeId}
      />

      {/* Slide-out Entity Dossier Drawer */}
      <DossierDrawer
        node={selectedNode}
        allNodes={nodes}
        allEdges={edges}
        onClose={() => setSelectedNode(null)}
        onSelectNode={setSelectedNode}
      />

      {/* Tagline band, as on every AIC:W deck slide */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 28,
          background: '#FFE8A5',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 12,
          zIndex: 20,
          fontSize: '0.75rem',
          color: '#202124',
        }}
      >
        <img src={`${import.meta.env.BASE_URL}aicw-flame.svg`} alt="" style={{ height: 16 }} />
        <span>Better inputs → better models → better decisions.</span>
        <span style={{ marginLeft: 'auto', color: '#5F6368' }}>AI Collaborative: Wildfires · with support from Google.org · ratings are PMO drafts, corrected live 3 Nov 2026</span>
      </div>

      {/* Bottom-left time slider, trend and rating legend */}
      <ImpactTimeline
        months={months}
        month={month}
        onChange={setMonth}
        series={timeSeries}
        shownCount={filteredNodes.length}
        newCount={filteredNodes.filter((n) => n.isNew).length + filteredEdges.filter((e) => e.isNew).length}
        highlightNew={highlightNew}
        onToggleHighlightNew={() => setHighlightNew((v) => !v)}
      />

      {/* Path Finder Modal */}
      <PathFinderModal
        isOpen={isPathFinderOpen}
        onClose={() => setIsPathFinderOpen(false)}
        nodes={nodes}
        edges={edges}
        onApplyPathHighlight={handleApplyPathHighlight}
        onClearPathHighlight={handleClearPathHighlight}
      />

      {/* Metrics & Analytics Modal */}
      <MetricsModal
        isOpen={isMetricsOpen}
        onClose={() => setIsMetricsOpen(false)}
        nodes={nodes}
        edges={edges}
        onSelectNode={setSelectedNode}
      />

      {/* Add Entity / Relationship Modal */}
      <AddEntityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        nodes={nodes}
        onAddNode={handleAddNode}
        onAddEdge={handleAddEdge}
      />

      {/* Firelines Graph Ontology Blueprint Modal */}
      <OntologyModal
        isOpen={isOntologyOpen}
        onClose={() => setIsOntologyOpen(false)}
        onFocusEcosystem={handleFocusEcosystem}
        nodes={nodes}
      />

      {/* AIC:W North Star, workstreams and rating scale */}
      <AicwAboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onFocusAicw={handleFocusAicw}
        nodes={nodes}
      />
    </div>
  );
};

export default App;
