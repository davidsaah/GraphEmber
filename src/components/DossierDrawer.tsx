import React from 'react';
import type { GraphNode, GraphEdge } from '../types/graph';
import {
  X,
  ExternalLink,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  GitBranch,
  BookOpen,
  ArrowRight,
  Shield,
  Layers,
  FileText,
  Radio,
} from 'lucide-react';
import { CwiLogo } from './CwiLogo';
import { TypeBadge } from './TypeIcon';

interface DossierDrawerProps {
  node: GraphNode | null;
  allNodes: GraphNode[];
  allEdges: GraphEdge[];
  onClose: () => void;
  onSelectNode: (node: GraphNode) => void;
  onRunReport?: (node: GraphNode) => void;
}

export const DossierDrawer: React.FC<DossierDrawerProps> = ({
  node,
  allNodes,
  allEdges,
  onClose,
  onSelectNode,
  onRunReport,
}) => {
  if (!node) return null;

  // Find all edges directly connected to this node
  const connectedEdges = allEdges.filter((e) => {
    const s = typeof e.source === 'object' ? e.source.id : e.source;
    const t = typeof e.target === 'object' ? e.target.id : e.target;
    return s === node.id || t === node.id;
  });

  // Group connected entities by relationship
  const connectionItems = connectedEdges.map((e) => {
    const sId = typeof e.source === 'object' ? e.source.id : e.source;
    const isSource = sId === node.id;
    const otherId = isSource
      ? typeof e.target === 'object'
        ? e.target.id
        : e.target
      : sId;
    const otherNode = allNodes.find((n) => n.id === otherId);

    return {
      edge: e,
      otherNode,
      relationLabel: e.label || e.type.replace(/_/g, ' ').toLowerCase(),
      isOutgoing: isSource,
    };
  }).filter((item): item is { edge: GraphEdge; otherNode: GraphNode; relationLabel: string; isOutgoing: boolean } => item.otherNode !== undefined);

  return (
    <aside
      className="glass-panel"
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        bottom: 12,
        width: 'min(var(--dossier-width), calc(100% - 24px))',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
        animation: 'slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <TypeBadge type={node.type} size={40} />
          <div>
            <span className={`badge badge-${node.type}`}>{node.type}</span>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: '#ffffff',
                marginTop: 4,
                lineHeight: 1.3,
              }}
            >
              {node.label}
            </h2>
            {onRunReport && (
              <button className="btn btn-primary dossier-report" onClick={() => onRunReport(node)} title="Open a stakeholder report on this node">
                <FileText size={13} />
                Run report
              </button>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          title="Close Dossier"
          style={{
            padding: 6,
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-muted)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* CWI Ecosystem Verified Badge */}
        {(node.id === 'inst-cwi' || node.tags?.includes('CWI') || node.id === 'prog-rhf' || node.id === 'prod-firelines') && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(246, 186, 19, 0.12) 0%, rgba(235, 124, 38, 0.18) 100%)',
              border: '1px solid rgba(246, 186, 19, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CwiLogo variant="mark" size={28} glow={false} />
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#f6ba13', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Climate & Wildfire Institute
                </span>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fed7aa', margin: 0 }}>
                  Boundary Organization Initiative
                </p>
              </div>
            </div>

            <a
              href={node.id === 'prog-rhf' ? 'https://www.resilienthomefund.org/' : 'https://www.climateandwildfire.org/'}
              target="_blank"
              rel="noopener noreferrer"
              title="Visit official portal"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(246, 186, 19, 0.2)',
                color: '#fed7aa',
                fontSize: '0.7rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span>Portal</span>
              <ExternalLink size={11} />
            </a>
          </div>
        )}

        {/* Description or Bio */}
        {node.description && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            {node.description}
          </div>
        )}

        {/* Entity-Specific Detailed Attributes */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: 14,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {/* Person details */}
          {node.type === 'person' && (
            <>
              {node.title && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
                  <Briefcase size={16} color="var(--color-person)" />
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{node.title}</span>
                </div>
              )}
              {node.role && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <strong>Role:</strong> {node.role}
                </div>
              )}
              {node.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#60a5fa' }}>
                  <Mail size={15} />
                  <a href={`mailto:${node.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {node.email}
                  </a>
                </div>
              )}
              {node.researchInterests && node.researchInterests.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Specialties:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                    {node.researchInterests.map((interest) => (
                      <span
                        key={interest}
                        style={{
                          fontSize: '0.72rem',
                          padding: '2px 6px',
                          borderRadius: 4,
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          color: '#34d399',
                        }}
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Collaborative details */}
          {node.type === 'collaborative' && (
            <>
              {node.mission && (
                <div style={{ fontSize: '0.85rem', color: '#fed7aa', fontStyle: 'italic', lineHeight: 1.45 }}>
                  "{node.mission}"
                </div>
              )}
              {node.governanceModel && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
                  <Shield size={16} color="var(--color-collaborative)" />
                  <span>
                    <strong>Governance:</strong> {node.governanceModel}
                  </span>
                </div>
              )}
              {node.formationYear && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
                  <Calendar size={16} color="var(--color-collaborative)" />
                  <span>Established in {node.formationYear}</span>
                </div>
              )}
              {node.focusAreas && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Focus Areas:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                    {node.focusAreas.map((area) => (
                      <span
                        key={area}
                        style={{
                          fontSize: '0.72rem',
                          padding: '2px 6px',
                          borderRadius: 4,
                          backgroundColor: 'rgba(249, 115, 22, 0.18)',
                          color: '#fb923c',
                        }}
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Product details */}
          {node.type === 'product' && (
            <>
              {node.productType && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
                  <Layers size={16} color="var(--color-product)" />
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{node.productType}</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {node.version && <div><strong>Version:</strong> {node.version}</div>}
                {node.status && <div><strong>Status:</strong> {node.status}</div>}
                {node.license && <div><strong>License:</strong> {node.license}</div>}
              </div>
              {node.techStack && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Technology Stack:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                    {node.techStack.map((tech) => (
                      <span
                        key={tech}
                        style={{
                          fontSize: '0.72rem',
                          padding: '2px 6px',
                          borderRadius: 4,
                          backgroundColor: 'rgba(99, 102, 241, 0.18)',
                          color: '#a5b4fc',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {node.repositoryUrl && (
                <a
                  href={node.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.8rem',
                    color: '#818cf8',
                    textDecoration: 'none',
                    marginTop: 4,
                  }}
                >
                  <GitBranch size={14} />
                  <span>Source Repository</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </>
          )}

          {/* Grant details */}
          {node.type === 'grant' && (
            <>
              {node.amount !== undefined && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DollarSign size={20} color="var(--color-grant)" />
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f87171' }}>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(node.amount)}
                  </span>
                </div>
              )}
              {node.grantNumber && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <strong>Award Code:</strong> <code>{node.grantNumber}</code>
                </div>
              )}
              {(node.startDate || node.endDate) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <Calendar size={14} />
                  <span>Period: {node.startDate} → {node.endDate}</span>
                </div>
              )}
              {node.abstract && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginTop: 4 }}>
                  {node.abstract}
                </div>
              )}
            </>
          )}

          {/* Research details */}
          {node.type === 'research' && (
            <>
              {node.venue && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#c084fc' }}>
                  <BookOpen size={16} />
                  <span><strong>Venue:</strong> {node.venue} ({node.year})</span>
                </div>
              )}
              {node.abstract && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {node.abstract}
                </div>
              )}
              {node.doiUrl && (
                <a
                  href={node.doiUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.8rem',
                    color: '#c084fc',
                    textDecoration: 'none',
                  }}
                >
                  <span>Access Publication / Artifact</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </>
          )}

          {/* Meeting details */}
          {node.type === 'meeting' && (
            <>
              {node.date && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--color-meeting)' }}>
                  <Calendar size={16} />
                  <span><strong>Date:</strong> {node.date}</span>
                </div>
              )}
              {node.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <MapPin size={15} />
                  <span>{node.location}</span>
                </div>
              )}
              {node.summary && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {node.summary}
                </div>
              )}
              {node.outcomes && node.outcomes.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Key Outcomes:
                  </span>
                  <ul style={{ paddingLeft: 18, marginTop: 4, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {node.outcomes.map((outcome, idx) => (
                      <li key={idx} style={{ marginBottom: 3 }}>{outcome}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* Institution details */}
          {node.type === 'institution' && (
            <>
              {node.acronym && (
                <div style={{ fontSize: '0.85rem' }}>
                  <strong>Acronym:</strong> {node.acronym} ({node.institutionType})
                </div>
              )}
              {node.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <MapPin size={15} />
                  <span>{node.location}</span>
                </div>
              )}
              {node.website && (
                <a
                  href={node.website}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.8rem',
                    color: '#fbbf24',
                    textDecoration: 'none',
                  }}
                >
                  <span>Official Website</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </>
          )}

          {/* Topic details */}
          {node.type === 'topic' && (
            <>
              {node.domain && (
                <div style={{ fontSize: '0.85rem' }}>
                  <strong>Domain:</strong> <span style={{ color: '#fb7185' }}>{node.domain}</span>
                </div>
              )}
              {node.scope && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <strong>Scope:</strong> {node.scope}
                </div>
              )}
              {node.modalities && node.modalities.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Observed Modalities:
                  </span>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                    {node.modalities.map((mod, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.74rem',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'rgba(225, 29, 72, 0.15)',
                          color: '#fb7185',
                          border: '1px solid rgba(225, 29, 72, 0.35)',
                          fontWeight: 500,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Radio size={11} />
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Tags */}
        {node.tags && node.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {node.tags.filter((t) => !t.startsWith('Works with: ')).map((t) => (
              <span
                key={t}
                style={{
                  fontSize: '0.72rem',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Collaborators named in the sheet that aren't entities in the graph */}
        {node.tags?.some((t) => t.startsWith('Works with: ')) && (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <span style={{ color: 'var(--text-muted)' }}>Also works with </span>
            {node.tags
              .filter((t) => t.startsWith('Works with: '))
              .map((t) => t.slice('Works with: '.length))
              .join(', ')}
          </p>
        )}

        {/* Connected Ecosystem Entities Section */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
              paddingBottom: 6,
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Connected Network ({connectionItems.length})
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {connectionItems.map(({ edge, otherNode, relationLabel }) => (
              <button
                key={edge.id}
                onClick={() => onSelectNode(otherNode)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
                  e.currentTarget.style.borderColor = 'var(--border-strong)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <TypeBadge type={otherNode.type} size={28} />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {otherNode.label}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                      <span style={{ fontSize: '0.72rem', color: '#fb923c', textTransform: 'capitalize' }}>
                        {relationLabel}
                      </span>
                      {edge.how && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'rgba(249, 115, 22, 0.15)',
                            color: '#fdba74',
                            border: '1px solid rgba(249, 115, 22, 0.3)',
                          }}
                        >
                          how: {edge.how}
                        </span>
                      )}
                      {edge.modality && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'rgba(225, 29, 72, 0.15)',
                            color: '#fda4af',
                            border: '1px solid rgba(225, 29, 72, 0.3)',
                          }}
                        >
                          modality: {edge.modality}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <ArrowRight size={14} color="var(--text-muted)" style={{ flexShrink: 0, marginLeft: 8 }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
