import React, { useMemo } from 'react';
import { type ReportModel, kindOf } from './reportData';
import { DATA_BASIS, programProfiles, share, type ProgramProfile } from './network';
import { Basis, EntityLink, Exhibit, Finding, Kpis, ReportHeader, Section, type ReportNav } from './ReportKit';
import { DotPlot, NetworkReadingGuide } from './NetworkKit';

const ProfileTable: React.FC<{ rows: ProgramProfile[]; nav: ReportNav; outsideLabel: string; deliveryCol: boolean }> = ({ rows, nav, outsideLabel, deliveryCol }) => (
  <div className="rp-scroll">
    <table className="rp-table rp-profiles">
      <thead>
        <tr>
          <th>Activity</th>
          <th className="num">Partners</th>
          <th className="num">Sectors</th>
          <th className="num">Sector mix</th>
          <th className="num">{outsideLabel}</th>
          {deliveryCol && <th className="num">Other delivery</th>}
          <th className="num">Only here</th>
          <th className="num">New pairs</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((p) => (
          <tr key={p.program.id}>
            <td>
              <EntityLink node={p.program} nav={nav} />
              <div className="rp-muted">{kindOf(p.program)}</div>
            </td>
            <td className="num">{p.partners.length}</td>
            <td className="num">{p.sectors}</td>
            <td className="num">{p.diversity.toFixed(2)}</td>
            <td className="num">{share(p.outside)}</td>
            {deliveryCol && <td className="num">{share(p.outsideDelivery)}</td>}
            <td className="num">{p.unique.length}</td>
            <td className="num">{p.pairs ? share(p.newPairs / p.pairs) : '–'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** N-04: each program's contribution to the network's structure. */
export const ProgramProfiles: React.FC<{ m: ReportModel; nav: ReportNav }> = ({ m, nav }) => {
  const r = useMemo(() => {
    const programs = programProfiles(m);
    const convenings = programProfiles(m, m.convenings);
    const linkers = [...programs].filter((p) => p.partners.length >= 5).sort((a, b) => b.outsideDelivery - a.outsideDelivery);
    const closed = [...programs].filter((p) => p.partners.length >= 5).sort((a, b) => b.unique.length / b.partners.length - a.unique.length / a.partners.length);
    const pairs = programs.reduce((a, p) => a + p.pairs, 0);
    const newPairs = programs.reduce((a, p) => a + p.newPairs, 0);
    return { programs, convenings, linkers, closed, pairs, newPairs };
  }, [m]);
  const best = r.linkers[0];
  const most = r.closed[0];
  const biggest = r.programs[0];
  const empty = m.workProjects.length - r.programs.length;
  const nav2 = (id: string) => {
    const n = m.byId.get(id);
    if (n) nav.onSelectNode(n);
  };

  return (
    <>
      <ReportHeader
        code="N-04 · Program collaboration profiles"
        title="Program collaboration profiles"
        audience="Program leads, CWI leadership"
        mandate="Coordinate and align research; speed research to solutions"
        purpose="How much each program links partners who would otherwise be apart, and how much it stands alone."
        sources={['CWI Projects and Collaborators sheet', 'Sectors inferred from organisation names']}
      />

      <NetworkReadingGuide />

      <Kpis
        items={[
          {
            value: r.programs.length,
            label: 'Programs and products with partners',
            exhibit: 'B',
            hint: empty ? `${empty} more have no partners recorded` : 'All have partners recorded',
          },
          {
            value: best ? share(best.outsideDelivery) : '–',
            label: `Best linker: ${best?.program.label ?? '–'}`,
            exhibit: 'A',
            hint: 'Share of its partners also on other delivery work',
          },
          { value: share(r.newPairs / (r.pairs || 1)), label: 'Program pairs found nowhere else', exhibit: 'B', hint: 'Ties each program adds that no other activity provides' },
          { value: r.programs.reduce((a, p) => a + p.unique.length, 0), label: 'Partners on one activity only', exhibit: 'B', hint: 'Listed on a single program and nothing else' },
        ]}
      />

      <Section title="Key findings">
        {best && (
          <Finding n={1} title={`${best.program.label} links the most`} evidence={['A', 'B']}>
            {share(best.outsideDelivery)} of its {best.partners.length} partners also work on other CWI programs or products, so it joins up the delivery network.{' '}
            {r.linkers[1] && (
              <>
                <EntityLink node={r.linkers[1].program} nav={nav} /> comes next ({share(r.linkers[1].outsideDelivery)}).
              </>
            )}
          </Finding>
        )}
        {biggest && (
          <Finding n={2} title={`${biggest.program.label} is the largest and most varied`} evidence={['A', 'B']}>
            It has {biggest.partners.length} partners from {biggest.sectors} sectors (mix {biggest.diversity.toFixed(2)}), but {biggest.unique.length} of them appear on no other
            activity and {share(biggest.newPairs / (biggest.pairs || 1))} of its pairs exist nowhere else. It adds a lot of new ties, most of which depend on this one program.
          </Finding>
        )}
        {most && most !== biggest && (
          <Finding n={3} title={`${most.program.label} stands mostly on its own`} evidence={['B']}>
            {most.unique.length} of its {most.partners.length} partners are on no other CWI activity, and only {share(most.outsideDelivery)} work on other delivery. Bringing its
            partners into another program or a convening would connect it to the network.
          </Finding>
        )}
      </Section>

      <Section title="Exhibits">
        <Exhibit
          id="A"
          title="Programs by sector mix and outside connections"
          source={`${DATA_BASIS} Sectors inferred from names.`}
          ids={r.programs.map((p) => p.program.id)}
          nav={nav}
          guide={{
            what: 'Each program or product placed by how varied its partners are and how many of them also work on other delivery.',
            read: 'Right means a wider mix of sectors (0 is one sector; values near 1 are very mixed). Higher means more partners connected to other programs. Bigger dots have more partners. Click a dot to open it.',
            why: 'Programs in the top right both mix sectors and join the network up. Programs low down are islands, even when they are large.',
          }}
        >
          <DotPlot
            xLabel="Sector mix (chance two partners are from different sectors)"
            yLabel="Partners on other delivery work"
            dots={r.programs.map((p) => ({ id: p.program.id, label: p.program.label, x: p.diversity, y: p.outsideDelivery, size: p.partners.length }))}
            onPick={nav2}
          />
        </Exhibit>

        <Exhibit
          id="B"
          title="Program and product profiles"
          source={`${DATA_BASIS} Sectors inferred from names.`}
          ids={r.programs.flatMap((p) => [p.program.id, ...p.partners.map((x) => x.id)])}
          nav={nav}
          guide={{
            what: 'The measures behind the chart, for every program and product with partners recorded.',
            read: 'Sector mix runs from 0 (all one sector) to near 1 (very mixed). Other activities is the share of partners also on any other program, product or convening; other delivery counts programs and products only. Only here is partners on no other activity. New pairs is the share of its partner pairs listed together nowhere else.',
            why: 'A program with many pairs new to the network is creating ties; one whose partners are all elsewhere too is reinforcing existing ties. Both have value, but they are different jobs.',
          }}
        >
          <ProfileTable rows={r.programs} nav={nav} outsideLabel="Other activities" deliveryCol />
        </Exhibit>

        <Exhibit
          id="C"
          title="Convening profiles"
          source={`${DATA_BASIS} Sectors inferred from names.`}
          ids={r.convenings.map((p) => p.program.id)}
          nav={nav}
          guide={{
            what: 'The same measures for each convening.',
            read: 'Other activities is the share of attendees also on a program, product or another convening; other delivery counts programs and products only.',
            why: 'Convenings with few attendees on other activities are reaching new people; those with many are strengthening an existing community. Turning attendees into delivery partners is how co-attended ties become co-delivered ones.',
          }}
        >
          <ProfileTable rows={r.convenings} nav={nav} outsideLabel="Other activities" deliveryCol />
        </Exhibit>
      </Section>

      <Basis>
        <p>
          Sector mix is the Blau index, 1 − Σp², where p is each sector's share of the activity's partners. A partner counts once per activity. Programs and products have no dates
          in the sheet, so this report cannot yet say which ties are new since the last refresh, only which exist nowhere else.
        </p>
      </Basis>
    </>
  );
};
