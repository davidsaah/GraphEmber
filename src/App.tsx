import React, { useState, useMemo, useCallback, useEffect, Suspense, lazy } from 'react';
import { X, Globe } from 'lucide-react';
import type { GraphNode, GraphEdge, NodeType } from './types/graph';
import { INITIAL_DATASET } from './data/initialData';
import { Header, type AppView } from './components/Header';
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
import { DataView } from './components/DataView';
import { InsightsPanel } from './components/InsightsPanel';
import { InboxPanel } from './components/InboxPanel';
import { applyApproved, WEB_TAG } from './research/applyApproved';
import { decide, loadQueue } from './research/api';
import type { DecisionInput, Proposal, ResearchRun, ReviewQueue } from './research/types';

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
  const [baseNodes, setNodes] = useState<GraphNode[]>(INITIAL_DATASET.nodes);
  const [baseEdges, setEdges] = useState<GraphEdge[]>(INITIAL_DATASET.edges);

  // Web research review queue; approved findings are layered over the curated data
  const [queue, setQueue] = useState<ReviewQueue | null>(null);
  const [researchAvailable, setResearchAvailable] = useState<boolean>(false);
  const [isInboxOpen, setIsInboxOpen] = useState<boolean>(false);
  const [researchScope, setResearchScope] = useState<GraphNode[]>([]);
  useEffect(() => {
    loadQueue()
      .then((q) => {
        setQueue(q);
        setResearchAvailable(true);
      })
      .catch(() => setResearchAvailable(false));
  }, []);
  const { nodes, edges } = useMemo(
    () => applyApproved(baseNodes, baseEdges, queue?.proposals || []),
    [baseNodes, baseEdges, queue],
  );
  const pending = useMemo(() => (queue?.proposals || []).filter((p) => p.status === 'pending'), [queue]);
  const pendingNodeIds = useMemo(() => new Set(pending.flatMap((p) => [p.subjectId, ...(p.targetId ? [p.targetId] : [])])), [pending]);
  const ghostEdges = useMemo(
    () => pending.filter((p) => p.kind === 'connection' && p.targetId).map((p) => ({ source: p.subjectId, target: p.targetId! })),
    [pending],
  );

  // Search & Filtering state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTypes, setActiveTypes] = useState<Set<NodeType>>(new Set(ALL_TYPES));
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  // Default scope: CWI's own projects and partners (the CWI Projects and Collaborators sheet)
  const [cwiOnly, setCwiOnly] = useState<boolean>(true);
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
  const [view, setView] = useState<AppView>('network');
  const [insightsOpen, setInsightsOpen] = useState<boolean>(true);

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
    setCwiOnly(true);
    setMinFunding(0);
    setPathNodeIds([]);
    setPathEdgeIds([]);
  }, []);

  // Filtered nodes and edges
  const scopedNodes = useMemo(
    () => (cwiOnly ? nodes.filter((n) => n.tags?.includes('CWI Network') || n.tags?.includes(WEB_TAG)) : nodes),
    [nodes, cwiOnly],
  );
  const filteredNodes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return scopedNodes.filter((node) => {
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
  }, [scopedNodes, activeTypes, minFunding, selectedTags, searchQuery]);

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
    const rhfNodeIds = ['prog-rhf', 'inst-cwi', 'inst-calfire', 'topic-home-hardening'];
    const rhfEdgeIds = ['edge-cwi-rhf', 'edge-calfire-rhf', 'edge-rhf-topic-hh'];
    setPathNodeIds(rhfNodeIds);
    setPathEdgeIds(rhfEdgeIds);
    const rhfNode = nodes.find((n) => n.id === 'prog-rhf');
    if (rhfNode) setSelectedNode(rhfNode);
  }, [nodes]);

  // Research the selected entity, or the highlighted set, on the web
  const handleOpenResearch = useCallback(() => {
    const ids = selectedNode ? [selectedNode.id] : pathNodeIds;
    setResearchScope(ids.map((id) => nodes.find((n) => n.id === id)).filter((n): n is GraphNode => !!n));
    setIsInboxOpen(true);
  }, [selectedNode, pathNodeIds, nodes]);

  const handleOpenInbox = useCallback(() => {
    setResearchScope([]);
    setIsInboxOpen(true);
  }, []);

  const handleResearched = useCallback((run: ResearchRun, found: Proposal[]) => {
    setQueue((q) => ({ version: 1, ...q, proposals: [...(q?.proposals || []), ...found], runs: [run, ...(q?.runs || [])] }));
  }, []);

  const handleDecide = useCallback(async (input: DecisionInput) => {
    const updated = await decide(input);
    setQueue((q) => (q ? { ...q, proposals: q.proposals.map((p) => (p.id === updated.id ? updated : p)) } : q));
  }, []);

  // Clear the selected entity and any highlighted path or chat answer
  const hasSelection = selectedNode !== null || pathNodeIds.length > 0;
  const handleClearSelection = useCallback(() => {
    setSelectedNode(null);
    setHoveredNodeId(null);
    setPathNodeIds([]);
    setPathEdgeIds([]);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const anyModalOpen = isPathFinderOpen || isMetricsOpen || isAddModalOpen || isOntologyOpen || isCwiModalOpen;
      if (e.key === 'Escape' && !anyModalOpen) {
        if (isInboxOpen) setIsInboxOpen(false);
        else handleClearSelection();
      }
      // "/" jumps to search, unless the user is already typing somewhere
      const typing =
        e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
      if (e.key === '/' && !typing && !anyModalOpen) {
        e.preventDefault();
        document.getElementById('graph-search')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClearSelection, isPathFinderOpen, isMetricsOpen, isAddModalOpen, isOntologyOpen, isCwiModalOpen, isInboxOpen]);

  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Stage: header, filters and the current view; the chat is docked to its right */}
      <div className="stage">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenPathFinder={() => setIsPathFinderOpen(true)}
          onOpenAnalytics={() => setIsMetricsOpen(true)}
          onOpenOntology={() => setIsOntologyOpen(true)}
          onOpenCwiModal={() => setIsCwiModalOpen(true)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onExportData={handleExportData}
          view={view}
          onViewChange={setView}
          inboxCount={pending.length}
          onOpenInbox={handleOpenInbox}
        />

        <FilterBar
          nodes={scopedNodes}
          activeTypes={activeTypes}
          onToggleType={handleToggleType}
          onSelectAllTypes={handleSelectAllTypes}
          selectedTags={selectedTags}
          onToggleTag={handleToggleTag}
          minFunding={minFunding}
          onMinFundingChange={setMinFunding}
          onResetFilters={handleResetFilters}
          cwiOnly={cwiOnly}
          onToggleCwiOnly={() => setCwiOnly((v) => !v)}
          insightsOpen={insightsOpen && view !== 'data'}
          onToggleInsights={view !== 'data' ? () => setInsightsOpen((v) => !v) : undefined}
        />

        <div className="stage-body">
          {insightsOpen && view !== 'data' && (
            <InsightsPanel
              nodes={filteredNodes}
              edges={filteredEdges}
              cwiOnly={cwiOnly}
              selectedNodeId={selectedNode ? selectedNode.id : null}
              onSelectNode={setSelectedNode}
              onHoverNode={setHoveredNodeId}
              onHighlight={(ids, edgeIds) => {
                setSelectedNode(null);
                handleApplyPathHighlight(ids, edgeIds);
              }}
              onClose={() => setInsightsOpen(false)}
            />
          )}
          <div className="viewport">
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
                  pendingNodeIds={pendingNodeIds}
                  ghostEdges={ghostEdges}
                />
              </>
            ) : view === 'map' ? (
              <Suspense fallback={null}>
                <MapView
                  nodes={filteredNodes}
                  edges={filteredEdges}
                  selectedNodeId={selectedNode ? selectedNode.id : null}
                  highlightedPathNodeIds={pathNodeIds}
                  onSelectNode={setSelectedNode}
                />
              </Suspense>
            ) : null}

            {view === 'data' && (
              <DataView
                nodes={filteredNodes}
                edges={filteredEdges}
                selectedNodeId={selectedNode ? selectedNode.id : null}
                onSelectNode={setSelectedNode}
                searchQuery={searchQuery}
              />
            )}

            {hasSelection && (
              <div className="selection-pill" role="status">
                {selectedNode ? (
                  <span>
                    Selected <strong>{selectedNode.label}</strong>
                  </span>
                ) : (
                  <span>
                    <strong>{pathNodeIds.length}</strong> entities highlighted
                  </span>
                )}
                <button onClick={handleOpenResearch} title="Search the web for new learnings about this">
                  <Globe size={13} />
                  Research
                </button>
                <button onClick={handleClearSelection} title="Clear selection (Esc)">
                  <X size={13} />
                  Clear <kbd>Esc</kbd>
                </button>
              </div>
            )}

            {/* Slide-out Entity Dossier Drawer */}
            <DossierDrawer
              node={selectedNode}
              allNodes={nodes}
              allEdges={edges}
              onClose={() => setSelectedNode(null)}
              onSelectNode={setSelectedNode}
            />

            {/* Web research review queue */}
            <InboxPanel
              isOpen={isInboxOpen}
              onClose={() => setIsInboxOpen(false)}
              queue={queue}
              available={researchAvailable}
              scope={researchScope}
              nodes={nodes}
              edges={edges}
              onResearched={handleResearched}
              onDecide={handleDecide}
              onSelectNode={setSelectedNode}
            />
          </div>
        </div>

        {/* Status bar */}
        <footer className="status-bar">
          <button onClick={() => setIsCwiModalOpen(true)} title="About the Climate & Wildfire Institute" className="status-brand">
            <CwiLogo variant="mark" size={13} glow={false} />
            <span className="hide-xs">Climate & Wildfire Institute</span>
          </button>
          <span className="status-sep" />
          <span>
            Showing <strong>{filteredNodes.length}</strong> of {scopedNodes.length} entities ·{' '}
            <strong>{filteredEdges.length}</strong> links
          </span>
          <span style={{ flex: 1 }} />
          <span className="hide-md">
            Source: {cwiOnly ? 'CWI Projects and Collaborators' : 'CWI Projects and Collaborators + AI wildfire landscape'}
          </span>
          <span className="status-sep hide-md" />
          <span className="hide-sm">
            <kbd>/</kbd> search · <kbd>Esc</kbd> clear
          </span>
        </footer>

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

      {/* Chat about the network, always docked on the right */}
      <ChatPanel nodes={nodes} edges={edges} onSelectNode={setSelectedNode} onHighlight={handleApplyPathHighlight} />
    </div>
  );
};

export default App;
