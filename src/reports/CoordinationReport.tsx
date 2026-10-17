import React, { useMemo } from 'react';
import { type ReportModel, exceptions, kindOf, pct, projectCodes, prospects, sectorOf, sharedPartners, topicCoverage } from './reportData';
import { Bar, Basis, EntityLink, Exhibit, ExceptionsRegister, Finding, Kpis, ReportHeader, Section, type ReportNav } from './ReportKit';

const GAP_THRESHOLD = 0.2;

export const CoordinationReport: React.FC<{ m: ReportModel; nav: ReportNav }> = ({ m, nav }) => {
  const r = useMemo(() => {
    const codes = projectCodes(m);
    const projects = m.projects.filter((p) => (m.partnersOf.get(p.id) || []).length > 0);
    const matrix = projects.map((a) => projects.map((b) => (a.id === b.id ? -1 : sharedPartners(m, a.id, b.id).length)));
    const pairs = projects
      .flatMap((a, i) => projects.slice(i + 1).map((b) => ({ a, b, shared: sharedPartners(m, a.id, b.id) })))
      .filter((x) => x.shared.length > 0)
      .sort((x, y) => y.shared.length - x.shared.length);
    const workPairs = pairs.filter((x) => x.a.type !== 'meeting' && x.b.type !== 'meeting');
    const maxShared = Math.max(...matrix.flat(), 1);

    // Brokers: partners who connect several programs (not only convenings)
    const brokers = m.partners
      .filter((p) => p.id !== 'inst-cwi')
      .map((p) => {
        const eng = m.projectsOf.get(p.id) || [];
        return { p, work: eng.filter((x) => x.project.type !== 'meeting').map((x) => x.project), conv: eng.filter((x) => x.project.type === 'meeting').length };
      })
      .filter((x) => x.work.length >= 2)
      .sort((a, b) => b.work.length - a.work.length || b.conv - a.conv);

    // Programs that share no partner with any other program are coordination islands
    const islands = m.workProjects.filter((p) => !workPairs.some((x) => x.a.id === p.id || x.b.id === p.id));
    const thin = m.workProjects.filter((p) => (m.partnersOf.get(p.id) || []).length <= 3);

    const coverage = topicCoverage(m);
    const gaps = coverage.filter((t) => t.actors.length >= 5 && t.coverage < GAP_THRESHOLD);
    const leads = prospects(m);
    const ex = exceptions(m).filter((x) => x.severity === 'High' || x.severity === 'Medium');
    return { codes, projects, matrix, pairs, workPairs, maxShared, brokers, islands, thin, coverage, gaps, leads, ex };
  }, [m]);

  const top = r.workPairs[0];
  return (
    <>
      <ReportHeader
        code="R-02"
        title="Coordination and gap report"
        audience="Research partners, CWI Board, program leads"
        mandate="Coordinate and align research; identify and prioritise knowledge gaps; act as a hub for technology transfer"
        purpose="Where CWI's projects already share partners, who connects them, which parts of the AI wildfire landscape CWI does not yet reach, and who to approach next."
        sources={['CWI Projects and Collaborators sheet', 'AI wildfire landscape sheet (topics, organisations)', 'GraphEmber curated records']}
      />

      <Kpis
        items={[
          { value: r.workPairs.length, label: 'Program pairs sharing partners', exhibit: 'A' },
          { value: r.brokers.length, label: 'Bridging partners', exhibit: 'B' },
          { value: r.islands.length, label: 'Programs with no shared partner', exhibit: 'C' },
          { value: r.gaps.length, label: `Topics under ${GAP_THRESHOLD * 100}% coverage`, exhibit: 'D' },
        ]}
      />

      <Section title="Key findings">
        <Finding n={1} title="Programs overlap through shared partners" evidence={['A']}>
          {r.workPairs.length} pairs of programs share at least one partner.
          {top && (
            <>
              {' '}
              The strongest overlap is between <EntityLink node={top.a} nav={nav} /> and <EntityLink node={top.b} nav={nav} />, with {top.shared.length} partners in
              common.
            </>
          )}{' '}
          Convenings add a further {r.pairs.length - r.workPairs.length} links between events and programs.
        </Finding>
        <Finding n={2} title="A small set of partners holds the network together" evidence={['B']}>
          {r.brokers.length} partners work on two or more programs.{' '}
          {r.brokers[0] && (
            <>
              <EntityLink node={r.brokers[0].p} nav={nav} /> spans {r.brokers[0].work.length} programs and {r.brokers[0].conv} convenings.
            </>
          )}{' '}
          These are the natural channels for aligning methods and sharing data.
        </Finding>
        <Finding n={3} title="Some programs run in isolation" evidence={['C']}>
          {r.islands.length} of {m.workProjects.length} programs share no partner with any other program, and {r.thin.length} have three partners or fewer. These are candidates for
          introductions or for presenting at the next convening.
        </Finding>
        <Finding n={4} title="CWI's network is thin in parts of the AI landscape" evidence={['D']}>
          {r.gaps.length > 0 ? (
            <>
              In {r.gaps.map((g, i) => (
                <React.Fragment key={g.topic.id}>
                  {i > 0 && (i === r.gaps.length - 1 ? ' and ' : ', ')}
                  <EntityLink node={g.topic} nav={nav} />
                </React.Fragment>
              ))}
              , fewer than {GAP_THRESHOLD * 100}% of active organisations are in CWI's network.
            </>
          ) : (
            <>Every landscape topic with five or more organisations has at least {GAP_THRESHOLD * 100}% of them in CWI's network.</>
          )}
        </Finding>
        <Finding n={5} title="There are well-connected organisations CWI does not yet work with" evidence={['E']}>
          The {r.leads.length} most-connected organisations in the landscape that are not CWI partners include{' '}
          {r.leads.slice(0, 3).map((l, i) => (
            <React.Fragment key={l.node.id}>
              {i > 0 && ', '}
              <EntityLink node={l.node} nav={nav} />
            </React.Fragment>
          ))}
          .
        </Finding>
      </Section>

      <Section title="Exhibits">
        <Exhibit id="A" title="Shared-partner matrix" source="Partners listed on each pair of projects in the sheet; cells show partners in common" ids={r.projects.map((p) => p.id)} nav={nav}>
          <div className="rp-scroll">
            <table className="rp-matrix">
              <thead>
                <tr>
                  <th />
                  {r.projects.map((p) => (
                    <th key={p.id} title={p.label} className="rp-mono">
                      {r.codes.get(p.id)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {r.projects.map((a, i) => (
                  <tr key={a.id}>
                    <th className="rp-matrix-row">
                      <span className="rp-mono">{r.codes.get(a.id)}</span> <EntityLink node={a} nav={nav} />
                    </th>
                    {r.matrix[i].map((v, j) => (
                      <td
                        key={j}
                        className={v < 0 ? 'self' : undefined}
                        style={v > 0 ? { background: `rgba(194, 65, 12, ${0.1 + (v / r.maxShared) * 0.65})`, color: v / r.maxShared > 0.5 ? '#fff' : undefined } : undefined}
                        title={v > 0 ? `${a.label} and ${r.projects[j].label}: ${v} shared` : undefined}
                      >
                        {v > 0 ? v : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <table className="rp-table" style={{ marginTop: 14 }}>
            <thead>
              <tr>
                <th>Strongest program pairs</th>
                <th className="num">Shared</th>
                <th>Partners in common</th>
              </tr>
            </thead>
            <tbody>
              {r.workPairs.slice(0, 6).map((x) => (
                <tr key={x.a.id + x.b.id}>
                  <td>
                    <EntityLink node={x.a} nav={nav} /> and <EntityLink node={x.b} nav={nav} />
                  </td>
                  <td className="num">{x.shared.length}</td>
                  <td className="rp-clip">
                    {x.shared.slice(0, 4).map((p, i) => (
                      <React.Fragment key={p.id}>
                        {i > 0 && ', '}
                        <EntityLink node={p} nav={nav} />
                      </React.Fragment>
                    ))}
                    {x.shared.length > 4 && <span className="rp-muted"> +{x.shared.length - 4}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Exhibit>

        <Exhibit id="B" title="Bridging partners" source="Partners on two or more programs or products" ids={r.brokers.map((b) => b.p.id)} nav={nav}>
          <table className="rp-table">
            <thead>
              <tr>
                <th>Partner</th>
                <th>Sector</th>
                <th className="num">Programs</th>
                <th className="num">Convenings</th>
                <th>Programs connected</th>
              </tr>
            </thead>
            <tbody>
              {r.brokers.map((b) => (
                <tr key={b.p.id}>
                  <td>
                    <EntityLink node={b.p} nav={nav} />
                  </td>
                  <td>{sectorOf(b.p)}</td>
                  <td className="num">{b.work.length}</td>
                  <td className="num">{b.conv}</td>
                  <td className="rp-mono rp-clip">{b.work.map((p) => r.codes.get(p.id)).join(' · ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Exhibit>

        <Exhibit id="C" title="Isolated and thinly partnered programs" source="Programs and products in the sheet" ids={[...new Set([...r.islands, ...r.thin].map((p) => p.id))]} nav={nav}>
          <table className="rp-table">
            <thead>
              <tr>
                <th style={{ width: 52 }}>Ref</th>
                <th>Program</th>
                <th>Kind</th>
                <th className="num">Partners</th>
                <th>Shares partners with another program</th>
              </tr>
            </thead>
            <tbody>
              {[...new Set([...r.islands, ...r.thin])].map((p) => (
                <tr key={p.id}>
                  <td className="rp-mono">{r.codes.get(p.id)}</td>
                  <td>
                    <EntityLink node={p} nav={nav} />
                  </td>
                  <td>{kindOf(p)}</td>
                  <td className="num">{(m.partnersOf.get(p.id) || []).length}</td>
                  <td>{r.islands.includes(p) ? <span className="rp-bad">No</span> : 'Yes'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Exhibit>

        <Exhibit id="D" title="Coverage of the AI wildfire landscape by topic" source="Topic links in the AI wildfire landscape sheet; in network means the organisation is also on the CWI sheet" ids={r.gaps.map((g) => g.topic.id)} nav={nav}>
          <table className="rp-table">
            <thead>
              <tr>
                <th>Topic</th>
                <th className="num">Organisations active</th>
                <th className="num">In CWI network</th>
                <th style={{ width: 170 }}>Coverage</th>
                <th>Assessment</th>
              </tr>
            </thead>
            <tbody>
              {r.coverage.map((t) => (
                <tr key={t.topic.id}>
                  <td>
                    <EntityLink node={t.topic} nav={nav} />
                  </td>
                  <td className="num">{t.actors.length}</td>
                  <td className="num">{t.inNetwork.length}</td>
                  <td>
                    <Bar value={t.inNetwork.length} max={t.actors.length} tone={t.coverage < GAP_THRESHOLD ? 'ember' : 'gold'} /> <span className="rp-muted">{pct(t.inNetwork.length, t.actors.length)}</span>
                  </td>
                  <td>{t.actors.length < 5 ? <span className="rp-muted">Too few to assess</span> : t.coverage < GAP_THRESHOLD ? <span className="rp-bad">Gap</span> : 'Covered'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Exhibit>

        <Exhibit id="E" title="Prospective partners" source="Organisations in the AI wildfire landscape sheet that are not on the CWI sheet, ranked by number of links" ids={r.leads.map((l) => l.node.id)} nav={nav}>
          <table className="rp-table">
            <thead>
              <tr>
                <th>Organisation</th>
                <th>Location</th>
                <th className="num">Links</th>
                <th>Topics</th>
              </tr>
            </thead>
            <tbody>
              {r.leads.map((l) => (
                <tr key={l.node.id}>
                  <td>
                    <EntityLink node={l.node} nav={nav} />
                  </td>
                  <td className={l.node.location ? undefined : 'rp-muted'}>{l.node.location || '–'}</td>
                  <td className="num">{l.degree}</td>
                  <td className="rp-clip rp-muted">{l.topics.join(', ') || '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Exhibit>

        <Exhibit id="F" title="Exceptions affecting these figures (high and medium)" source="Automated checks; the full register is in R-01 Exhibit H" nav={nav}>
          <ExceptionsRegister items={r.ex} nav={nav} />
        </Exhibit>
      </Section>

      <Basis>
        <p>
          Two projects share a partner when the same organisation is listed on both in the CWI sheet, after matching spelling variants. Convenings are included in the matrix
          but excluded from program pairs and islands, because attendance is a weaker tie than delivery.
        </p>
        <p>
          Topic coverage uses the landscape sheet's topic links, which describe the wider AI wildfire field rather than CWI's own work. A gap is a topic with five or more active
          organisations and under {GAP_THRESHOLD * 100}% of them in CWI's network. It indicates where to look, not a shortfall in performance.
        </p>
        <p>Prospects are ranked only by how connected they are in the landscape data. Fit and appetite need human judgement before outreach.</p>
      </Basis>
    </>
  );
};
