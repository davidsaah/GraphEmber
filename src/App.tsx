import React, { useState, useMemo, useCallback, Suspense, lazy } from 'react';
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
import { CwiBrandModal } from './components/CwiBrandModal';
import { CwiLogo } from './components/CwiLogo';
import { ChatPanel } from './components/ChatPanel';

// The map library is large, so it loads only when the map view is opened
const MapView = lazy(() => import('./components/MapView'));

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

  // Selection & Hover state
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Modal states
  const [isPathFinderOpen, setIsPathFinderOpen] = useState<boolean>(false);
  const [isMetricsOpen, setIsMetricsOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isOntologyOpen, setIsOntologyOpen] = useState<boolean>(false);
  const [isCwiModalOpen, setIsCwiModalOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [view, setView] = useState<'network' | 'map'>('network');

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

  // Filtered nodes and edges
  const filteredNodes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return nodes.filter((node) => {
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
  }, [nodes, activeTypes, minFunding, selectedTags, searchQuery]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return edges.filter((edge) => {
      const s = typeof edge.source === 'object' ? edge.source.id : edge.source;
      const t = typeof edge.target === 'object' ? edge.target.id : edge.target;
      return filteredNodeIds.has(s) && filteredNodeIds.has(t);
    });
  }, [edges, filteredNodeIds]);

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

  // Focus Climate & Wildfire Institute (CWI) core initiatives
  const handleFocusCwiEcosystem = useCallback(() => {
    const cwiNodeIds = [
      'inst-cwi',
      'prog-rhf',
      'prod-firelines',
      'collab-efa',
      'prod-firesat',
      'inst-calfire',
      'inst-google-org',
      'inst-muon-space',
      'topic-fire-monitoring',
      'topic-home-hardening',
      'topic-decision-support',
    ];
    const cwiEdgeIds = [
      'edge-cwi-rhf',
      'edge-cwi-firelines',
      'edge-cwi-efa',
      'edge-calfire-rhf',
      'edge-google-efa',
      'edge-muon-efa',
      'edge-efa-firesat',
      'edge-firesat-topic-mon',
      'edge-rhf-topic-hh',
      'edge-firelines-topic-dec',
    ];
    setPathNodeIds(cwiNodeIds);
    setPathEdgeIds(cwiEdgeIds);
    const cwiNode = nodes.find((n) => n.id === 'inst-cwi');
    if (cwiNode) setSelectedNode(cwiNode);
  }, [nodes]);

  // Focus Resilient Home Fund (RHF) specifically
  const handleFocusResilientHomeFund = useCallback(() => {
    const rhfNodeIds = [
      'prog-rhf',
      'inst-cwi',
      'inst-calfire',
      'topic-home-hardening',
    ];
    const rhfEdgeIds = [
      'edge-cwi-rhf',
      'edge-calfire-rhf',
      'edge-rhf-topic-hh',
    ];
    setPathNodeIds(rhfNodeIds);
    setPathEdgeIds(rhfEdgeIds);
    const rhfNode = nodes.find((n) => n.id === 'prog-rhf');
    if (rhfNode) setSelectedNode(rhfNode);
  }, [nodes]);

  return (
    <div
      style={
        {
          position: 'relative',
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          // Room the chat panel takes on the right; the dossier and canvas controls shift left of it
          '--right-inset': isChatOpen ? 'calc(min(400px, 100vw - 32px) + 12px)' : '0px',
        } as React.CSSProperties
      }
    >
      {/* Top Header Bar */}
      <Header
        nodes={nodes}
        edges={edges}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenPathFinder={() => setIsPathFinderOpen(true)}
        onOpenAnalytics={() => setIsMetricsOpen(true)}
        onOpenOntology={() => setIsOntologyOpen(true)}
        onOpenCwiModal={() => setIsCwiModalOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onExportData={handleExportData}
        onOpenChat={() => setIsChatOpen((open) => !open)}
        view={view}
        onViewChange={setView}
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

      {view === 'network' ? (
        <>
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
        </>
      ) : (
        <Suspense fallback={null}>
          <MapView
            nodes={filteredNodes}
            edges={filteredEdges}
            selectedNodeId={selectedNode ? selectedNode.id : null}
            highlightedPathNodeIds={pathNodeIds}
            onSelectNode={setSelectedNode}
            rightInset={isChatOpen ? 412 : 0}
          />
        </Suspense>
      )}

      {/* Slide-out Entity Dossier Drawer */}
      <DossierDrawer
        node={selectedNode}
        allNodes={nodes}
        allEdges={edges}
        onClose={() => setSelectedNode(null)}
        onSelectNode={setSelectedNode}
      />

      {/* Chat about the network, grounded in the graph data */}
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        nodes={nodes}
        edges={edges}
        onSelectNode={setSelectedNode}
        onHighlight={handleApplyPathHighlight}
      />

      {/* Bottom-left attribution */}
      <button
        onClick={() => setIsCwiModalOpen(true)}
        title="About the Climate & Wildfire Institute"
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          zIndex: 25,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
        }}
      >
        <CwiLogo variant="mark" size={16} glow={false} />
        <span>
          A Climate & Wildfire Institute tool · showing {filteredNodes.length} of {nodes.length}
        </span>
      </button>

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

      {/* Climate & Wildfire Institute Brand & Initiatives Modal */}
      <CwiBrandModal
        isOpen={isCwiModalOpen}
        onClose={() => setIsCwiModalOpen(false)}
        onFocusCwiEcosystem={handleFocusCwiEcosystem}
        onFocusResilientHomeFund={handleFocusResilientHomeFund}
        nodes={nodes}
      />
    </div>
  );
};

export default App;
