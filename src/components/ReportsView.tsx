import React, { useMemo, useState } from 'react';
import { FileText, Printer } from 'lucide-react';
import type { GraphNode, GraphEdge } from '../types/graph';
import { buildModel, reportKind } from '../reports/reportData';
import type { ReportNav } from '../reports/ReportKit';
import { ExplainContext } from '../reports/explain';
import { ImpactBrief } from '../reports/ImpactBrief';
import { CoordinationReport } from '../reports/CoordinationReport';
import { NodeReport } from '../reports/NodeReport';
import '../reports/reports.css';

type ReportId = 'impact' | 'coordination' | 'node';

/** A request to open the node report, from "Run report" elsewhere in the app; `n` changes on every request. */
export interface ReportTarget {
  id: string;
  n: number;
}

const REPORTS: { id: ReportId; code: string; title: string; audience: string }[] = [
  { id: 'impact', code: 'R-01', title: 'State impact brief', audience: 'Legislature, CNRA, Board' },
  { id: 'coordination', code: 'R-02', title: 'Coordination and gap report', audience: 'Research partners, Board' },
  { id: 'node', code: 'R-03', title: 'Report on one node', audience: 'A partner, project or organisation' },
];

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
  const [report, setReport] = useState<ReportId>(target ? 'node' : 'impact');
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
        <span className="eyebrow" style={{ padding: '0 10px' }}>
          Stakeholder reports
        </span>
        {REPORTS.map((r) => (
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
        <label className="reports-toggle">
          <input type="checkbox" checked={explain} onChange={(e) => toggleExplain(e.target.checked)} />
          Show explanations
        </label>
        <p className="reports-help">
          Reports follow a forensic reporting style: numbered findings cite exhibits, figures trace to spreadsheet rows, the sheet is reconciled to the graph, and data problems
          are listed in an exceptions register. To report on one node, select it anywhere in GraphEmber and choose Run report.
        </p>
        <button className="btn reports-print" onClick={() => window.print()} title="Print, or choose Save as PDF">
          <Printer size={14} />
          Print or save PDF
        </button>
      </aside>
      <div className="reports-scroll">
        <ExplainContext.Provider value={explain}>
          <article className="rp-paper" aria-label={footerTitle}>
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
