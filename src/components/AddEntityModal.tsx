import React, { useState } from 'react';
import type { GraphNode, GraphEdge, NodeType, RelationType } from '../types/graph';
import { X, Layers, Share2 } from 'lucide-react';

interface AddEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: GraphNode[];
  onAddNode: (node: GraphNode) => void;
  onAddEdge: (edge: GraphEdge) => void;
}

export const AddEntityModal: React.FC<AddEntityModalProps> = ({
  isOpen,
  onClose,
  nodes,
  onAddNode,
  onAddEdge,
}) => {
  const [tab, setTab] = useState<'node' | 'edge'>('node');

  // Node form fields
  const [nodeType, setNodeType] = useState<NodeType>('person');
  const [label, setLabel] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [extraField1, setExtraField1] = useState<string>('');
  const [extraField2, setExtraField2] = useState<string>('');

  // Edge form fields
  const [sourceId, setSourceId] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [relationType, setRelationType] = useState<RelationType>('AFFILIATED_WITH');
  const [edgeLabel, setEdgeLabel] = useState<string>('');

  if (!isOpen) return null;

  const handleCreateNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const base: GraphNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      label: label.trim(),
      description: description.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    } as any;

    if (nodeType === 'person') {
      (base as any).title = extraField1;
      (base as any).email = extraField2;
    } else if (nodeType === 'grant') {
      (base as any).amount = Number(extraField1) || 0;
      (base as any).grantNumber = extraField2;
    } else if (nodeType === 'collaborative') {
      (base as any).mission = extraField1;
      (base as any).governanceModel = extraField2 || 'Consortium';
    } else if (nodeType === 'product') {
      (base as any).productType = extraField1 || 'Software Library';
      (base as any).version = extraField2 || 'v1.0.0';
    }

    onAddNode(base);
    onClose();
  };

  const handleCreateEdge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !targetId || sourceId === targetId) return;

    const newEdge: GraphEdge = {
      id: `edge-${Date.now()}`,
      source: sourceId,
      target: targetId,
      type: relationType,
      label: edgeLabel.trim() || relationType.replace(/_/g, ' '),
    };

    onAddEdge(newEdge);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 540,
          backgroundColor: 'var(--bg-surface-elevated)',
          padding: 24,
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setTab('node')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: tab === 'node' ? 'var(--color-collaborative)' : 'var(--bg-surface)',
                color: tab === 'node' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              <Layers size={15} />
              <span>Add Entity</span>
            </button>
            <button
              onClick={() => setTab('edge')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: tab === 'edge' ? 'var(--color-collaborative)' : 'var(--bg-surface)',
                color: tab === 'edge' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              <Share2 size={15} />
              <span>Add Relationship</span>
            </button>
          </div>

          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Tab 1: Node Form */}
        {tab === 'node' ? (
          <form onSubmit={handleCreateNode} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                Entity Type
              </label>
              <select
                value={nodeType}
                onChange={(e) => setNodeType(e.target.value as NodeType)}
                style={{
                  width: '100%',
                  height: 38,
                  padding: '0 10px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="person">👤 Person</option>
                <option value="institution">🏛️ Institution</option>
                <option value="collaborative">🤝 Collaborative</option>
                <option value="program">🚀 Program</option>
                <option value="product">📦 Product</option>
                <option value="grant">💰 Grant</option>
                <option value="research">📄 Research</option>
                <option value="meeting">📅 Meeting</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                Name / Label *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Jane Doe or Pyretechnics Core"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                style={{
                  width: '100%',
                  height: 38,
                  padding: '0 12px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                Description
              </label>
              <textarea
                rows={2}
                placeholder="Brief summary or mission..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            {/* Dynamic Type Specific Inputs */}
            {nodeType === 'grant' && (
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Funding Amount ($)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 500000"
                    value={extraField1}
                    onChange={(e) => setExtraField1(e.target.value)}
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 12px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Grant Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NSF-2401-01"
                    value={extraField2}
                    onChange={(e) => setExtraField2(e.target.value)}
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 12px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>
            )}

            {nodeType === 'person' && (
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Title / Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Research Fellow"
                    value={extraField1}
                    onChange={(e) => setExtraField1(e.target.value)}
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 12px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. jane@institution.edu"
                    value={extraField2}
                    onChange={(e) => setExtraField2(e.target.value)}
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 12px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>
            )}

            {nodeType === 'product' && (
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Product Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Software Library or Web Platform"
                    value={extraField1}
                    onChange={(e) => setExtraField1(e.target.value)}
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 12px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Version
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. v1.0.0"
                    value={extraField2}
                    onChange={(e) => setExtraField2(e.target.value)}
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 12px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                Tags (comma-separated)
              </label>
              <input
                type="text"
                placeholder="Wildfire, AI/ML, Policy"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                style={{
                  width: '100%',
                  height: 38,
                  padding: '0 12px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                marginTop: 10,
                height: 40,
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                color: '#ffffff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Create Entity Node
            </button>
          </form>
        ) : (
          /* Tab 2: Edge Form */
          <form onSubmit={handleCreateEdge} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                Source Node *
              </label>
              <select
                required
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                style={{
                  width: '100%',
                  height: 38,
                  padding: '0 10px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="">Select source entity...</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    [{n.type.toUpperCase()}] {n.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                Target Node *
              </label>
              <select
                required
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                style={{
                  width: '100%',
                  height: 38,
                  padding: '0 10px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="">Select target entity...</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    [{n.type.toUpperCase()}] {n.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                Relationship Type
              </label>
              <select
                value={relationType}
                onChange={(e) => setRelationType(e.target.value as RelationType)}
                style={{
                  width: '100%',
                  height: 38,
                  padding: '0 10px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="AFFILIATED_WITH">AFFILIATED_WITH</option>
                <option value="LEADS">LEADS</option>
                <option value="MEMBER_OF">MEMBER_OF</option>
                <option value="DEVELOPS">DEVELOPS</option>
                <option value="POWERS">POWERS</option>
                <option value="DEPLOYED_IN">DEPLOYED_IN</option>
                <option value="INTEGRATES_WITH">INTEGRATES_WITH</option>
                <option value="FUNDS">FUNDS</option>
                <option value="AWARDED_TO">AWARDED_TO</option>
                <option value="AUTHORED">AUTHORED</option>
                <option value="ATTENDED">ATTENDED</option>
                <option value="ORGANIZES">ORGANIZES</option>
                <option value="COLLABORATES_WITH">COLLABORATES_WITH</option>
                <option value="STEERS">STEERS</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                Label (optional override)
              </label>
              <input
                type="text"
                placeholder="e.g. Co-Lead or Main Funder"
                value={edgeLabel}
                onChange={(e) => setEdgeLabel(e.target.value)}
                style={{
                  width: '100%',
                  height: 38,
                  padding: '0 12px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={!sourceId || !targetId || sourceId === targetId}
              style={{
                marginTop: 10,
                height: 40,
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                color: '#ffffff',
                fontWeight: 600,
                cursor: 'pointer',
                opacity: !sourceId || !targetId || sourceId === targetId ? 0.5 : 1,
              }}
            >
              Create Relationship Edge
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
