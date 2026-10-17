import React, { useMemo, useState } from 'react';
import { type ReportModel, reportKind } from './reportData';
import type { ReportNav } from './ReportKit';
import { PartnerOnePager } from './PartnerOnePager';
import { ProjectReport } from './ProjectReport';
import { EntityReport } from './EntityReport';

export const NodeReport: React.FC<{ m: ReportModel; nav: ReportNav; id: string; onPick: (id: string) => void }> = ({ m, nav, id, onPick }) => {
  const [query, setQuery] = useState('');
  const options = useMemo(() => [...m.byId.values()].sort((a, b) => a.label.localeCompare(b.label)), [m]);
  const node = m.byId.get(id);

  const pick = (text: string) => {
    setQuery(text);
    const hit = options.find((o) => o.label.toLowerCase() === text.trim().toLowerCase());
    if (hit) {
      onPick(hit.id);
      setQuery('');
    }
  };

  return (
    <>
      <div className="rp-picker no-print">
        <label htmlFor="rp-node">Report on</label>
        <input
          id="rp-node"
          list="rp-node-options"
          placeholder={node ? `${node.label} (type to choose another)` : 'Type a name'}
          value={query}
          onChange={(e) => pick(e.target.value)}
        />
        <datalist id="rp-node-options">
          {options.map((o) => (
            <option key={o.id} value={o.label} />
          ))}
        </datalist>
        <span className="rp-muted">Or select any node in the network and choose Run report.</span>
      </div>
      {node &&
        (() => {
          const kind = reportKind(m, node);
          if (kind === 'partner') return <PartnerOnePager m={m} nav={nav} id={node.id} />;
          if (kind === 'project') return <ProjectReport m={m} nav={nav} id={node.id} />;
          return <EntityReport m={m} nav={nav} id={node.id} />;
        })()}
    </>
  );
};
