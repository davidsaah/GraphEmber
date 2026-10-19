import React, { useMemo } from 'react';
import {
  type ReportModel,
  REGION_ORDER,
  SECTOR_ORDER,
  cohorts,
  countBy,
  exceptions,
  kindOf,
  pct,
  projectCodes,
  regionOf,
  sectorOf,
  sharedPartners,
} from './reportData';
import { Bar, Basis, EntityLink, Exhibit, ExceptionsRegister, Finding, Kpis, ReadingGuide, ReportHeader, Rows, Section, type ReportNav } from './ReportKit';

/** Report on one CWI project or convening: who is involved, from where, and how it connects to the rest of the portfolio. */
export const ProjectReport: React.FC<{ m: ReportModel; nav: ReportNav; id: string }> = ({ m, nav, id }) => {
  const p = m.byId.get(id);
  const r = useMemo(() => {
    if (!p) return null;
    const codes = projectCodes(m);
    const roster = (m.partnersOf.get(p.id) || [])
      .map((x) => ({ x, other: (m.projectsOf.get(x.partner.id) || []).length - 1 }))
      .sort((a, b) => b.other - a.other || a.x.partner.label.localeCompare(b.x.partner.label));
    const partners = roster.map((r) => r.x.partner);
    const sectors = countBy(partners, sectorOf);
    const sectorRows = SECTOR_ORDER.map((s) => ({ s, items: sectors.get(s) || [] })).filter((x) => x.items.length);
    const regions = countBy(partners, (n) => regionOf(n.location));
    const regionRows = REGION_ORDER.map((reg) => ({ reg, items: regions.get(reg) || [] })).filter((x) => x.items.length);
    const overlaps = m.projects
      .filter((q) => q.id !== p.id)
      .map((q) => ({ q, shared: sharedPartners(m, p.id, q.id) }))
      .filter((o) => o.shared.length)
      .sort((a, b) => b.shared.length - a.shared.length);
    const repeat = roster.filter((r) => r.other > 0).length;
    const cohort = p.type === 'meeting' ? cohorts(m).find((c) => c.convening.id === p.id) : undefined;
    const ex = exceptions(m).filter((x) => x.node?.id === p.id || partners.some((n) => n.id === x.node?.id));
    return { codes, roster, partners, sectorRows, regionRows, overlaps, repeat, cohort, ex };
  }, [m, p]);
  if (!p || !r) return null;
  const n = r.partners.length;
  const isEvent = p.type === 'meeting';
  const noun = isEvent ? 'attendees' : 'partners';
  const topSector = [...r.sectorRows].sort((a, b) => b.items.length - a.items.length)[0];

  return (
    <>
      <ReportHeader
        code={`R-03 · ${isEvent ? 'Convening' : 'Project'} report · ${r.codes.get(p.id)}`}
        title={p.label}
        audience="Project lead, CWI Board, funders of this project"
        mandate={isEvent ? 'Convene experts; build capacity across science, technology and policy' : 'Speed research to solutions; coordinate and align research'}
        purpose={`Who is involved in this ${isEvent ? 'convening' : kindOf(p).toLowerCase()}, where they come from, and how it connects to the rest of CWI's portfolio.`}
        sources={['CWI Projects and Collaborators sheet']}
      />

      <ReadingGuide />

      <Kpis
        items={[
          { value: n, label: isEvent ? 'Attendees' : 'Partners', exhibit: 'A', hint: `Organisations listed on the sheet for this ${isEvent ? 'event' : 'project'}` },
          { value: r.sectorRows.length, label: 'Sectors represented', exhibit: 'B', hint: 'Different kinds of organisation involved' },
          { value: pct(r.repeat, n), label: `${isEvent ? 'Attendees' : 'Partners'} also on other CWI work`, exhibit: 'A', hint: 'Share already involved elsewhere in the portfolio' },
          { value: r.overlaps.length, label: 'Linked projects', exhibit: 'D', hint: 'Other projects or convenings sharing at least one partner' },
        ]}
      />

      <Section title="Key findings">
        <Finding n={1} title={`${n} ${noun} from ${r.sectorRows.length} sectors`} evidence={['A', 'B']}>
          {n === 0 ? (
            <>No {noun} are recorded for this {isEvent ? 'convening' : 'project'} yet.</>
          ) : (
            <>
              The largest group is {topSector?.s.toLowerCase()} ({topSector?.items.length}).{' '}
              {r.repeat} of the {n} {noun} ({pct(r.repeat, n)}) also take part in other CWI work, so this {isEvent ? 'event' : 'project'} draws on{' '}
              {r.repeat / (n || 1) >= 0.5 ? 'an established network' : 'many organisations new to CWI'}.
            </>
          )}
        </Finding>
        <Finding n={2} title="Where they come from" evidence={['C']}>
          {r.regionRows.map((x, i) => (
            <React.Fragment key={x.reg}>
              {i > 0 && (i === r.regionRows.length - 1 ? ' and ' : ', ')}
              {x.items.length} from {x.reg === 'Not recorded' ? 'unrecorded locations' : x.reg}
            </React.Fragment>
          ))}
          {p.location ? `. The ${isEvent ? 'event was held in' : 'project is located in'} ${p.location}.` : '.'}
        </Finding>
        <Finding n={3} title={r.overlaps.length ? 'Connected to the wider portfolio' : 'Not yet connected to other CWI work'} evidence={['D']}>
          {r.overlaps.length ? (
            <>
              It shares partners with {r.overlaps.length} other projects and convenings, most with <EntityLink node={r.overlaps[0].q} nav={nav} /> (
              {r.overlaps[0].shared.length} in common).
            </>
          ) : (
            <>None of its {noun} appear elsewhere in CWI's portfolio.</>
          )}
          {r.cohort && r.cohort.attendees > 0 && (
            <>
              {' '}
              {r.cohort.returning} attendees ({pct(r.cohort.returning, r.cohort.attendees)}) had been to an earlier CWI convening.
            </>
          )}
        </Finding>
      </Section>

      <Section title="Exhibits">
        <Exhibit
          id="A"
          title={`${isEvent ? 'Attendee' : 'Partner'} roster`}
          source="CWI Projects and Collaborators sheet"
          ids={[p.id, ...r.partners.map((x) => x.id)]}
          nav={nav}
          guide={{
            what: `Everyone listed on the sheet for this ${isEvent ? 'convening' : 'project'}.`,
            read: 'Other CWI work counts the other projects and convenings each one is part of. Sheet rows point to the spreadsheet so each entry can be checked.',
            why: 'Partners with other CWI work are the links between this project and the rest of the portfolio.',
          }}
        >
          {n ? (
            <table className="rp-table">
              <thead>
                <tr>
                  <th>{isEvent ? 'Attendee' : 'Partner'}</th>
                  <th>Sector</th>
                  <th>Location</th>
                  <th className="num">Other CWI work</th>
                  <th style={{ width: 80 }}>Sheet rows</th>
                </tr>
              </thead>
              <tbody>
                {r.roster.map(({ x, other }) => (
                  <tr key={x.partner.id}>
                    <td>
                      <EntityLink node={x.partner} nav={nav} />
                    </td>
                    <td>{sectorOf(x.partner)}</td>
                    <td className={x.partner.location ? undefined : 'rp-muted'}>{x.partner.location || 'Not recorded'}</td>
                    <td className="num">{other}</td>
                    <td>
                      <Rows rows={x.rows} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="rp-note">None recorded.</p>
          )}
        </Exhibit>

        <Exhibit
          id="B"
          title="Composition by sector"
          source="Inferred from partner names"
          nav={nav}
          guide={{
            what: 'The kinds of organisation involved.',
            read: 'Sectors are worked out from names because the sheet has no sector column, so treat them as an estimate.',
            why: 'A mix of agencies, researchers, industry and communities is what lets research turn into practice.',
          }}
        >
          <table className="rp-table">
            <tbody>
              {r.sectorRows.map(({ s, items }) => (
                <tr key={s}>
                  <td style={{ width: 200 }}>{s}</td>
                  <td className="num" style={{ width: 50 }}>
                    {items.length}
                  </td>
                  <td>
                    <Bar value={items.length} max={n} /> <span className="rp-muted">{pct(items.length, n)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Exhibit>

        <Exhibit
          id="C"
          title="Composition by region"
          source="Partner location column"
          nav={nav}
          guide={{ what: `Where the ${noun} are based.`, read: 'Region comes from the state in each location.', why: 'It shows whether the work is local, statewide or Western in reach.' }}
        >
          <table className="rp-table">
            <tbody>
              {r.regionRows.map(({ reg, items }) => (
                <tr key={reg}>
                  <td style={{ width: 200 }}>{reg}</td>
                  <td className="num" style={{ width: 50 }}>
                    {items.length}
                  </td>
                  <td>
                    <Bar value={items.length} max={n} tone={reg === 'Not recorded' ? 'slate' : 'gold'} /> <span className="rp-muted">{pct(items.length, n)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Exhibit>

        <Exhibit
          id="D"
          title="Links to other CWI projects and convenings"
          source="Partners listed on both projects in the sheet"
          ids={[p.id, ...r.overlaps.map((o) => o.q.id)]}
          nav={nav}
          guide={{
            what: 'Other projects and convenings that share partners with this one.',
            read: 'Shared counts the partners in common; the names show who they are.',
            why: 'These are the natural places to share results and coordinate.',
          }}
        >
          {r.overlaps.length ? (
            <table className="rp-table">
              <thead>
                <tr>
                  <th style={{ width: 52 }}>Ref</th>
                  <th>Project</th>
                  <th>Kind</th>
                  <th className="num">Shared</th>
                  <th>Partners in common</th>
                </tr>
              </thead>
              <tbody>
                {r.overlaps.map((o) => (
                  <tr key={o.q.id}>
                    <td className="rp-mono">{r.codes.get(o.q.id)}</td>
                    <td>
                      <EntityLink node={o.q} nav={nav} />
                    </td>
                    <td>{kindOf(o.q)}</td>
                    <td className="num">{o.shared.length}</td>
                    <td className="rp-clip">
                      {o.shared.slice(0, 4).map((x, i) => (
                        <React.Fragment key={x.id}>
                          {i > 0 && ', '}
                          <EntityLink node={x} nav={nav} />
                        </React.Fragment>
                      ))}
                      {o.shared.length > 4 && <span className="rp-muted"> +{o.shared.length - 4}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="rp-note">None.</p>
          )}
        </Exhibit>

        <Exhibit
          id="E"
          title="Record quality"
          source="Automated checks over the sheet and graph"
          nav={nav}
          guide={{ what: `Problems in the records for this ${isEvent ? 'convening' : 'project'} and its ${noun}.`, read: 'Severity runs from High to Info, each with a suggested fix.', why: 'Fix these before sharing the figures above.' }}
        >
          {r.ex.length ? <ExceptionsRegister items={r.ex} nav={nav} /> : <p className="rp-note">No exceptions.</p>}
        </Exhibit>
      </Section>

      <Basis>
        <p>
          Figures come from the CWI Projects and Collaborators sheet as of the latest data build. A partner counts once per project even if listed twice. Sectors are inferred
          from names and should be confirmed.
        </p>
      </Basis>
    </>
  );
};
