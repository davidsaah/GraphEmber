import React, { useMemo } from 'react';
import { type ReportModel, CWI_ID, connections, countBy, inCwiNetwork, relationLabel, shortestPath, topicPeers } from './reportData';
import { Basis, EntityLink, Exhibit, Finding, Kpis, ReadingGuide, ReportHeader, Section, type ReportNav } from './ReportKit';

const TYPE_NOUN: Record<string, string> = {
  institution: 'Organisation',
  collaborative: 'Collaborative',
  product: 'Tool or system',
  program: 'Program',
  person: 'Person',
  topic: 'Topic',
  meeting: 'Meeting',
  grant: 'Grant',
  research: 'Research',
};

/** Report on any other node: its links, how it reaches CWI, and comparable organisations. */
export const EntityReport: React.FC<{ m: ReportModel; nav: ReportNav; id: string }> = ({ m, nav, id }) => {
  const n = m.byId.get(id);
  const r = useMemo(() => {
    if (!n) return null;
    const links = connections(m, n.id).sort((a, b) => a.edge.type.localeCompare(b.edge.type) || a.other.label.localeCompare(b.other.label));
    const byRelation = [...countBy(links, (l) => relationLabel(l.edge.type))].sort((a, b) => b[1].length - a[1].length);
    const path = n.id === CWI_ID ? [] : shortestPath(m, n.id, CWI_ID);
    const peers = n.type === 'topic' ? [] : topicPeers(m, n.id);
    const linkedCwi = links.filter((l) => inCwiNetwork(l.other)).length;
    const checks = [
      { field: 'Description', ok: !!n.description },
      { field: 'Location', ok: !!n.location },
      { field: 'Mapped coordinates', ok: !!n.coordinates },
      { field: 'Website', ok: !!n.website },
      { field: 'At least one link', ok: links.length > 0 },
    ];
    return { links, byRelation, path, peers, linkedCwi, checks };
  }, [m, n]);
  if (!n || !r) return null;
  const noun = TYPE_NOUN[n.type] || 'Entity';
  const steps = r.path.length ? r.path.length - 1 : undefined;
  const missing = r.checks.filter((c) => !c.ok);

  return (
    <>
      <ReportHeader
        code={`R-03 · ${noun} report`}
        title={n.label}
        audience="CWI staff and Board"
        mandate="Coordinate and align research; act as a hub for policy and technology transfer"
        purpose={`What ${n.label} is connected to, how close it sits to CWI, and which organisations are comparable.`}
        sources={['AI wildfire landscape sheet', 'CWI Projects and Collaborators sheet', 'GraphEmber curated records']}
      />

      <ReadingGuide />

      <Kpis
        items={[
          { value: r.links.length, label: 'Links in the graph', exhibit: 'A', hint: 'Every recorded relationship to another entity' },
          { value: inCwiNetwork(n) ? 'Yes' : 'No', label: 'In CWI network', exhibit: 'A', hint: 'Whether it is on the CWI Projects and Collaborators sheet' },
          { value: n.id === CWI_ID ? '–' : steps ?? 'None', label: 'Steps to CWI', exhibit: 'B', hint: 'Fewest links between it and CWI; 1 means a direct link' },
          { value: r.peers.length, label: 'Comparable organisations', exhibit: 'C', hint: 'Others working on the same topics' },
        ]}
      />

      <Section title="Key findings">
        <Finding n={1} title={`${r.links.length} recorded relationships`} evidence={['A']}>
          {r.links.length ? (
            <>
              Most are of the kind "{r.byRelation[0][0]}" ({r.byRelation[0][1].length}). {r.linkedCwi} of its links are to entities in CWI's network.
            </>
          ) : (
            <>It has no recorded relationships yet.</>
          )}
        </Finding>
        {n.id !== CWI_ID && (
          <Finding n={2} title={steps === 1 ? 'Directly linked to CWI' : steps ? `${steps} steps from CWI` : 'No route to CWI'} evidence={['B']}>
            {steps === 1 ? (
              <>It has a recorded relationship with CWI itself.</>
            ) : steps ? (
              <>
                The shortest route runs through{' '}
                {r.path.slice(1, -1).map((x, i) => (
                  <React.Fragment key={x.id}>
                    {i > 0 && ', then '}
                    <EntityLink node={x} nav={nav} />
                  </React.Fragment>
                ))}
                . Each step is a relationship CWI could use for an introduction.
              </>
            ) : (
              <>No chain of recorded relationships connects it to CWI.</>
            )}
          </Finding>
        )}
        {r.peers.length > 0 && (
          <Finding n={n.id !== CWI_ID ? 3 : 2} title="Comparable organisations" evidence={['C']}>
            <EntityLink node={r.peers[0].node} nav={nav} /> shares the most topics with it ({r.peers[0].shared}). {r.peers.filter((p) => p.inNetwork).length} of the{' '}
            {r.peers.length} closest peers are already in CWI's network.
          </Finding>
        )}
      </Section>

      <Section title="Exhibits">
        <Exhibit
          id="A"
          title="Relationships"
          source="All recorded links in the graph"
          ids={[n.id, ...r.links.map((l) => l.other.id)]}
          nav={nav}
          guide={{
            what: 'Every relationship recorded for this entity.',
            read: 'Relation is the kind of link, and the arrow shows its direction (→ from this entity, ← to it). How and Modality are the source sheet\'s own description. CWI marks entities in CWI\'s network.',
            why: 'It is the full picture of who this entity works with, as the data records it.',
          }}
        >
          {r.links.length ? (
            <table className="rp-table">
              <thead>
                <tr>
                  <th>Relation</th>
                  <th>With</th>
                  <th>How</th>
                  <th style={{ width: 48 }}>CWI</th>
                </tr>
              </thead>
              <tbody>
                {r.links.map((l) => (
                  <tr key={l.edge.id}>
                    <td>
                      {l.outgoing ? '→ ' : '← '}
                      {relationLabel(l.edge.type)}
                    </td>
                    <td>
                      <EntityLink node={l.other} nav={nav} />
                    </td>
                    <td className="rp-muted rp-clip">{[l.edge.how, l.edge.modality].filter(Boolean).join(' · ') || '–'}</td>
                    <td>{inCwiNetwork(l.other) ? '●' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="rp-note">None recorded.</p>
          )}
        </Exhibit>

        {n.id !== CWI_ID && (
          <Exhibit
            id="B"
            title="Route to CWI"
            source="Shortest chain of recorded links, in either direction"
            ids={r.path.map((x) => x.id)}
            nav={nav}
            guide={{
              what: 'The fewest relationships that connect this entity to the Climate & Wildfire Institute.',
              read: 'Read top to bottom: each row is linked to the one before it. Show in network highlights the chain on the graph.',
              why: 'A short route means a warm introduction is available through someone CWI already knows.',
            }}
          >
            {r.path.length ? (
              <ol className="rp-path">
                {r.path.map((x) => (
                  <li key={x.id}>
                    <EntityLink node={x} nav={nav} /> <span className="rp-muted">{TYPE_NOUN[x.type] || x.type}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="rp-note">No route found.</p>
            )}
          </Exhibit>
        )}

        {n.type !== 'topic' && (
          <Exhibit
            id="C"
            title="Comparable organisations"
            source="Topic links in the AI wildfire landscape sheet"
            ids={r.peers.map((p) => p.node.id)}
            nav={nav}
            guide={{
              what: 'Others that work on the same topics as this entity.',
              read: 'Shared topics counts the topics in common. CWI marks peers already in CWI\'s network.',
              why: 'Comparable organisations are useful for benchmarking and for spotting partners CWI is missing.',
            }}
          >
            {r.peers.length ? (
              <table className="rp-table">
                <thead>
                  <tr>
                    <th>Organisation</th>
                    <th>Location</th>
                    <th className="num">Shared topics</th>
                    <th style={{ width: 48 }}>CWI</th>
                  </tr>
                </thead>
                <tbody>
                  {r.peers.map((p) => (
                    <tr key={p.node.id}>
                      <td>
                        <EntityLink node={p.node} nav={nav} />
                      </td>
                      <td className="rp-muted">{p.node.location || '–'}</td>
                      <td className="num">{p.shared}</td>
                      <td>{p.inNetwork ? '●' : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="rp-note">No topics are recorded for this entity, so no peers can be found.</p>
            )}
          </Exhibit>
        )}

        <Exhibit
          id={n.type !== 'topic' ? 'D' : 'C'}
          title="Record completeness"
          source="Fields on this entity's record"
          nav={nav}
          guide={{ what: 'Which basic fields are filled in for this record.', read: 'Missing fields are marked in red.', why: 'Complete records make reports and the map more reliable.' }}
        >
          <table className="rp-table">
            <tbody>
              {r.checks.map((c) => (
                <tr key={c.field}>
                  <td style={{ width: 220 }}>{c.field}</td>
                  <td>{c.ok ? <span className="rp-ok">Present</span> : <span className="rp-bad">Missing</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {missing.length > 0 && <p className="rp-note">Fix: add {missing.map((c) => c.field.toLowerCase()).join(', ')} in the source sheet.</p>}
        </Exhibit>
      </Section>

      <Basis>
        <p>
          Relationships come from the source sheets as built into GraphEmber. The route to CWI ignores link direction and counts every kind of relationship equally, so it shows
          reachability, not strength of tie.
        </p>
      </Basis>
    </>
  );
};
