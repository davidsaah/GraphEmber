import React, { useMemo } from 'react';
import { type ReportModel, sectorOf } from './reportData';
import { DATA_BASIS, project, robustness, share, vitals } from './network';
import { Basis, EntityLink, Exhibit, Finding, Kpis, ReportHeader, Section, type ReportNav } from './ReportKit';
import { LineChart, NetworkReadingGuide, TwinTable } from './NetworkKit';

const K = 20;

/** N-02: how much of the network stays linked without convenings, or without its best-connected partners. */
export const NetworkStandsAlone: React.FC<{ m: ReportModel; nav: ReportNav }> = ({ m, nav }) => {
  const r = useMemo(() => {
    const all = project(m, 'all');
    const del = project(m, 'delivery');
    return { va: vitals(m, all), vd: vitals(m, del), ra: robustness(all, K), rd: robustness(del, K), del };
  }, [m]);
  const { va, vd, ra, rd } = r;
  const at5 = rd[5];
  const top5 = rd.slice(1, 6).map((s) => s.removed!);

  return (
    <>
      <ReportHeader
        code="N-02 · Resilience test"
        title="Does the network stand on its own?"
        audience="CWI leadership, funders"
        mandate="Build lasting connections across science, technology, policy and practice"
        purpose="If CWI's events stopped, or its five best-connected partners left, how much of the network would still be linked?"
        sources={['CWI Projects and Collaborators sheet']}
      />

      <NetworkReadingGuide />

      <Kpis
        items={[
          { value: share(va.largestShare), label: 'Linked with convenings', exhibit: 'A', hint: 'Share of partners in the largest group' },
          { value: share(vd.largestShare), label: 'Linked without convenings', exhibit: 'A', hint: 'Delivery ties only' },
          { value: share(at5.targeted), label: 'Without convenings or the top 5', exhibit: 'B', hint: 'After also removing the five best-connected delivery partners' },
          { value: share(at5.random), label: 'Removing 5 at random instead', exhibit: 'B', hint: 'Average over many random draws' },
        ]}
      />

      <Section title="Key findings">
        <Finding n={1} title={`Without convenings, ${share(1 - vd.largestShare)} of partners fall away`} evidence={['A']}>
          Convenings link all {va.partners} partners into one group. On delivery ties alone the largest group is {vd.largest.length} partners, and {vd.isolates} have no
          delivery tie. The network today is held together by CWI's events.
        </Finding>
        <Finding n={2} title="The delivery core rests on a few partners" evidence={['B', 'C']}>
          Removing the five best-connected delivery partners (
          {top5.map((n, i) => (
            <React.Fragment key={n.id}>
              {i > 0 && (i === top5.length - 1 ? ' and ' : ', ')}
              <EntityLink node={n} nav={nav} />
            </React.Fragment>
          ))}
          ) shrinks the largest delivery group from {share(rd[0].targeted)} to {share(at5.targeted)} of partners. Removing five at random barely moves it (
          {share(at5.random)}). That gap is the network's dependence on its hubs.
        </Finding>
        <Finding n={3} title="With convenings, no single partner matters much" evidence={['B']}>
          On all activities, removing the top {K} partners still leaves {share(ra[K].targeted)} linked, close to random removal ({share(ra[K].random)}). Convenings spread ties
          widely; delivery work concentrates them.
        </Finding>
      </Section>

      <Section title="Exhibits">
        <Exhibit
          id="A"
          title="The network with and without convenings"
          source={DATA_BASIS}
          ids={vd.largest}
          nav={nav}
          guide={{
            what: 'How the partner network breaks apart when only co-delivered ties are counted.',
            read: 'Compare the two columns. Show in network highlights the partners in the largest delivery group.',
            why: 'Ties formed in shared delivery work are more likely to last without CWI in the room.',
          }}
        >
          <TwinTable
            rows={[
              { label: 'Largest linked group', all: `${va.largest.length} (${share(va.largestShare)})`, delivery: `${vd.largest.length} (${share(vd.largestShare)})`, means: 'Partners who can all reach each other', flag: true },
              { label: 'Separate groups (2+ partners)', all: va.groups, delivery: vd.groups, means: 'Pieces apart from isolates' },
              { label: 'Isolates', all: va.isolates, delivery: vd.isolates, means: 'Partners with no tie on this layer', flag: true },
              { label: 'Ties', all: va.ties.toLocaleString('en-US'), delivery: vd.ties.toLocaleString('en-US'), means: 'Pairs listed together' },
            ]}
          />
        </Exhibit>

        <Exhibit
          id="B"
          title="Largest linked group as partners are removed"
          source={`${DATA_BASIS} Targeted removal takes partners in order of most ties; random removal is averaged over 60 draws.`}
          nav={nav}
          guide={{
            what: 'What share of all partners stays in one linked group as partners are taken out one by one.',
            read: 'Solid lines remove the best-connected partners first; dashed lines remove partners at random. Gold is all activities, red is delivery only. A steep solid line well below its dashed line means a few hubs hold that layer together.',
            why: 'It tests where the network is fragile, so CWI can build backup ties around the hubs before one of them steps away.',
          }}
        >
          <LineChart
            xLabel="Partners removed"
            yLabel="Share in largest group"
            series={[
              { name: 'All, best-connected first', values: ra.map((s) => s.targeted), tone: 'gold' },
              { name: 'All, at random', values: ra.map((s) => s.random), tone: 'gold', dashed: true },
              { name: 'Delivery, at random', values: rd.map((s) => s.random), tone: 'ember', dashed: true },
              { name: 'Delivery, best-connected first', values: rd.map((s) => s.targeted), tone: 'ember' },
            ]}
          />
        </Exhibit>

        <Exhibit
          id="C"
          title="Delivery hubs, in removal order"
          source={`${DATA_BASIS} Delivery ties only.`}
          ids={rd.slice(1, 11).map((s) => s.removed!.id)}
          nav={nav}
          guide={{
            what: 'The ten partners with the most delivery ties, and the largest group left after each is removed in turn.',
            read: 'Each row removes one more partner. A big drop after a row means that partner was a bridge between parts of the delivery network.',
            why: 'These partners are the ones to keep engaged, and the ones to pair with backups.',
          }}
        >
          <table className="rp-table">
            <thead>
              <tr>
                <th className="num" style={{ width: 40 }}>
                  #
                </th>
                <th>Partner removed</th>
                <th>Sector</th>
                <th className="num">Delivery ties</th>
                <th className="num">Largest group after</th>
              </tr>
            </thead>
            <tbody>
              {rd.slice(1, 11).map((s) => (
                <tr key={s.k}>
                  <td className="num">{s.k}</td>
                  <td>
                    <EntityLink node={s.removed} nav={nav} />
                  </td>
                  <td>{sectorOf(s.removed!)}</td>
                  <td className="num">{r.del.adj.get(s.removed!.id)!.size}</td>
                  <td className="num">{share(s.targeted)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Exhibit>
      </Section>

      <Basis>
        <p>
          Ties are partners listed on the same activity, excluding CWI. Shares are of all {va.partners} partners, so isolates count against the largest group. Partners are
          removed in order of their tie count at the start, not recalculated after each removal.
        </p>
        <p>
          No published benchmark exists for how far a healthy wildfire network should fragment when hubs leave, so these figures are for tracking over time and comparing layers,
          not for grading against a target.
        </p>
      </Basis>
    </>
  );
};
