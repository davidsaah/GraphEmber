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

const ALL_TYPES: NodeType[] = [
  'person',
  'institution',
  'collaborative',
  'program',
  'product',
  'grant',
  'research',
  'meeting',
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
    </div>
  );
};

export default App;
