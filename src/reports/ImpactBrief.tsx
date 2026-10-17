import React, { useMemo } from 'react';
import {
  type ReportModel,
  REGION_ORDER,
  SECTOR_ORDER,
  cohorts,
  countBy,
  endpointId,
  exceptions,
  fmt,
  hhi,
  hhiBand,
  kindOf,
  pct,
  projectCodes,
  reconcile,
  regionOf,
  sectorOf,
  stateOf,
} from './reportData';
import { Bar, Basis, EntityLink, Exhibit, ExceptionsRegister, Finding, Kpis, ReconTable, ReportHeader, Section, type ReportNav } from './ReportKit';

export const ImpactBrief: React.FC<{ m: ReportModel; nav: ReportNav }> = ({ m, nav }) => {
  const r = useMemo(() => {
    const codes = projectCodes(m);
    const links = m.engagements.length;
    const schedule = m.projects.map((p) => ({ p, code: codes.get(p.id)!, partners: (m.partnersOf.get(p.id) || []).length }));
    const largest = [...schedule].filter((s) => s.p.type !== 'meeting').sort((a, b) => b.partners - a.partners)[0];

    const regions = countBy(m.partners, (p) => regionOf(p.location));
    const regionRows = REGION_ORDER.map((reg) => ({ reg, items: regions.get(reg) || [] })).filter((x) => x.items.length);
    const states = [...countBy(m.partners.filter((p) => stateOf(p.location)), (p) => stateOf(p.location)!)].sort((a, b) => b[1].length - a[1].length);
    const ca = (regions.get('California') || []).length;
    const west = ca + (regions.get('Nevada') || []).length + (regions.get('Other Western US') || []).length;

    const sectors = countBy(m.partners, sectorOf);
    const sectorRows = SECTOR_ORDER.map((s) => ({ s, items: sectors.get(s) || [] })).filter((x) => x.items.length);
    const sectorHhi = hhi(sectorRows.map((x) => x.items.length));
    const govt = ['Local government', 'Fire service', 'State agency', 'Federal agency', 'Tribal'].reduce((n, s) => n + (sectors.get(s as never) || []).length, 0);

    const perPartner = m.partners
      .filter((p) => p.id !== 'inst-cwi')
      .map((p) => ({ p, n: (m.projectsOf.get(p.id) || []).length, work: (m.projectsOf.get(p.id) || []).filter((x) => x.project.type !== 'meeting').length }))
      .sort((a, b) => b.n - a.n || a.p.label.localeCompare(b.p.label));
    const repeat = perPartner.filter((x) => x.n > 1).length;
    const top10 = perPartner.slice(0, 10);
    const top10Share = top10.reduce((s, x) => s + x.n, 0) / (links || 1);
    const projectHhi = hhi(schedule.map((s) => s.partners));

    const cohort = cohorts(m);
    const latest = [...cohort].reverse().find((c) => c.attendees > 0);

    const funding = m.fundingIn.map((e) => ({
      e,
      from: m.byId.get(endpointId(e.source))!,
      to: m.byId.get(endpointId(e.target))!,
      engagements: (m.projectsOf.get(endpointId(e.target)) || []).length,
    }));
    const funders = countBy(funding, (f) => f.from.label);
    const recon = reconcile(m);
    const reconciled = recon.find((l) => l.kind === 'check')?.value === 0;
    const ex = exceptions(m);
    const material = ex.filter((x) => x.severity === 'High' || x.severity === 'Medium').length;
    return { codes, links, schedule, largest, regionRows, states, ca, west, sectorRows, sectorHhi, govt, perPartner, repeat, top10, top10Share, projectHhi, cohort, latest, funding, funders, recon, reconciled, ex, material };
  }, [m]);

  const P = m.partners.length;
  const maxLinks = Math.max(...r.schedule.map((s) => s.partners), 1);

  return (
    <>
      <ReportHeader
        code="R-01"
        title="State impact brief"
        audience="California Legislature, California Natural Resources Agency, CWI Board"
        mandate="Accountability for state funding; build capacity; speed research to solutions; reach the Western U.S."
        purpose="What CWI's portfolio reaches, who it works with, and how reliable the underlying records are. Every figure traces to a sheet row or a graph record."
        sources={['CWI Projects and Collaborators sheet', 'AI wildfire landscape sheet (funding links)', 'GraphEmber curated records']}
      />

      <Kpis
        items={[
          { value: m.projects.length, label: 'Projects and convenings', exhibit: 'A' },
          { value: fmt(P), label: 'Distinct partners', exhibit: 'C' },
          { value: fmt(r.links), label: 'Partner engagements', exhibit: 'A' },
          { value: pct(r.west, P), label: 'Partners in the West', exhibit: 'B' },
          { value: pct(r.repeat, r.perPartner.length), label: 'Partners engaged more than once', exhibit: 'E' },
          { value: r.material, label: 'Open exceptions (high + medium)', exhibit: 'H' },
        ]}
      />

      <Section title="Key findings">
        <Finding n={1} title="The portfolio is broad and partner-heavy" evidence={['A']}>
          CWI's sheet records {m.workProjects.length} programs and products and {m.convenings.length} convenings, carrying {fmt(r.links)} partner engagements across{' '}
          {fmt(P)} distinct organisations and people.{' '}
          {r.largest && (
            <>
              The largest program by partners is <EntityLink node={r.largest.p} nav={nav} /> ({r.largest.partners} partners, {r.largest.code}).
            </>
          )}
        </Finding>
        <Finding n={2} title="Reach is Californian first, with a Western footprint" evidence={['B']}>
          {pct(r.ca, P)} of partners are based in California and {pct(r.west, P)} in the Western U.S. as a whole, across {r.states.length} states and provinces. This is the
          baseline for the mandate to extend beyond California and Nevada.
        </Finding>
        <Finding n={3} title="Partners come from every part of the system" evidence={['C']}>
          No single sector dominates (sector HHI {fmt(r.sectorHhi)}, {hhiBand(r.sectorHhi).toLowerCase()}). Public bodies, including local, state, federal, fire service and
          tribal, make up {pct(r.govt, P)} of partners, which supports CWI's role as a bridge between research, agencies and communities.
        </Finding>
        <Finding n={4} title="Relationships are durable" evidence={['D', 'E']}>
          {r.repeat} partners ({pct(r.repeat, r.perPartner.length)}) appear on more than one project or convening.
          {r.latest && r.latest.returning > 0 && (
            <>
              {' '}
              At the <EntityLink node={r.latest.convening} nav={nav} />, {pct(r.latest.returning, r.latest.attendees)} of attendees had attended an earlier CWI convening.
            </>
          )}
        </Finding>
        <Finding n={5} title={r.projectHhi < 1500 ? 'Engagement is spread widely, around a committed core' : 'Engagement is concentrated in a few projects'} evidence={['E']}>
          The ten most-engaged partners account for {Math.round(r.top10Share * 100)}% of all engagements. Across projects, partner engagements are{' '}
          {hhiBand(r.projectHhi).toLowerCase()} (HHI {fmt(r.projectHhi)}). {r.projectHhi < 1500 ? 'No single project or partner carries the portfolio, while a core of repeat partners gives continuity.' : 'This is a strength for delivery and a key-partner dependency to manage.'}
        </Finding>
        <Finding n={6} title="The money trail cannot yet be quantified" evidence={['F', 'H']}>
          {r.funding.length} funding relationships touch the CWI network, from {r.funders.size} funders, but none records an amount or period. Leverage on the state's investment
          can't be computed until amounts and source documents are added.
        </Finding>
        <Finding n={7} title={r.reconciled ? 'Records reconcile to the source sheet' : 'Records do not fully reconcile'} evidence={['G', 'H']}>
          Every partner row in the sheet {r.reconciled ? 'traces' : 'does not trace'} to a link in the graph. The exceptions register lists {r.ex.length} items, {r.material} of them
          high or medium severity, to clear before figures are published externally.
        </Finding>
      </Section>

      <Section title="Exhibits">
        <Exhibit id="A" title="Portfolio schedule" source="CWI Projects and Collaborators sheet, project column; row is where each project block starts" ids={m.projects.map((p) => p.id)} nav={nav}>
          <table className="rp-table">
            <thead>
              <tr>
                <th style={{ width: 52 }}>Ref</th>
                <th>Project</th>
                <th style={{ width: 90 }}>Kind</th>
                <th>Location</th>
                <th className="num" style={{ width: 70 }}>Partners</th>
                <th style={{ width: 130 }}>Share of engagements</th>
                <th className="num" style={{ width: 56 }}>Row</th>
              </tr>
            </thead>
            <tbody>
              {r.schedule.map((s) => (
                <tr key={s.p.id}>
                  <td className="rp-mono">{s.code}</td>
                  <td>
                    <EntityLink node={s.p} nav={nav} />
                  </td>
                  <td>{kindOf(s.p)}</td>
                  <td className={s.p.location ? undefined : 'rp-muted'}>{s.p.location || 'Not recorded'}</td>
                  <td className="num">{s.partners}</td>
                  <td>
                    <Bar value={s.partners} max={maxLinks} /> <span className="rp-muted">{pct(s.partners, r.links)}</span>
                  </td>
                  <td className="num rp-mono">{s.p.sheetRow ?? '–'}</td>
                </tr>
              ))}
              <tr className="recon-total">
                <td />
                <td>Total</td>
                <td />
                <td />
                <td className="num">{fmt(r.links)}</td>
                <td>100%</td>
                <td />
              </tr>
            </tbody>
          </table>
        </Exhibit>

        <Exhibit id="B" title="Geographic reach of partners" source="Partner location column; region assigned from the state in each location" ids={m.partners.map((p) => p.id)} nav={nav}>
          <div className="rp-two">
            <table className="rp-table">
              <thead>
                <tr>
                  <th>Region</th>
                  <th className="num">Partners</th>
                  <th style={{ width: '45%' }}>Share</th>
                </tr>
              </thead>
              <tbody>
                {r.regionRows.map(({ reg, items }) => (
                  <tr key={reg}>
                    <td>{reg}</td>
                    <td className="num">{items.length}</td>
                    <td>
                      <Bar value={items.length} max={P} tone={reg === 'Not recorded' ? 'slate' : 'gold'} /> <span className="rp-muted">{pct(items.length, P)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table className="rp-table">
              <thead>
                <tr>
                  <th>State or province</th>
                  <th className="num">Partners</th>
                </tr>
              </thead>
              <tbody>
                {r.states.slice(0, 10).map(([st, items]) => (
                  <tr key={st}>
                    <td>{st}</td>
                    <td className="num">{items.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Exhibit>

        <Exhibit id="C" title="Partner composition by sector" source="Inferred from partner names; the sheet has no sector column (see basis of preparation)" nav={nav}>
          <table className="rp-table">
            <thead>
              <tr>
                <th style={{ width: 170 }}>Sector</th>
                <th className="num" style={{ width: 70 }}>Partners</th>
                <th style={{ width: 150 }}>Share</th>
                <th>Examples</th>
              </tr>
            </thead>
            <tbody>
              {r.sectorRows.map(({ s, items }) => (
                <tr key={s}>
                  <td>{s}</td>
                  <td className="num">{items.length}</td>
                  <td>
                    <Bar value={items.length} max={P} tone={s === 'Unclassified' ? 'slate' : 'gold'} /> <span className="rp-muted">{pct(items.length, P)}</span>
                  </td>
                  <td className="rp-clip">
                    {[...items]
                      .sort((a, b) => (m.projectsOf.get(b.id) || []).length - (m.projectsOf.get(a.id) || []).length)
                      .slice(0, 3)
                      .map((n, i) => (
                        <React.Fragment key={n.id}>
                          {i > 0 && ', '}
                          <EntityLink node={n} nav={nav} />
                        </React.Fragment>
                      ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Exhibit>

        <Exhibit id="D" title="Convening cohort analysis" source="Attendee lists for each convening in the sheet; returning means the attendee appears at an earlier convening" ids={m.convenings.map((c) => c.id)} nav={nav}>
          <table className="rp-table">
            <thead>
              <tr>
                <th>Convening</th>
                <th className="num">Year</th>
                <th className="num">Attendees</th>
                <th className="num">Returning</th>
                <th className="num">First time</th>
                <th style={{ width: 150 }}>Retention</th>
              </tr>
            </thead>
            <tbody>
              {r.cohort.map((c) => (
                <tr key={c.convening.id}>
                  <td>
                    <EntityLink node={c.convening} nav={nav} />
                  </td>
                  <td className="num">{c.year}</td>
                  <td className="num">{c.attendees || <span className="rp-muted">Not yet held</span>}</td>
                  <td className="num">{c.attendees ? c.returning : '–'}</td>
                  <td className="num">{c.attendees ? c.firstTime : '–'}</td>
                  <td>
                    {c.attendees > 0 && (
                      <>
                        <Bar value={c.returning} max={c.attendees} tone="ember" /> <span className="rp-muted">{pct(c.returning, c.attendees)}</span>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Exhibit>

        <Exhibit id="E" title="Concentration: most-engaged partners" source="Partner engagements across all projects and convenings" ids={r.top10.map((x) => x.p.id)} nav={nav}>
          <table className="rp-table">
            <thead>
              <tr>
                <th style={{ width: 36 }}>#</th>
                <th>Partner</th>
                <th>Sector</th>
                <th className="num">Programs</th>
                <th className="num">Convenings</th>
                <th className="num">Total</th>
                <th className="num">Cumulative share</th>
              </tr>
            </thead>
            <tbody>
              {r.top10.map((x, i) => {
                const cum = r.top10.slice(0, i + 1).reduce((s, y) => s + y.n, 0);
                return (
                  <tr key={x.p.id}>
                    <td className="rp-mono">{i + 1}</td>
                    <td>
                      <EntityLink node={x.p} nav={nav} />
                    </td>
                    <td>{sectorOf(x.p)}</td>
                    <td className="num">{x.work}</td>
                    <td className="num">{x.n - x.work}</td>
                    <td className="num">{x.n}</td>
                    <td className="num">{pct(cum, r.links)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="rp-note">
            Herfindahl-Hirschman index of engagements across projects: <strong>{fmt(r.projectHhi)}</strong> ({hhiBand(r.projectHhi)}). Partners engaged once: {r.perPartner.length - r.repeat}; more than once: {r.repeat}.
          </p>
        </Exhibit>

        <Exhibit id="F" title="Follow the money: recorded funding into the network" source="Funding links in the AI wildfire landscape sheet and curated records" ids={r.funding.flatMap((f) => [f.from.id, f.to.id])} nav={nav}>
          <table className="rp-table">
            <thead>
              <tr>
                <th>Funder</th>
                <th>Recipient</th>
                <th>Basis</th>
                <th className="num">Amount</th>
                <th className="num">Recipient's CWI engagements</th>
              </tr>
            </thead>
            <tbody>
              {r.funding.map((f) => (
                <tr key={f.e.id}>
                  <td>
                    <EntityLink node={f.from} nav={nav} />
                  </td>
                  <td>
                    <EntityLink node={f.to} nav={nav} />
                  </td>
                  <td className="rp-muted">{f.e.how || f.e.label}</td>
                  <td className="num">
                    <span className="rp-bad">Not recorded</span>
                  </td>
                  <td className="num">{f.engagements}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="rp-note">
            Funder concentration: {[...r.funders].map(([name, items]) => `${name} ${items.length}`).join(', ')}. CWI's own funding (for example, the State of California
            appropriation) is not in the dataset yet.
          </p>
        </Exhibit>

        <Exhibit id="G" title="Reconciliation: source sheet to graph" source="Raw CWI Projects and Collaborators sheet compared with graph links" nav={nav}>
          <ReconTable lines={r.recon} />
        </Exhibit>

        <Exhibit id="H" title="Exceptions register" source="Automated checks over the sheet and graph" nav={nav}>
          <ExceptionsRegister items={r.ex} nav={nav} />
        </Exhibit>
      </Section>

      <Basis>
        <p>
          Figures are computed live from the GraphEmber dataset. Partner counts are distinct organisations after matching spelling variants (listed as information items in
          Exhibit H). Each engagement is one partner on one project or convening; a partner listed twice on the same project counts once.
        </p>
        <p>
          Sectors are inferred from organisation names by rule and should be confirmed; adding a sector column to the sheet would remove this estimate. Regions come from the
          state in each partner's location; {r.regionRows.find((x) => x.reg === 'Not recorded')?.items.length ?? 0} partners have no location.
        </p>
        <p>
          HHI is the sum of squared percentage shares (0 to 10,000). Under 1,500 is unconcentrated, 1,500 to 2,500 moderately concentrated, and above 2,500 highly
          concentrated. No funding amounts are recorded, so no financial totals are stated.
        </p>
      </Basis>
    </>
  );
};
