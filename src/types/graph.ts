export type NodeType =
  | 'person'
  | 'program'
  | 'institution'
  | 'collaborative'
  | 'product'
  | 'grant'
  | 'research'
  | 'meeting'
  | 'topic';

export type RelationType =
  | 'AFFILIATED_WITH'
  | 'LEADS'
  | 'CO_INVESTIGATOR'
  | 'AUTHORED'
  | 'HOSTS'
  | 'FUNDS'
  | 'AWARDED_TO'
  | 'PRODUCES'
  | 'DEVELOPS'
  | 'POWERS'
  | 'INTEGRATES_WITH'
  | 'DEPLOYED_IN'
  | 'ATTENDED'
  | 'ORGANIZES'
  | 'MEMBER_OF'
  | 'CHAIRS'
  | 'PARTICIPATES_IN'
  | 'COLLABORATES_WITH'
  | 'STEERS'
  | 'RELATED_TO'
  | 'PARTNERS_IN'
  | 'HAS_PROJECT'
  | 'HAS_TOPIC'
  | 'SUBSIDIARY_OF'
  | 'INVOLVED_IN';

export interface BaseNode {
  id: string;
  type: NodeType;
  label: string;
  description?: string;
  tags?: string[];
  // D3 force simulation coordinates
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  radius?: number;
}

export interface PersonNode extends BaseNode {
  type: 'person';
  title?: string;
  role?: string;
  primaryAffiliationId?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  researchInterests?: string[];
}

export interface InstitutionNode extends BaseNode {
  type: 'institution';
  acronym?: string;
  institutionType?: 'University' | 'Federal Agency' | 'NGO' | 'Research Institute' | 'Consortium' | 'Private Sector';
  location?: string;
  website?: string;
}

export interface CollaborativeNode extends BaseNode {
  type: 'collaborative';
  acronym?: string;
  mission?: string;
  leadInstitutionId?: string;
  coordinatingLeadPersonId?: string;
  formationYear?: number;
  governanceModel?: 'Consortium' | 'Public-Private Partnership' | 'Interagency Working Group' | 'Academic Network' | 'Community Alliance';
  focusAreas?: string[];
}

export interface ProgramNode extends BaseNode {
  type: 'program';
  domain?: string;
  leadInstitutionId?: string;
  launchYear?: number;
  status?: 'Active' | 'Planned' | 'Archived';
}

export interface ProductNode extends BaseNode {
  type: 'product';
  productType?: 'Software Library' | 'Web Platform / SaaS' | 'API / Data Service' | 'CLI Tool' | 'AI / Machine Learning Model' | 'Data Pipeline' | 'Project / Hardware';
  version?: string;
  license?: string;
  repositoryUrl?: string;
  documentationUrl?: string;
  location?: string;
  status?: 'Operational' | 'Active Development' | 'Beta' | 'Prototype' | 'Ongoing';
  techStack?: string[];
}

export interface GrantNode extends BaseNode {
  type: 'grant';
  grantNumber?: string;
  funderInstitutionId?: string;
  recipientInstitutionId?: string;
  amount?: number;
  startDate?: string;
  endDate?: string;
  status?: 'Active' | 'Awarded' | 'Completed' | 'Pending';
  abstract?: string;
}

export interface ResearchNode extends BaseNode {
  type: 'research';
  researchType?: 'Publication' | 'Model / Algorithm' | 'Dataset' | 'White Paper' | 'Curriculum';
  year?: number;
  doiUrl?: string;
  venue?: string;
  abstract?: string;
}

export interface MeetingNode extends BaseNode {
  type: 'meeting';
  meetingType?: 'Symposium' | 'Working Group' | 'Field Review' | 'Workshop' | 'Steering Committee';
  date?: string;
  location?: string;
  virtual?: boolean;
  organizerId?: string;
  summary?: string;
  outcomes?: string[];
}

export interface TopicNode extends BaseNode {
  type: 'topic';
  domain?: string;
  modalities?: string[];
  scope?: string;
}

export type GraphNode =
  | PersonNode
  | InstitutionNode
  | ProgramNode
  | CollaborativeNode
  | ProductNode
  | GrantNode
  | ResearchNode
  | MeetingNode
  | TopicNode;

export interface GraphEdge {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  type: RelationType;
  label?: string;
  weight?: number;
  description?: string;
  how?: string;
  modality?: string;
  properties?: Record<string, any>;
  startDate?: string;
  endDate?: string;
}

export interface NetworkDataset {
  metadata: {
    title: string;
    version: string;
    description: string;
    lastUpdated: string;
  };
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface FilterState {
  searchQuery: string;
  activeTypes: Set<NodeType>;
  selectedTags: Set<string>;
  minFundingAmount: number;
  yearRange: [number, number];
  onlyConnectedToSelected: boolean;
}

export interface NodeMetrics {
  degree: number;
  inDegree: number;
  outDegree: number;
  betweenness?: number;
}
