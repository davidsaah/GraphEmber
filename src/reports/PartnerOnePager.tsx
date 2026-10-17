import React, { useMemo, useState } from 'react';
import { type ReportModel, coPartners, endpointId, exceptions, introductions, kindOf, projectCodes, regionOf, sectorOf, yearOf } from './reportData';
import { Basis, EntityLink, Exhibit, ExceptionsRegister, Finding, Kpis, ReportHeader, Rows, Section, type ReportNav } from './ReportKit';

export const PartnerOnePager: React.FC<{ m: ReportModel; nav: ReportNav; initialId?: string }> = ({ m, nav, initialId }) => {
  const ranked = useMemo(
    () =>
      m.partners
        .filter((p) => p.id !== 'inst-cwi')
        .sort((a, b) => (m.projectsOf.get(b.id) || []).length - (m.projectsOf.get(a.id) || []).length || a.label.localeCompare(b.label)),
    [m],
  );
  const [id, setId] = useState<string>(initialId && m.projectsOf.has(initialId) ? initialId : ranked[0]?.id);
  // Selecting a partner anywhere in the app (including from this page) opens their one-pager
  const [seenInitial, setSeenInitial] = useState(initialId);
  if (initialId !== seenInitial) {
    setSeenInitial(initialId);
    if (initialId && m.projectsOf.has(initialId) && initialId !== 'inst-cwi') setId(initialId);
  }
  const p = m.byId.get(id);

  const r = useMemo(() => {
    if (!p) return null;
    const codes = projectCodes(m);
    const eng = (m.projectsOf.get(p.id) || []).sort((a, b) => (a.project.sheetRow || 0) - (b.project.sheetRow || 0));
    const work = eng.filter((x) => x.project.type !== 'meeting');
    const conv = eng.filter((x) => x.project.type === 'meeting');
    const years = conv.map((x) => yearOf(x.project.label)).filter(Boolean) as number[];
    const co = coPartners(m, p.id);
    const intros = introductions(m, p.id);
    const funding = m.edges
      .filter((e) => e.type === 'FUNDS' && (endpointId(e.source) === p.id || endpointId(e.target) === p.id))
      .map((e) => ({ e, from: m.byId.get(endpointId(e.source))!, to: m.byId.get(endpointId(e.target))! }));
    const topics = m.edges
      .filter((e) => e.type === 'HAS_TOPIC' && endpointId(e.source) === p.id)
      .map((e) => m.byId.get(endpointId(e.target))!)
      .filter(Boolean);
    const ex = exceptions(m).filter((x) => x.node?.id === p.id || x.detail.includes(`"${p.label}"`));
    return { codes, eng, work, conv, years, co, intros, funding, topics, ex };
  }, [m, p]);

  if (!p || !r) return null;
  const since = r.years.length ? Math.min(...r.years) : undefined;

  return (
    <>
      <div className="rp-picker no-print">
        <label htmlFor="rp-partner">Partner</label>
        <select id="rp-partner" value={id} onChange={(e) => setId(e.target.value)}>
          {ranked.map((n) => (
            <option key={n.id} value={n.id}>
              {n.label} ({(m.projectsOf.get(n.id) || []).length})
            </option>
          ))}
        </select>
        <span className="rp-muted">Sorted by number of engagements</span>
      </div>

      <ReportHeader
        code={`R-03 · ${p.label}`}
        title={`Your work with CWI: ${p.label}`}
        audience={p.label}
        mandate="Coordinate and align research; convene experts; build capacity across sectors"
        purpose={`A summary of ${p.label}'s engagement with the Climate & Wildfire Institute, the partners it works alongside, and introductions CWI could make.`}
        sources={['CWI Projects and Collaborators sheet', ...(r.topics.length || r.funding.length ? ['AI wildfire landscape sheet'] : [])]}
      />

      <Kpis
        items={[
          { value: r.work.length, label: 'Programs and products', exhibit: 'A' },
          { value: r.conv.length, label: 'Convenings attended', exhibit: 'A' },
          { value: r.co.length, label: 'Partners worked alongside', exhibit: 'B' },
          { value: r.intros.length, label: 'Suggested introductions', exhibit: 'C' },
        ]}
      />

      <Section title="Profile">
        <dl className="rp-profile">
          <div>
            <dt>Organisation</dt>
            <dd>
              <EntityLink node={p} nav={nav} />
            </dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{p.location || <span className="rp-muted">Not recorded</span>}</dd>
          </div>
          <div>
            <dt>Region</dt>
            <dd>{regionOf(p.location)}</dd>
          </div>
          <div>
            <dt>Sector (inferred)</dt>
            <dd>{sectorOf(p)}</dd>
          </div>
          {r.topics.length > 0 && (
            <div>
              <dt>Landscape topics</dt>
              <dd>{r.topics.map((t) => t.label).join(', ')}</dd>
            </div>
          )}
        </dl>
      </Section>

      <Section title="Key findings">
        <Finding n={1} title="Engagement with CWI" evidence={['A']}>
          {p.label} is a partner on {r.work.length} CWI program{r.work.length === 1 ? '' : 's'} and has attended {r.conv.length} convening{r.conv.length === 1 ? '' : 's'}
          {since ? `, the first in ${since}` : ''}.
        </Finding>
        {r.co[0] && (
          <Finding n={2} title="Closest collaborators" evidence={['B']}>
            It works most often alongside <EntityLink node={r.co[0].partner} nav={nav} /> ({r.co[0].projects.length} shared engagement{r.co[0].projects.length === 1 ? '' : 's'})
            {r.co[1] && (
              <>
                {' '}
                and <EntityLink node={r.co[1].partner} nav={nav} /> ({r.co[1].projects.length})
              </>
            )}
            .
          </Finding>
        )}
        <Finding n={r.co[0] ? 3 : 2} title="Introductions CWI could make" evidence={['C']}>
          {r.intros.length ? (
            <>
              {r.intros.length} active CWI partners within 80 km have never shared a project or convening with {p.label}, led by{' '}
              <EntityLink node={r.intros[0].partner} nav={nav} />.
            </>
          ) : p.coordinates ? (
            <>No unconnected CWI partners are within 80 km.</>
          ) : (
            <>No mapped location is recorded, so nearby partners can't be suggested.</>
          )}
        </Finding>
      </Section>

      <Section title="Exhibits">
        <Exhibit id="A" title="Engagement schedule" source="CWI Projects and Collaborators sheet; rows are where this partner appears" ids={[p.id, ...r.eng.map((x) => x.project.id)]} nav={nav}>
          <table className="rp-table">
            <thead>
              <tr>
                <th style={{ width: 52 }}>Ref</th>
                <th>Project</th>
                <th>Kind</th>
                <th>Location</th>
                <th className="num">Other partners</th>
                <th style={{ width: 80 }}>Sheet rows</th>
              </tr>
            </thead>
            <tbody>
              {r.eng.map((x) => (
                <tr key={x.project.id}>
                  <td className="rp-mono">{r.codes.get(x.project.id)}</td>
                  <td>
                    <EntityLink node={x.project} nav={nav} />
                    {x.sheetName && <span className="rp-muted"> (listed as "{x.sheetName}")</span>}
                  </td>
                  <td>{kindOf(x.project)}</td>
                  <td className={x.project.location ? undefined : 'rp-muted'}>{x.project.location || '–'}</td>
                  <td className="num">{(m.partnersOf.get(x.project.id) || []).length - 1}</td>
                  <td>
                    <Rows rows={x.rows} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Exhibit>

        <Exhibit id="B" title="Partners worked alongside" source="Other partners on the same projects and convenings" ids={r.co.slice(0, 15).map((c) => c.partner.id)} nav={nav}>
          <table className="rp-table">
            <thead>
              <tr>
                <th>Partner</th>
                <th>Sector</th>
                <th className="num">Shared</th>
                <th>Where</th>
              </tr>
            </thead>
            <tbody>
              {r.co.slice(0, 15).map((c) => (
                <tr key={c.partner.id}>
                  <td>
                    <EntityLink node={c.partner} nav={nav} />
                  </td>
                  <td>{sectorOf(c.partner)}</td>
                  <td className="num">{c.projects.length}</td>
                  <td className="rp-mono rp-clip">{c.projects.map((x) => r.codes.get(x.id)).join(' · ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {r.co.length > 15 && <p className="rp-note">And {r.co.length - 15} more.</p>}
        </Exhibit>

        <Exhibit id="C" title="Suggested introductions" source="CWI partners within 80 km with no shared project or convening, ranked by their own engagement" ids={r.intros.map((x) => x.partner.id)} nav={nav}>
          {r.intros.length ? (
            <table className="rp-table">
              <thead>
                <tr>
                  <th>Partner</th>
                  <th>Sector</th>
                  <th>Location</th>
                  <th className="num">Distance</th>
                  <th className="num">CWI engagements</th>
                </tr>
              </thead>
              <tbody>
                {r.intros.map((x) => (
                  <tr key={x.partner.id}>
                    <td>
                      <EntityLink node={x.partner} nav={nav} />
                    </td>
                    <td>{sectorOf(x.partner)}</td>
                    <td>{x.partner.location}</td>
                    <td className="num">{Math.round(x.km)} km</td>
                    <td className="num">{x.projects}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="rp-note">None found.</p>
          )}
        </Exhibit>

        {r.funding.length > 0 && (
          <Exhibit id="D" title="Recorded funding relationships" source="Funding links in the landscape sheet and curated records" nav={nav}>
            <table className="rp-table">
              <thead>
                <tr>
                  <th>Funder</th>
                  <th>Recipient</th>
                  <th>Basis</th>
                  <th className="num">Amount</th>
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
                    <td className="num">{f.e.properties?.amount ?? <span className="rp-bad">Not recorded</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Exhibit>
        )}

        <Exhibit id={r.funding.length ? 'E' : 'D'} title="Record quality for this partner" source="Automated checks over the sheet and graph" nav={nav}>
          {r.ex.length ? <ExceptionsRegister items={r.ex} nav={nav} /> : <p className="rp-note">No exceptions. This partner's records are complete.</p>}
        </Exhibit>
      </Section>

      <Basis>
        <p>
          Engagements come from the CWI Projects and Collaborators sheet. Introductions use straight-line distance between mapped locations, which are city level at best, and
          should be checked by program staff before contact.
        </p>
        <p>This page is meant for the partner. It contains no internal notes beyond the record-quality items listed above, which can be removed before sending.</p>
      </Basis>
    </>
  );
};
