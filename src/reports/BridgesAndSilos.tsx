import React, { useMemo } from 'react';
import { type ReportModel, type Sector } from './reportData';
import { DATA_BASIS, bridges, project, sectorMix, share, sign, type Projection, type SectorMix } from './network';
import { Bar, Basis, EntityLink, Exhibit, Finding, Kpis, ReportHeader, Section, type ReportNav } from './ReportKit';
import { ChanceBand, NetworkReadingGuide } from './NetworkKit';

// Sectors with only a handful of members are too small to read a pattern from, and a label alone could identify them
const MIN_SECTOR = 3;

const silos = (mix: SectorMix) => {
  const out: [Sector, Sector][] = [];
  mix.sectors.forEach((a, i) =>
    mix.sectors.forEach((b, j) => {
      if (j > i && mix.matrix[i][j] === 0 && (mix.size.get(a) || 0) >= MIN_SECTOR && (mix.size.get(b) || 0) >= MIN_SECTOR) out.push([a, b]);
    }),
  );
  return out;
};

const Heatmap: React.FC<{ mix: SectorMix }> = ({ mix }) => {
  const max = Math.max(1, ...mix.matrix.flat());
  return (
    <div className="rp-scroll">
      <table className="rp-matrix rp-heat">
        <thead>
          <tr>
            <th />
            {mix.sectors.map((s) => (
              <th key={s} title={s}>
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mix.sectors.map((a, i) => (
            <tr key={a}>
              <th className="rp-matrix-row">
                {a} <span className="rp-muted">({mix.size.get(a)})</span>
              </th>
              {mix.matrix[i].map((v, j) => {
                const small = (mix.size.get(a) || 0) < MIN_SECTOR || (mix.size.get(mix.sectors[j]) || 0) < MIN_SECTOR;
                return (
                  <td
                    key={j}
                    className={v === 0 && !small ? 'gap' : undefined}
                    style={v > 0 ? { background: `rgba(194, 65, 12, ${0.08 + (Math.sqrt(v) / Math.sqrt(max)) * 0.72})`, color: v / max > 0.3 ? '#fff' : undefined } : undefined}
                    title={`${a} and ${mix.sectors[j]}: ${v} ties`}
                  >
                    {v || ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const mixingVerdict = (mix: SectorMix) =>
  mix.ei < mix.eiLow ? 'more within-sector than chance' : mix.ei > mix.eiHigh ? 'more cross-sector than chance' : 'about what chance would give';

/** N-03: which sectors are linked, which never meet, and who connects them. */
export const BridgesAndSilos: React.FC<{ m: ReportModel; nav: ReportNav }> = ({ m, nav }) => {
  const r = useMemo(() => {
    const all = project(m, 'all');
    const del = project(m, 'delivery');
    const ma = sectorMix(all, 200);
    const md = sectorMix(del, 200);
    const bd = bridges(m, del);
    const multi = m.partners.filter((p) => new Set((m.projectsOf.get(p.id) || []).filter((x) => x.project.type !== 'meeting').map((x) => x.project.id)).size >= 2);
    return { all, del, ma, md, bd, gapsD: silos(md), gapsA: silos(ma), multi };
  }, [m]);
  const { ma, md, bd } = r;
  const top = bd.list.filter((b) => b.share > 0).slice(0, 12);
  const crossShare = (p: Projection, mix: SectorMix) => (p.shared.size ? (mix.ei + 1) / 2 : 0);

  return (
    <>
      <ReportHeader
        code="N-03 · Bridges and silos"
        title="Bridges and silos"
        audience="CWI program staff, network members"
        mandate="Coordinate across sectors so research turns into practice"
        purpose="Which kinds of organisations work together, which never meet in delivery work, and who connects them."
        sources={['CWI Projects and Collaborators sheet', 'Sectors inferred from organisation names']}
      />

      <NetworkReadingGuide />

      <Kpis
        items={[
          { value: share(crossShare(r.del, md)), label: 'Delivery ties that cross sectors', exhibit: 'A', hint: `${share(crossShare(r.all, ma))} on all activities` },
          { value: sign(md.ei), label: 'Delivery mixing (E-I)', exhibit: 'C', hint: `Random mixing would give ${sign(md.eiChance)}` },
          { value: r.gapsD.length, label: 'Sector pairs that never deliver together', exhibit: 'A', hint: `${r.gapsA.length} never even meet at a convening` },
          { value: share(bd.top3), label: 'Delivery brokerage held by the top 3', exhibit: 'D', hint: 'Share of shortest routes running through them' },
          { value: r.multi.length, label: 'Partners on 2+ programs', exhibit: 'D', hint: 'Carry what they learn from one program to another' },
        ]}
      />

      <Section title="Key findings">
        <Finding n={1} title={`Sectors mix ${mixingVerdict(md)}`} evidence={['A', 'C']}>
          {share(crossShare(r.del, md))} of delivery ties join different sectors (E-I {sign(md.ei)}, against {sign(md.eiChance)} for random mixing).{' '}
          {md.ei < md.eiLow
            ? 'Delivery work groups organisations with their own sector more than chance would, a sign of silos.'
            : md.ei > md.eiHigh
              ? 'Delivery work brings sectors together more than chance would, a sign of deliberate bridging.'
              : 'There is no sign of sector silos, but no sign of deliberate bridging either: programs mix sectors about as much as their rosters would by chance.'}{' '}
          {ma.ei < ma.eiLow && <>Across all activities, mixing is slightly below chance ({sign(ma.ei)} against {sign(ma.eiChance)}), so convenings group like with like a little.</>}
        </Finding>
        <Finding n={2} title={`${r.gapsD.length} pairs of sectors have never delivered together`} evidence={['A', 'B']}>
          {r.gapsD.length ? (
            <>
              They include{' '}
              {r.gapsD.slice(0, 4).map(([a, b], i) => (
                <React.Fragment key={a + b}>
                  {i > 0 && (i === Math.min(4, r.gapsD.length) - 1 ? ' and ' : ', ')}
                  {a.toLowerCase()} with {b.toLowerCase()}
                </React.Fragment>
              ))}
              . {r.gapsA.length ? `${r.gapsA.length} of these ${r.gapsA.length === 1 ? 'pair has' : 'pairs have'} not met at a convening either.` : 'All of them have at least met at a convening, which is a starting point.'}
            </>
          ) : (
            <>Every pair of sectors with three or more members has at least one delivery tie.</>
          )}
        </Finding>
        <Finding n={3} title="A few partners carry most of the bridging" evidence={['D']}>
          <EntityLink node={top[0]?.node} nav={nav} /> alone lies on {share(top[0]?.share || 0)} of the shortest routes between delivery partners, and the top three together
          on {share(bd.top3)}. If they stepped back, many sectors would lose their only delivery link to each other.
        </Finding>
      </Section>

      <Section title="Exhibits">
        <Exhibit
          id="A"
          title="Co-delivered ties between sectors"
          source={`${DATA_BASIS} Delivery ties only; sectors inferred from names.`}
          nav={nav}
          guide={{
            what: 'How many delivery ties join each pair of sectors. The number in brackets is how many partners are in that sector.',
            read: 'Darker cells mean more ties. The diagonal is ties within a sector. Outlined empty cells are sector pairs that have never delivered together; empty cells without an outline involve a sector too small to read.',
            why: 'Empty cells are where CWI could broker an introduction, for example by putting both sectors on the next program.',
          }}
        >
          <Heatmap mix={md} />
        </Exhibit>

        <Exhibit
          id="B"
          title="Co-attended and co-delivered ties between sectors"
          source={`${DATA_BASIS} All activities; sectors inferred from names.`}
          nav={nav}
          guide={{
            what: 'The same grid, counting convenings as well as delivery work.',
            read: 'Compare with Exhibit A. A pair that is filled here but empty in A has met at CWI events but never worked together.',
            why: 'Those pairs are the easiest to move from meeting to working together.',
          }}
        >
          <Heatmap mix={ma} />
        </Exhibit>

        <Exhibit
          id="C"
          title="Sector mixing against chance"
          source={`${DATA_BASIS} The band shows the middle 90% of 200 random reshuffles of sector labels.`}
          nav={nav}
          guide={{
            what: 'Where the network\'s mixing index sits against what random mixing would give.',
            read: 'The red dot is the observed value; the grey band is the range from shuffling sector labels at random, with its average marked. A dot to the left of the band means more within-sector ties than chance; to the right, more cross-sector ties.',
            why: 'With many small sectors almost any network looks cross-sector. Comparing with chance shows whether the mixing is more than an accident of who is on the roster.',
          }}
        >
          <table className="rp-table">
            <tbody>
              {[
                { label: 'Delivery only', mix: md },
                { label: 'All activities', mix: ma },
              ].map(({ label, mix }) => (
                <tr key={label}>
                  <td style={{ width: 130 }}>
                    {label}
                    <div className="rp-muted">
                      {sign(mix.ei)}, chance {sign(mix.eiLow)} to {sign(mix.eiHigh)}
                    </div>
                  </td>
                  <td>
                    <ChanceBand value={mix.ei} low={mix.eiLow} high={mix.eiHigh} mean={mix.eiChance} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Exhibit>

        <Exhibit
          id="D"
          title="Bridging partners (internal use)"
          source={`${DATA_BASIS} Delivery ties only. Brokerage is betweenness: the share of shortest routes between partners that pass through each one.`}
          ids={top.map((b) => b.node.id)}
          nav={nav}
          guide={{
            what: 'The partners that most often connect others in delivery work.',
            read: 'Brokerage is the share of all shortest routes between delivery partners that pass through this one. Sectors reached counts the other sectors among its delivery ties.',
            why: 'Bridging partners are valuable and a single point of failure. This list is for CWI staff, not for publication, because rankings of partners can be misread.',
          }}
        >
          <table className="rp-table">
            <thead>
              <tr>
                <th>Partner</th>
                <th>Sector</th>
                <th className="num">Programs</th>
                <th className="num">Sectors reached</th>
                <th className="num">Brokerage</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {top.map((b) => (
                <tr key={b.node.id}>
                  <td>
                    <EntityLink node={b.node} nav={nav} />
                  </td>
                  <td>{b.sector}</td>
                  <td className="num">{b.activities}</td>
                  <td className="num">{b.sectorsReached}</td>
                  <td className="num">{share(b.share)}</td>
                  <td>
                    <Bar value={b.share} max={top[0].share} tone="ember" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Exhibit>
      </Section>

      <Basis>
        <p>
          Sectors are inferred from organisation names, because the sheet has no sector column; a verified sector for each partner would make this report much more reliable.
          Sectors with fewer than {MIN_SECTOR} partners are shown but not counted as gaps. The mixing index is the Krackhardt E-I index, (cross-sector ties − within-sector ties) ÷
          all ties, tested against 200 random reshuffles of the same sector labels.
        </p>
        <p>Brokerage uses unweighted shortest paths on delivery ties, with CWI left out.</p>
      </Basis>
    </>
  );
};
