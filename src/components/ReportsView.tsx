import React, { useMemo, useState } from 'react';
import { FileText, Printer } from 'lucide-react';
import type { GraphNode, GraphEdge } from '../types/graph';
import { buildModel, reportKind } from '../reports/reportData';
import type { ReportNav } from '../reports/ReportKit';
import { ExplainContext } from '../reports/explain';
import { ImpactBrief } from '../reports/ImpactBrief';
import { CoordinationReport } from '../reports/CoordinationReport';
import { NodeReport } from '../reports/NodeReport';
import { NetworkVitalSigns } from '../reports/NetworkVitalSigns';
import { NetworkStandsAlone } from '../reports/NetworkStandsAlone';
import { BridgesAndSilos } from '../reports/BridgesAndSilos';
import { ProgramProfiles } from '../reports/ProgramProfiles';
import '../reports/reports.css';

type ReportId = 'vitals' | 'resilience' | 'bridges' | 'programs' | 'impact' | 'coordination' | 'node';

/** A request to open the node report, from "Run report" elsewhere in the app; `n` changes on every request. */
export interface ReportTarget {
  id: string;
  n: number;
}

type ReportGroup = 'network' | 'cwi';

const REPORTS: { id: ReportId; code: string; title: string; audience: string; group: ReportGroup }[] = [
  { id: 'vitals', code: 'N-01', title: 'Network vital signs', audience: 'Leadership, funders, members', group: 'network' },
  { id: 'resilience', code: 'N-02', title: 'Does the network stand on its own?', audience: 'Leadership, funders', group: 'network' },
  { id: 'bridges', code: 'N-03', title: 'Bridges and silos', audience: 'Program staff, members', group: 'network' },
  { id: 'programs', code: 'N-04', title: 'Program collaboration profiles', audience: 'Program leads', group: 'network' },
  { id: 'impact', code: 'R-01', title: 'State impact brief', audience: 'Legislature, CNRA, Board', group: 'cwi' },
  { id: 'coordination', code: 'R-02', title: 'Coordination and gap report', audience: 'Research partners, Board', group: 'cwi' },
  { id: 'node', code: 'R-03', title: 'Report on one node', audience: 'A partner, project or organisation', group: 'cwi' },
];

const GROUP_TITLE: Record<ReportGroup, string> = { network: 'Network strength', cwi: 'CWI activity' };

const KIND_TITLE = { partner: 'Partner report', project: 'Project report', entity: 'Entity report' } as const;

const readExplain = () => {
  try {
    return localStorage.getItem('graphember.reports.explain') !== 'off';
  } catch {
    return true;
  }
};

interface ReportsViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  target: ReportTarget | null;
  onSelectNode: (node: GraphNode) => void;
  onShowInNetwork: (ids: string[]) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ nodes, edges, target, onSelectNode, onShowInNetwork }) => {
  // Reports always cover the whole dataset, whatever the filters show
  const model = useMemo(() => buildModel(nodes, edges), [nodes, edges]);
  const busiestPartner = useMemo(
    () => [...model.projectsOf.entries()].filter(([id]) => id !== 'inst-cwi').sort((a, b) => b[1].length - a[1].length)[0]?.[0],
    [model],
  );
  const [report, setReport] = useState<ReportId>(target ? 'node' : 'vitals');
  const [nodeId, setNodeId] = useState<string>(target?.id || busiestPartner);
  const [explain, setExplain] = useState(readExplain);

  // A new "Run report" request switches to that node's report
  const [seen, setSeen] = useState(target?.n);
  if (target && target.n !== seen) {
    setSeen(target.n);
    setReport('node');
    setNodeId(target.id);
  }

  const toggleExplain = (on: boolean) => {
    setExplain(on);
    try {
      localStorage.setItem('graphember.reports.explain', on ? 'on' : 'off');
    } catch {
      // Storage unavailable: the choice lasts for this visit only
    }
  };

  const nav: ReportNav = { onSelectNode, onShowInNetwork };
  const current = REPORTS.find((r) => r.id === report)!;
  const node = model.byId.get(nodeId);
  const footerTitle = report === 'node' && node ? `${KIND_TITLE[reportKind(model, node)]}: ${node.label}` : current.title;

  return (
    <div className="reports">
      <aside className="reports-rail no-print" aria-label="Reports">
        {(['network', 'cwi'] as const).map((g) => (
          <React.Fragment key={g}>
            <span className="eyebrow reports-group">{GROUP_TITLE[g]}</span>
            {REPORTS.filter((r) => r.group === g).map((r) => (
              <button key={r.id} className="reports-item" aria-current={r.id === report} onClick={() => setReport(r.id)}>
                <FileText size={14} />
                <span>
                  <span className="reports-item-title">{r.title}</span>
                  <span className="reports-item-sub">
                    {r.code} · {r.id === 'node' && node ? node.label : r.audience}
                  </span>
                </span>
              </button>
            ))}
          </React.Fragment>
        ))}
        <label className="reports-toggle">
          <input type="checkbox" checked={explain} onChange={(e) => toggleExplain(e.target.checked)} />
          Show explanations
        </label>
        <p className="reports-help">
          Network strength reports measure how well partners are connected to each other, with and without CWI's convenings. CWI activity reports cover what CWI itself runs.
          Every report uses numbered findings that cite exhibits. To report on one node, select it anywhere in GraphEmber and choose Run report.
        </p>
        <button className="btn reports-print" onClick={() => window.print()} title="Print, or choose Save as PDF">
          <Printer size={14} />
          Print or save PDF
        </button>
      </aside>
      <div className="reports-scroll">
        <ExplainContext.Provider value={explain}>
          <article className="rp-paper" aria-label={footerTitle}>
            {report === 'vitals' && <NetworkVitalSigns m={model} nav={nav} />}
            {report === 'resilience' && <NetworkStandsAlone m={model} nav={nav} />}
            {report === 'bridges' && <BridgesAndSilos m={model} nav={nav} />}
            {report === 'programs' && <ProgramProfiles m={model} nav={nav} />}
            {report === 'impact' && <ImpactBrief m={model} nav={nav} />}
            {report === 'coordination' && <CoordinationReport m={model} nav={nav} />}
            {report === 'node' && <NodeReport m={model} nav={nav} id={nodeId} onPick={setNodeId} />}
            <footer className="rp-footer">
              <span>
                Climate & Wildfire Institute · {current.code} {footerTitle}
              </span>
              <span>Generated by GraphEmber from live data. Figures change when the source sheets change.</span>
            </footer>
          </article>
        </ExplainContext.Provider>
      </div>
    </div>
  );
};

export default ReportsView;
