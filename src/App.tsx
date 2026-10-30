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
import { ImpactTimeline, PERIODS, IMPACT_INDICATORS } from './components/ImpactTimeline';
import type { PeriodKey } from './components/ImpactTimeline';

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
  const [period, setPeriod] = useState<PeriodKey>('all');

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

  // Impact over time: keep what existed by the chosen date and show that date's ratings.
  // Ratings are written onto the node objects so the force layout keeps their positions.
  const periodNodes = useMemo(() => {
    const p = PERIODS.find((x) => x.key === period)!;
    return nodes.filter((node) => {
      if (node.impact) {
        const keys = Object.keys(node.impact).sort();
        const key = period === 'all' ? keys[keys.length - 1] : period;
        node.activeImpact = node.impact[key];
      }
      return !node.startDate || node.startDate <= p.cutoff;
    });
  }, [nodes, period]);

  const ratingCounts = useMemo(() => {
    let live = 0;
    let rated = 0;
    periodNodes.forEach((n) => {
      if (n.type !== 'product' || !n.activeImpact) return;
      IMPACT_INDICATORS.forEach((i) => {
        rated += 1;
        if (n.activeImpact![i] === 'live') live += 1;
      });
    });
    return { live, rated };
  }, [periodNodes]);

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
    const cutoff = PERIODS.find((x) => x.key === period)!.cutoff;
    return edges.filter((edge) => {
      if (edge.startDate && edge.startDate > cutoff) return false;
      const linkImpact = edge.properties?.impact as Record<string, string> | undefined;
      if (linkImpact) {
        const keys = Object.keys(linkImpact).sort();
        edge.label = `${edge.properties!.linkage}: ${linkImpact[period === 'all' ? keys[keys.length - 1] : period]}`;
      }
      const s = typeof edge.source === 'object' ? edge.source.id : edge.source;
      const t = typeof edge.target === 'object' ? edge.target.id : edge.target;
      return filteredNodeIds.has(s) && filteredNodeIds.has(t);
    });
  }, [edges, filteredNodeIds, period]);

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

      {/* Bottom-left AIC:W impact-over-time selector */}
      <ImpactTimeline
        period={period}
        onChange={setPeriod}
        shownCount={filteredNodes.length}
        liveCells={ratingCounts.live}
        ratedCells={ratingCounts.rated}
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
