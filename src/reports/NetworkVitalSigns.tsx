import React, { useMemo } from 'react';
import { type ReportModel, fmt } from './reportData';
import { DATA_BASIS, conveningPersistence, project, share, vitals } from './network';
import { Bar, Basis, Exhibit, Finding, Kpis, ReportHeader, Section, type ReportNav } from './ReportKit';
import { ConvenorInputs, NetworkReadingGuide, TwinTable } from './NetworkKit';

/** N-01: a one-page health check of the partner network, with and without convenings. */
export const NetworkVitalSigns: React.FC<{ m: ReportModel; nav: ReportNav }> = ({ m, nav }) => {
  const r = useMemo(() => {
    const all = project(m, 'all');
    const del = project(m, 'delivery');
    const va = vitals(m, all);
    const vd = vitals(m, del);
    const strength = (p: typeof all) => {
      const counts = [0, 0, 0, 0];
      for (const acts of p.shared.values()) counts[Math.min(acts.length, 4) - 1]++;
      return counts;
    };
    return { all, del, va, vd, persist: conveningPersistence(m), sa: strength(all), sd: strength(del) };
  }, [m]);
  const { va, vd } = r;
  const lost = 1 - vd.largestShare;

  return (
    <>
      <ReportHeader
        code="N-01 · Network vital signs"
        title="Network vital signs"
        audience="CWI leadership, funders, network members"
        mandate="Build lasting connections across science, technology, policy and practice"
        purpose="How connected CWI's partners are to each other, with and without CWI's convenings. The unit of analysis is the network, not CWI."
        sources={['CWI Projects and Collaborators sheet']}
      />

      <NetworkReadingGuide />

      <Kpis
        items={[
          { value: share(vd.largestShare), label: 'Partners in one linked group without convenings', exhibit: 'A', hint: `With convenings it is ${share(va.largestShare)}` },
          { value: fmt(vd.ties), label: 'Co-delivered ties', exhibit: 'A', hint: `Out of ${fmt(va.ties)} ties on all activities` },
          { value: vd.isolates, label: 'Partners with no delivery tie', exhibit: 'A', hint: 'Linked to others only through convenings' },
          { value: share(va.multiTies / va.ties), label: 'Ties on 2+ activities', exhibit: 'C', hint: 'Pairs listed together more than once' },
          { value: share(r.persist.rate), label: 'Convening ties that recur', exhibit: 'A', hint: 'Pairs who met again at a later convening' },
        ]}
      />

      <Section title="Key findings">
        <Finding n={1} title="Convenings are what hold the network together" evidence={['A']}>
          With every activity counted, {share(va.largestShare)} of the {va.partners} partners sit in one linked group. Take the convenings away and only{' '}
          {share(vd.largestShare)} ({vd.largest.length}) do; the rest split into {vd.groups - 1} smaller group{vd.groups - 1 === 1 ? '' : 's'} and {vd.isolates} partners with
          no delivery tie at all. {share(lost)} of the network's reach depends on CWI's events.
        </Finding>
        <Finding n={2} title="Most ties are one-off" evidence={['C']}>
          Only {fmt(va.multiTies)} of {fmt(va.ties)} pairs ({share(va.multiTies / va.ties)}) are listed together on more than one activity, and {vd.multiTies} pairs have
          delivered together more than once. Repeated ties are the closest these records come to a working relationship.
        </Finding>
        <Finding n={3} title="Few convening ties carry forward" evidence={['A']}>
          Of {fmt(r.persist.eligible)} pairs who first met at a dated convening, {fmt(r.persist.kept)} ({share(r.persist.rate)}) were at a later convening together. The rest
          have not been in the same room again on record.
        </Finding>
        <Finding n={4} title="Ties cross sectors" evidence={['A']}>
          {share(va.crossTies / va.ties)} of all ties and {share(vd.crossTies / vd.ties)} of delivery ties join organisations from different sectors. The network mixes sectors
          well; the weakness is how few ties there are outside convenings, not who they connect.
        </Finding>
      </Section>

      <Section title="Exhibits">
        <Exhibit
          id="A"
          title="Vital signs, with and without convenings"
          source={DATA_BASIS}
          ids={vd.largest}
          nav={nav}
          guide={{
            what: 'Each structural measure taken twice: once on all activities (co-attended and co-delivered ties), once on programs and products only (co-delivered ties).',
            read: 'Read across a row. A large gap between the columns means that measure depends on CWI convenings. Highlighted rows have the biggest gaps. Show in network highlights the largest delivery group.',
            why: 'A network that only holds together at CWI events would come apart if CWI stopped convening. The delivery column is what partners have built with each other.',
          }}
        >
          <TwinTable
            rows={[
              { label: 'Partners', all: va.partners, delivery: vd.partners, means: 'Organisations and people on the sheet, excluding CWI' },
              { label: 'Ties', all: fmt(va.ties), delivery: fmt(vd.ties), means: 'Pairs listed on the same activity', flag: true },
              { label: 'Density', all: share(va.density), delivery: share(vd.density), means: 'Share of all possible pairs that are tied' },
              { label: 'Average ties per partner', all: va.avgLinks.toFixed(1), delivery: vd.avgLinks.toFixed(1), means: 'How many others a typical partner is listed with' },
              { label: 'Largest linked group', all: share(va.largestShare), delivery: share(vd.largestShare), means: 'Share of partners who can all reach each other', flag: true },
              { label: 'Separate groups (2+ partners)', all: va.groups, delivery: vd.groups, means: 'Pieces the network splits into, apart from isolates' },
              { label: 'Isolates', all: va.isolates, delivery: vd.isolates, means: 'Partners with no tie on this layer', flag: true },
              { label: 'Ties on 2+ activities', all: share(va.multiTies / (va.ties || 1)), delivery: share(vd.multiTies / (vd.ties || 1)), means: 'Pairs listed together more than once' },
              { label: 'Cross-sector ties', all: share(va.crossTies / (va.ties || 1)), delivery: share(vd.crossTies / (vd.ties || 1)), means: 'Ties joining different kinds of organisation' },
              { label: 'Convening ties that recur', all: share(r.persist.rate), delivery: '–', means: 'Pairs at a dated convening who met again at a later one' },
            ]}
          />
          <p className="rp-note">Change since the last refresh will appear here once a second dated snapshot of the network is stored. This is the first.</p>
        </Exhibit>

        <Exhibit
          id="B"
          title="Convenor inputs"
          source="CWI Projects and Collaborators sheet; these are CWI's activities, not network measures"
          nav={nav}
          guide={{
            what: "CWI's own effort in running the network: what it ran and how many partners it reached.",
            read: 'These are inputs, like costs in a set of accounts. They are kept out of the measures above on purpose.',
            why: 'CWI is part of everything it runs, so counting its own links would make the network look stronger than it is.',
          }}
        >
          <ConvenorInputs m={m} />
        </Exhibit>

        <Exhibit
          id="C"
          title="How strong the ties are"
          source={`${DATA_BASIS} Strength is the number of activities a pair shares.`}
          nav={nav}
          guide={{
            what: 'Every tied pair, grouped by how many activities they share.',
            read: "A healthy working network has a visible tail of pairs on 2, 3 or more activities. Bars in each column are scaled to that column's largest row.",
            why: 'One shared listing could be a single meeting. Repeated co-listing is better evidence of a working relationship.',
          }}
        >
          <table className="rp-table">
            <thead>
              <tr>
                <th>Shared activities</th>
                <th className="num">All activities</th>
                <th />
                <th className="num">Delivery only</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {['1', '2', '3', '4 or more'].map((label, i) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td className="num">{fmt(r.sa[i])}</td>
                  <td>
                    <Bar value={r.sa[i]} max={r.sa[0]} />
                  </td>
                  <td className="num">{fmt(r.sd[i])}</td>
                  <td>
                    <Bar value={r.sd[i]} max={r.sd[0]} tone="ember" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Exhibit>
      </Section>

      <Basis>
        <p>
          A tie is two partners listed on the same activity in the CWI Projects and Collaborators sheet. CWI itself is left out, since it is part of every activity. Delivery
          means the {m.workProjects.length} programs and products; convenings are the {m.convenings.length} events. Ties are unweighted, so a large convening creates many ties
          at once; that is one reason the delivery column is the better guide to strength.
        </p>
        <p>
          These records show who was listed together, not who collaborates, how often, or how much they trust each other. A short partner survey would add those. Sectors are
          inferred from organisation names.
        </p>
      </Basis>
    </>
  );
};
