"""Build the AIC:W network for GraphEmber (davidsaah/GraphEmber, NetworkDataset format).

Run: python3 build.py [path/to/GraphEmber/src/data/initialData.ts]
Writes, next to this script:
  aicw-network.json            whole network, every node and edge dated
  snapshots/aicw-<period>.json what existed at each rating date, with that date's ratings
  aicw-impact-timeseries.csv   one row per rating (who, indicator, period, level, evidence)
  aicw-nodes.csv / aicw-edges.csv  flat copies for Sheets or Gephi
  merged/initialData.ts        drop-in for GraphEmber: your 183-node landscape plus AIC:W
Sources: AI-Memory/*.md, aicw/impact/*.md, aicw/charter/tier-placement.md (30 Oct 2026).
"""
import csv, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PERIODS = [("2025-03", "Mar 2025 (launch)"), ("2026-05", "May 2026 (Tahoe)"), ("2026-10", "Oct 2026 (now)")]
LEVEL = {"N": "none", "P": "planned", "E": "emerging", "L": "live"}
LEVEL_NUM = {"none": 0, "planned": 1, "emerging": 2, "live": 3}
LAUNCH = "2025-03-24"
NOW = "2026-10-30"

nodes, edges = {}, []


def node(id, type, label, **kw):
    n = {"id": id, "type": type, "label": label}
    n.update({k: v for k, v in kw.items() if v not in (None, [], "")})
    nodes[id] = n
    return id


def edge(s, t, type, label=None, start=None, end=None, how=None, modality=None, weight=None, **props):
    eid = f"aicw-e-{len(edges)+1:03d}"
    e = {"id": eid, "source": s, "target": t, "type": type}
    if label: e["label"] = label
    if how: e["how"] = how
    if modality: e["modality"] = modality
    if weight is not None: e["weight"] = weight
    if start: e["startDate"] = start
    if end: e["endDate"] = end
    if props: e["properties"] = props
    edges.append(e)
    return e


# ---------------------------------------------------------------- core
AICW = node("aicw", "collaborative", "AI Collaborative: Wildfires (AIC:W)", acronym="AIC:W",
            mission="Google.org-catalysed cross-sector collaborative using AI and data to reduce catastrophic wildfire damage and enable more beneficial fire.",
            description="North Star (as adjusted at Tahoe, May 2026): more good fire, less bad fire. Shift acreage to beneficial fire and reduce catastrophic wildfire damage. First call 6 Aug 2024; launch convening 24 Mar 2025. Members: 35 (23 on logo boards + 12 confirmed by David).",
            formationYear=2024, governanceModel="Public-Private Partnership", website="https://aicw.wildfirecommons.org/",
            focusAreas=["Earth observation", "Fuels, weather and fire behaviour", "Decision support", "Ecosystem and financing"],
            startDate="2024-08-06", color="#FF9F40", tags=["AIC:W", "North Star"])

WS_HEX = {"ws1": "#FFE066", "ws2": "#CBE2AF", "ws3": "#F8CBA0", "ws4": "#C3D3DC"}
WS = {
    "ws1": ("WS1 Earth observation", "yellow", "Satellite detection, the virtual constellation, the Wildfire Commons node and data harmonisation."),
    "ws2": ("WS2 Fuels, weather and fire behaviour", "green", "Fuels, fuel moisture, fire behaviour models, emissions and the benchmarking effort."),
    "ws3": ("WS3 Decision support and adoption", "red", "Platforms that put data in front of decision makers: Watch Duty, Planscape, FAO Fire Hub, Fire Tech U."),
    "ws4": ("WS4 Ecosystem and financing", "blue", "Investment case, funders, networks and the Finance & Funding role."),
}
for k, (lbl, colour, desc) in WS.items():
    node(f"aicw-{k}", "program", lbl, color=WS_HEX[k], domain=lbl.split(" ", 1)[1], status="Active", launchYear=2025,
         description=desc + f" Workstream colour: {colour}.", startDate=LAUNCH, tags=["AIC:W", "Workstream", f"WS colour {colour}"])
    edge(AICW, f"aicw-{k}", "HAS_PROJECT", "workstream", start=LAUNCH)

node("aicw-pmo", "program", "AIC:W PMO (SIG / SIG-NAL)", status="Active", launchYear=2024, startDate="2024-11-01",
     description="Programme management office run by SIG and SIG-NAL. SIG-NAL PMO and M&E annex $1.64M Jul 2026 to Dec 2027.", tags=["AIC:W", "Cross-cutting"])
node("aicw-me", "program", "AIC:W Monitoring & Evaluation", status="Active", launchYear=2025, startDate=LAUNCH,
     description="M&E partner IDinsight: midterm report Apr/Jun 2026, end-of-year interviews 2026.", tags=["AIC:W", "Cross-cutting"])
node("aicw-sandbox", "program", "AIC:W Sandbox Fund", status="Active", launchYear=2026, startDate="2026-10-16",
     description="$8M pooled fund ($4M Google.org, $4M anonymous co-funder). Round 1 opened 16 Oct 2026, closes 16 Nov; Investment Committee Dec 2026; awards early 2027. Exploration $100-300K (2+ members); Implementation $300K-1M (1+ member lead).",
     tags=["AIC:W", "Sandbox Fund", "Cross-cutting"])
node("aicw-benchmark", "collaborative", "Wildfire spread model benchmarking initiative", startDate="2026-03-01",
     description="Grew from a 5-org WS2 subgroup (Mar 2026) to nine organisations plus Janice Coen (Oct 2026). NSF proposal due 4 Nov 2026; working session 5 Nov 2026. Coordinated by Ai2.",
     governanceModel="Academic Network", tags=["AIC:W", "WS2", "Benchmarking"])
for k in ("pmo", "me", "sandbox"):
    edge(AICW, f"aicw-{k}", "HAS_PROJECT", k, start=nodes[f"aicw-{k}"]["startDate"])
edge("aicw-ws2", "aicw-benchmark", "HAS_PROJECT", "benchmarking", start="2026-03-01")

# North Star levers
for k, lbl in [("prevention", "Prevention"), ("detection", "Detection"), ("response", "Response"), ("enabler", "Enablers (finance, policy, coordination)"),
               ("damage", "Outcome: less catastrophic damage"), ("goodfire", "Outcome: more beneficial fire")]:
    node(f"aicw-ns-{k}", "topic", f"North Star: {lbl}", domain="AIC:W North Star", tags=["AIC:W", "North Star"])
    edge(AICW, f"aicw-ns-{k}", "HAS_TOPIC", "North Star")

# ---------------------------------------------------------------- organisations
# key, existing GraphEmber id or None, label, institutionType, tier, joined (date, basis), on logo board, website
ORGS = [
    ("google", "inst-google-org", "Google.org & Google Research", "Private Sector", "Executive Team; funder", (LAUNCH, "founder"), True),
    ("sig", "land-19", "Spatial Informatics Group (SIG)", "Private Sector", "Executive Team (PMO); WG Contributor", (LAUNCH, "founder"), True),
    ("signal", None, "SIG-NAL", "NGO", "Executive Team (PMO)", (LAUNCH, "founder"), True),
    ("idinsight", "land-169", "IDinsight", "NGO", "Executive Team (M&E)", (LAUNCH, "launch presenter"), True),
    ("afac", "land-164", "AFAC (Australasian Fire and Emergency Service Authorities Council)", "Consortium", "WG Contributor", (LAUNCH, "launch presenter"), True),
    ("jpl", "land-162", "JPL / Caltech", "Research Institute", "WG Contributor", (LAUNCH, "launch presenter"), True),
    ("csiro", "land-109", "CSIRO", "Federal Agency", "WG Contributor", (LAUNCH, "launch presenter"), True),
    ("efa", "collab-efa", "Earth Fire Alliance (EFA)", "NGO", "WG Contributor", (LAUNCH, "launch presenter"), True),
    ("edf", "land-23", "Environmental Defense Fund (EDF)", "NGO", "WG Contributor", (LAUNCH, "launch presenter"), True),
    ("fao", "land-32", "UN FAO", "Federal Agency", "WG Contributor", (LAUNCH, "launch presenter"), True),
    ("planscape", "land-22", "Planscape", "Consortium", "WG Contributor", (LAUNCH, "launch presenter"), True),
    ("ucsd", "land-12", "UC San Diego / WIFIRE Lab (Wildfire Commons)", "University", "WG Lead (WS1); WG Contributor", (LAUNCH, "launch presenter"), True),
    ("watchduty", "land-163", "Watch Duty", "NGO", "WG Lead (WS3, tentative); WG Contributor", (LAUNCH, "launch presenter"), True),
    ("wfca", "land-130", "Western Fire Chiefs Association (WFCA)", "NGO", "WG Contributor", (LAUNCH, "launch presenter"), True),
    ("woodwell", "land-25", "Woodwell Climate Research Center", "Research Institute", "WG Contributor", (LAUNCH, "launch presenter"), True),
    ("wef", "land-7", "World Economic Forum (WEF)", "NGO", "WG Lead (WS4, tentative); Finance & Funding", (LAUNCH, "launch presenter"), False),
    ("ai2", None, "Ai2 (Allen Institute for AI)", "Research Institute", "WG Contributor", ("2026-03-01", "joined after launch; benchmark subgroup Mar 2026"), True),
    ("firewerx", None, "FireWERX", "NGO", "WG Contributor", ("2026-05-05", "joined after launch; rated at Tahoe"), True),
    ("firms", "land-174", "NASA FIRMS", "Federal Agency", "WG Contributor", (LAUNCH, "operational at launch; WS1 handshake planned"), True),
    ("ororatech", "land-36", "OroraTech", "Private Sector", "WG Contributor", ("2026-05-05", "WS1 update at Tahoe"), False),
    ("planet", None, "Planet", "Private Sector", "WG Contributor", ("2026-03-01", "benchmark subgroup member"), False),
    ("jrc", None, "EC Joint Research Centre (JRC)", "Federal Agency", "WG Contributor", ("2026-10-01", "date unknown; on WS2 list by Oct 2026"), False),
    ("cxl", "land-63", "Conservation X Labs", "NGO", "WG Contributor (replaced by SAFF in listings)", ("2026-10-01", "date unknown"), False),
    ("cfa", None, "CFA Victoria", "Federal Agency", "WG Contributor (through AFAC)", ("2026-10-01", "date unknown"), False),
    ("moore", "land-2", "Gordon and Betty Moore Foundation", "NGO", "Strategic Partner (funder)", (LAUNCH, "co-funder"), True),
    ("bezos", "land-5", "Bezos Earth Fund", "NGO", "Strategic Partner (funder)", ("2026-10-01", "date unknown"), False),
    ("nsf", None, "US National Science Foundation (NSF)", "Federal Agency", "Strategic Partner (funder)", ("2025-01-01", "2025 grant"), False),
    ("cofunder", "land-3", "Anonymous Sandbox co-funder", "NGO", "Strategic Partner (funder; keep anonymous externally)", ("2026-05-01", "committed May 2026"), False),
    ("avf", None, "Alaska Venture Fund", "NGO", "Strategic Partner (funder)", ("2026-10-01", "date unknown; logo board"), True),
    ("dbl", None, "DBL Partners", "Private Sector", "Strategic Partner (investor)", ("2026-10-01", "date unknown; logo board"), True),
    ("crf", "land-42", "Climate Resilience Fund", "NGO", "Strategic Partner (funder)", ("2026-10-01", "date unknown"), False),
    ("usfs", "land-101", "USFS", "Federal Agency", "Strategic Partner (funder and adopter)", ("2026-10-01", "date unknown"), False),
    ("muon", "inst-muon-space", "Muon Space", "Private Sector", "Strategic Partner (builds FireSat; not shown as member)", ("2026-10-01", "date unknown"), False),
    ("cwi", "inst-cwi", "Climate & Wildfire Institute (CWI)", "NGO", "Strategic Partner (expertise)", ("2026-10-01", "date unknown; logo board"), True),
    ("amforests", "land-15", "American Forests", "NGO", "Strategic Partner (expertise)", ("2026-10-01", "added by David"), False),
    ("saff", None, "South America Fire Fund (SAFF)", "Consortium", "Member (replaces Conservation X Labs entry)", ("2026-09-01", "formed Sep 2026"), False),
    ("berkeley", "land-14", "UC Berkeley Fire Research Lab", "University", "Member (WG Contributor, WS2); seeking formal onboarding", ("2026-03-01", "benchmarking"), True),
    ("uci", None, "UC Irvine (Randerson lab)", "University", "Extended Contributor (not a member)", ("2026-03-01", "benchmarking"), False),
    ("deepfire", None, "Deep Fire", "Private Sector", "Extended Contributor; seeking formal partnership", ("2026-05-01", "attends WS1 since May 2026"), False),
    ("cloudfire", None, "CloudFire", "Private Sector", "Extended Contributor; seeking formal partnership", ("2026-10-01", "benchmarking"), False),
    ("cary", "land-26", "Cary Institute / WFFRC", "Research Institute", "Extended Contributor; seeking formal partnership", ("2026-10-01", "Fire.OS Sandbox bid"), False),
    ("ctrees", None, "CTrees", "NGO", "Extended Contributor; seeking formal partnership", ("2026-10-01", "date unknown"), False),
    ("riscognition", None, "Riscognition", "Private Sector", "Extended Contributor; seeking formal partnership", ("2026-10-29", "first PMO call 29 Oct 2026"), False),
    ("sjsu", None, "SJSU FireBench", "University", "Extended Contributor", ("2026-10-24", "benchmarking initiative"), False),
    ("salesforce", None, "Salesforce", "Private Sector", "Non-Active Affiliate", (None, "former member; dates unknown"), False),
]
ORG = {}
for key, gid, lbl, itype, tier, (joined, basis), board in ORGS:
    oid = gid or f"aicw-org-{key}"
    ORG[key] = oid
    member_kind = ("Non-active" if "Non-Active" in tier else "Extended contributor" if "Extended" in tier
                   else "Funded, not on a board" if key in ("nsf",) else "Member")
    node(oid, "institution", lbl, institutionType=itype if itype != "University" else "University",
         tags=["AIC:W", f"AIC:W tier: {tier.split(';')[0].split(' (')[0]}"] + (["AIC:W logo board"] if board else []),
         description=f"AIC:W tier: {tier}. Joined: {joined or 'unknown'} ({basis}).", startDate=joined)
    end = "2026-10-01" if key == "salesforce" else None
    edge(oid, AICW, "MEMBER_OF", member_kind.lower(), start=joined, end=end, how=tier, modality=f"joined {joined or 'unknown'}: {basis}",
         tier=tier, joinBasis=basis, onLogoBoard=board)

# Caltech is part of the JPL node; WEF name ok, no logo; Bayshore never named outside the PMO.

# ---------------------------------------------------------------- workstream participation and leads
WS_MEMBERS = {
    "ws1": ["efa", "jpl", "firms", "ororatech", "ucsd", "google", "deepfire"],
    "ws2": ["ai2", "afac", "jpl", "csiro", "edf", "fao", "jrc", "ororatech", "planet", "sig", "ucsd", "woodwell", "google", "berkeley", "uci", "cloudfire", "cary"],
    "ws3": ["afac", "csiro", "edf", "fao", "planscape", "ucsd", "watchduty", "wfca", "woodwell", "cfa", "firewerx"],
    "ws4": ["ai2", "afac", "cxl", "efa", "edf", "fao", "firewerx", "woodwell", "wef", "google", "saff", "sig"],
}
for ws, keys in WS_MEMBERS.items():
    for k in keys:
        j = next(o[5][0] for o in ORGS if o[0] == k)
        edge(ORG[k], f"aicw-{ws}", "PARTICIPATES_IN", "contributor", start=j)
for k in ("sig", "signal"):
    edge(ORG[k], "aicw-pmo", "ADMINISTERS", "runs PMO", start=LAUNCH)
edge(ORG["idinsight"], "aicw-me", "ADMINISTERS", "runs M&E", start=LAUNCH)
edge(ORG["signal"], "aicw-sandbox", "ADMINISTERS", "runs Sandbox Fund", start="2026-10-16")
edge(ORG["sig"], ORG["signal"], "AFFILIATED_WITH", "sister organisation")
edge(ORG["ai2"], "aicw-benchmark", "LEADS", "coordinates", start="2026-03-01")
for k in ("planet", "ucsd", "jpl", "sig", "uci", "berkeley", "cloudfire", "jrc", "edf", "sjsu"):
    j = next(o[5][0] for o in ORGS if o[0] == k)
    edge(ORG[k], "aicw-benchmark", "PARTICIPATES_IN", "benchmark", start=max(j or "2026-03-01", "2026-03-01"))

# ---------------------------------------------------------------- people
PEOPLE = [
    ("david-saah", "David Saah", "sig", "AIC:W lead (SIG / SIG-NAL)"),
    ("karis-tenneson", "Karis Tenneson", "signal", "PMO"),
    ("tate-luoma", "Tate Luoma", "signal", "PMO; runs workstream calls"),
    ("ioana-bouvier", "Ioana Bouvier", "signal", "Programme manager; MEL data steward"),
    ("rob-lawson", "Rob Lawson", "sig", "SIG / Planscape"),
    ("ryan-demilt", "Ryan Demilt", "sig", "WS2 fuels (proposed effort lead)"),
    ("brian-lee", "Brian Lee", "google", "Google lead"),
    ("erin-hattersley", "Erin Hattersley", "google", "Google.org"),
    ("katherine-hecht", "Katherine Hecht", "google", "Google 20%: Sandbox Fund"),
    ("mandy-albanese", "Mandy Albanese", "google", "Google 20%: Red Sky, Googler engagement"),
    ("ilkay-altintas", "Ilkay Altintas", "ucsd", "WS1 lead; Sandbox IC"),
    ("john-mills", "John Mills", "watchduty", "WS3 lead (tentative); Sandbox IC"),
    ("natalie-cilem", "Natalie Çilem", "wef", "WS4 lead (tentative); Sandbox IC"),
    ("duarte-oom", "Duarte Oom", "fao", "WS2/WS3/WS4 contributor"),
    ("andrew-howe", "Andrew Howe", "ai2", "Benchmarking coordinator"),
    ("kimberley-miner", "Kimberley Miner", "jpl", "WS2 fuel moisture (proposed effort lead)"),
    ("ian-mccubbin", "Ian McCubbin", "jpl", "WS1"),
    ("jackie-shuman", "Jackie Shuman", "edf", "WS2 emissions"),
    ("brian-buma", "Brian Buma", "edf", "WS3; named WS2 lead in Oct notes (not confirmed)"),
    ("brendan-rogers", "Brendan Rogers", "woodwell", "WS2 emissions"),
    ("brian-collins", "Brian Collins", "efa", "EFA"),
    ("alex-dehgan", "Alex Dehgan", "cxl", "WS4; SAFF"),
    ("chris-anthony", "Chris Anthony", "firewerx", "Proposed Advisory Board"),
    ("michael-gollner", "Michael Gollner", "berkeley", "UC Berkeley Fire Lab"),
    ("jim-randerson", "Jim Randerson", "uci", "Benchmarking"),
    ("fernando-sedano", "Fernando Sedano", "jrc", "WS2"),
    ("dave-marvin", "Dave Marvin", "planet", "Benchmark subgroup"),
    ("sassan-saatchi", "Sassan Saatchi", "ctrees", "CTrees"),
    ("maria-theodori", "Maria Theodori", "cloudfire", "CloudFire"),
    ("conrad-bielski", "Conrad Bielski", "riscognition", "Riscognition"),
    ("gunter-zeug", "Gunter Zeug", "riscognition", "Riscognition"),
    ("winslow-hansen", "Winslow Hansen", "cary", "Fire.OS"),
    ("sebastien-floodpage", "Sebastien Floodpage", "deepfire", "Deep Fire"),
    ("janice-coen", None, None, "Independent; benchmarking initiative"),
]
for pid, name, org, role in PEOPLE:
    if name is None:
        name = "Janice Coen"
    pj = next((o[5][0] for o in ORGS if o[0] == org), "2026-10-01")
    p = node(f"aicw-p-{pid}", "person", name, role=role, primaryAffiliationId=ORG.get(org), startDate=pj, tags=["AIC:W", "Person"])
    if org:
        edge(p, ORG[org], "AFFILIATED_WITH", "works at")
edge("aicw-p-janice-coen", "aicw-benchmark", "PARTICIPATES_IN", "benchmark", start="2026-10-24")
edge("aicw-p-ilkay-altintas", "aicw-ws1", "LEADS", "WS1 lead", start="2026-10-29", how="Named by David 29 Oct 2026")
edge("aicw-p-john-mills", "aicw-ws3", "LEADS", "WS3 lead (tentative)", start="2026-10-29", how="Tentative, David 29 Oct 2026")
edge("aicw-p-natalie-cilem", "aicw-ws4", "LEADS", "WS4 lead (tentative)", start="2026-10-29", how="Tentative, David 29 Oct 2026; WS4 co-lead since Aug 2025")
edge("aicw-p-duarte-oom", "aicw-ws4", "PARTICIPATES_IN", "WS4 co-lead 2025, now contributor", start="2025-08-06")
edge("aicw-p-andrew-howe", "aicw-benchmark", "LEADS", "coordinator", start="2026-03-01")
edge("aicw-p-david-saah", AICW, "LEADS", "leads AIC:W", start="2024-08-06")
for p in ("ilkay-altintas", "john-mills", "natalie-cilem"):
    edge(f"aicw-p-{p}", "aicw-sandbox", "STEERS", "Investment Committee (invited 28 Oct 2026)", start="2026-10-28")
edge("aicw-p-ioana-bouvier", "aicw-me", "PARTICIPATES_IN", "MEL data steward", start="2026-10-30")

# ---------------------------------------------------------------- partner networks AIC:W sits inside or overlaps
NETS = [
    ("wildfire-commons", "land-167", "product", "Wildfire Commons (UCSD)", "ucsd", "HOSTS", "hosts the AIC:W node and website", LAUNCH),
    ("fao-hub", None, "collaborative", "FAO Global Fire Management Hub", "fao", "PARTNERS_IN", "Fire Hub Phase 2 names Watch Duty and Wildfire Commons as WS3 partners", LAUNCH),
    ("wgfd", None, "collaborative", "FAO Working Group on Fire Data (WGFD)", "fao", "PARTNERS_IN", "Global Fire Data Inventory; User Needs and Gaps report", "2025-06-01"),
    ("gwln", None, "collaborative", "WEF Global Wildfire Leaders Network (GWLN)", "wef", "PARTNERS_IN", "highlights AIC:W tools and FireSat to industry and finance", "2026-01-01"),
    ("pyregence", "land-35", "collaborative", "Pyregence / PyreCast", "sig", "INTEGRATES_WITH", "PyreCast forecasts shown in Watch Duty", LAUNCH),
    ("fire-adapt", None, "program", "FIRE ADAPT / Fire Tech U", "wfca", "PARTNERS_IN", "WFCA training programme for fire services", LAUNCH),
    ("red-sky", None, "collaborative", "Red Sky (wildfire innovation summit)", None, "PARTNERS_IN", "AIC:W silver sponsor; Firetech Showcase", "2025-11-01"),
    ("efa-firesat", "prod-firesat", "product", "FireSat Constellation", "efa", "INTEGRATES_WITH", "FireSat data is the WS1 backbone", LAUNCH),
]
for key, gid, typ, lbl, owner, rel, how, start in NETS:
    nid = gid or f"aicw-net-{key}"
    node(nid, typ, lbl, tags=["AIC:W partner network"], startDate=start)
    if owner:
        edge(ORG[owner], nid, "OPERATES", "runs", start=start)
    edge(nid, AICW, rel, "linked network", how=how, start=start)
edge(ORG["saff"], "aicw-ws4", "PARTICIPATES_IN", "member fund", start="2026-09-01")
edge(ORG["muon"], "prod-firesat", "DEVELOPS", "builds FireSat")
edge(ORG["cxl"], ORG["saff"], "PARTNERS_IN", "designed and launched SAFF", start="2026-09-01")
node("land-128", "product", "European Forest Fire Information System (EFFIS)", tags=["AIC:W partner network"])
edge(ORG["jrc"], "land-128", "OPERATES", "runs EFFIS")
edge(ORG["riscognition"], "land-128", "OPERATES", "runs EFFIS services")
edge(ORG["cfa"], ORG["afac"], "MEMBER_OF", "through AFAC")
edge(ORG["watchduty"], "aicw-net-red-sky", "ATTENDED", "Firetech Showcase", start="2026-11-04")

# ---------------------------------------------------------------- meetings
MEET = [
    ("first-call", "AIC:W first call", "Working Group", "2024-08-06", None),
    ("launch", "AIC:W launch convening (Q1 2025)", "Symposium", "2025-03-24", "14 lightning talks; 19 orgs in intro slides"),
    ("red-sky-2025", "Red Sky 2025", "Symposium", "2025-11-01", None),
    ("tahoe", "Tahoe convening (with Moore)", "Workshop", "2026-05-05", "North Star adjusted to include good fire; WS breakouts"),
    ("aicw-day", "AIC:W Day (Google, San Francisco)", "Symposium", "2026-11-03", "Ratings corrected live by each group"),
    ("red-sky-2026", "Red Sky Summit 2026", "Symposium", "2026-11-04", "AIC:W silver sponsor"),
    ("bench-session", "Benchmarking working session", "Working Group", "2026-11-05", None),
]
for k, lbl, mt, d, summ in MEET:
    m = node(f"aicw-m-{k}", "meeting", lbl, meetingType=mt, date=d, summary=summ, organizerId=AICW, tags=["AIC:W", "Convening"])
    edge(AICW, m, "ORGANIZES", "convenes", start=d)
for k in ("red-sky-2025", "red-sky-2026"):
    edge(f"aicw-m-{k}", "aicw-net-red-sky", "RELATED_TO", "Red Sky")
edge("aicw-m-bench-session", "aicw-benchmark", "RELATED_TO", "session")
for k in ("afac", "jpl", "csiro", "efa", "edf", "fao", "idinsight", "planscape", "sig", "ucsd", "watchduty", "wfca", "woodwell", "wef"):
    edge(ORG[k], "aicw-m-launch", "ATTENDED", "lightning talk", start=LAUNCH)
for k in ("woodwell", "edf", "fao", "ororatech", "moore"):
    edge(ORG[k], "aicw-m-tahoe", "ATTENDED", "led a segment" if k != "moore" else "co-host", start="2026-05-05")

# ---------------------------------------------------------------- funding
GRANTS = [
    ("g-core", "Google.org AIC:W grants (all programmes)", "google", None, 38_200_000, "2024-10-01", "2027-12-31", "Active", "SIG copy of the funding tracker; public figures $27M (Mar 2025), $40M+ (Sep 2026)."),
    ("g-sandbox-google", "Google.org Sandbox contribution", "google", "aicw-sandbox", 4_000_000, "2026-09-08", "2027-12-31", "Awarded", "$3M 2026, $1M 2027 (collaboration agreement)."),
    ("g-sandbox-cofunder", "Anonymous co-funder Sandbox grant", "cofunder", "aicw-sandbox", 4_000_000, "2026-10-22", "2027-06-30", "Awarded", "$2M 2026, $2M Q2 2027; agreement executed 22 Oct 2026. Never name the funder outside the PMO."),
    ("g-pmo", "SIG-NAL PMO and M&E annex", "google", "aicw-pmo", 1_640_000, "2026-07-01", "2027-12-31", "Active", "PMO and M&E annex."),
    ("g-nsf", "NSF award", "nsf", None, 1_050_000, "2025-01-01", None, "Active", "Funding tracker, 2025."),
    ("g-usfs-planscape", "USFS co-funding for Planscape", "usfs", "planscape", 2_000_000, None, None, "Active", "Tier placement notes."),
    ("g-bezos-efa", "Bezos Earth Fund grant to EFA", "bezos", "efa", 26_000_000, None, None, "Awarded", "Completed EFA's philanthropic goal."),
    ("g-saff", "SAFF anchor funding", "moore", "saff", 35_000_000, "2026-09-01", None, "Active", "Moore $30M + Packard $5M toward a $100M target."),
]
for k, lbl, funder, rec, amt, s, e, st, abstract in GRANTS:
    rid = rec if (rec or "").startswith("aicw-") else ORG.get(rec)
    g = node(f"aicw-{k}", "grant", lbl, funderInstitutionId=ORG[funder], recipientInstitutionId=rid, amount=amt,
             startDate=s, endDate=e, status=st, abstract=abstract, tags=["AIC:W", "Funding"] + (["Confidential funder"] if funder == "cofunder" else []))
    edge(ORG[funder], g, "FUNDS", "funds", start=s, end=e, weight=amt)
    if rid:
        edge(g, rid, "AWARDED_TO", "awarded to", start=s, end=e)
edge(ORG["moore"], AICW, "FUNDS", "co-funds", how="Co-funding tab: EFA, EDF, FireWERX, UCSD, Woodwell, WEF; co-hosted Tahoe")

# Sandbox Round 1 (internal: David wants no names or numbers on slides)
BIDS = [
    ("fire-maps", "Sandbox bid: FIRE-MAPS", ["jpl"], "ws2", 800_000, "Received", "Implementation"),
    ("spark-op", "Sandbox bid: Spark Operational", ["csiro", "afac"], "ws2", 995_000, "Received (draft)", "Implementation"),
    ("woodwell-sig", "Sandbox bid: Woodwell-SIG Exploration", ["woodwell", "sig"], "ws2", 599_724, "Received", "Exploration"),
    ("amazon-cerrado", "Sandbox bid: Woodwell Amazon-Cerrado", ["woodwell"], "ws3", 934_098, "Received", "Implementation"),
    ("wfca-efa", "Sandbox bid: WFCA + EFA", ["wfca", "efa"], "ws3", 720_000, "Received", "Implementation"),
    ("edf", "Sandbox bid: EDF", ["edf"], "ws2", None, "Received", "TBC"),
    ("fire-os", "Sandbox bid in development: Fire.OS", ["cary", "sig"], "ws2", 1_000_000, "In development", "Implementation"),
    ("jpl-vc", "Sandbox bid in development: JPL virtual constellation", ["jpl"], "ws1", None, "In development", "TBC"),
    ("deepfire", "Sandbox bid in development: Deep Fire", ["deepfire"], "ws1", None, "In development", "TBC"),
    ("edf-sig-boreal", "Sandbox bid in development: EDF + SIG boreal", ["edf", "sig"], "ws2", None, "In development", "TBC"),
    ("saff", "Sandbox bid in development: SAFF", ["saff"], "ws4", None, "In development", "TBC"),
]
for k, lbl, orgs, ws, amt, st, track in BIDS:
    b = node(f"aicw-bid-{k}", "grant", lbl, amount=amt, status="Pending", startDate="2026-10-16",
             abstract=f"Round 1, {st}. Track: {track}. Internal only: slides show themes, not names or amounts.",
             tags=["AIC:W", "Sandbox Round 1", f"Sandbox track: {track}", "Internal only"])
    edge(b, "aicw-sandbox", "RELATED_TO", "Round 1 bid", start="2026-10-16")
    edge(b, f"aicw-{ws}", "RELATED_TO", "targets", start="2026-10-16")
    for i, o in enumerate(orgs):
        edge(ORG[o], b, "LEADS" if i == 0 else "CO_INVESTIGATOR", "lead" if i == 0 else "partner", start="2026-10-16")

# ---------------------------------------------------------------- rated projects (Capability / Used / Collaboration)
# (key, ws, label, owner orgs, lever(s), outcome, Mar25, May26, Oct26, NorthStar Oct26, launch score, now score, evidence now)
PROJ = [
    ("efa-firesat", "ws1", "EFA: FireSat", ["efa"], "detection", "damage", "PNP", "EPE", "EPE", "EPE", 15, 65, "3 satellites in orbit Jul 2026, calibrating; early-adopter data by end 2026; FIRMS and Deep Fire feeds summer 2027"),
    ("ucsd-node", "ws1", "UCSD: Wildfire Commons node", ["ucsd"], "detection,response", "damage", "PNP", "EPE", "LLE", "LLE", 20, 70, "System live per David 30 Oct 2026; API shared May 2026; catalog; 20 unique repository users in 2025"),
    ("firms", "ws1", "NASA FIRMS", ["firms"], "detection", "damage", "LLP", "LLP", "LLP", "LLP", 50, 60, "Operational system of record; handshake only on the virtual-constellation role"),
    ("ororatech", "ws1", "OroraTech", ["ororatech"], "detection", "damage", "EEP", "EEP", "LLE", "LLE", 20, 70, "System live per David 30 Oct 2026; partnered with EFA on detection feeds"),
    ("sig-fuels", "ws2", "SIG: AlphaEarth fuels", ["sig"], "prevention", "damage,goodfire", "PNP", "EPE", "LEE", "LPE", 10, 60, "10 m CONUS fuels v1 done, validating vs LANDFIRE"),
    ("fire-maps", "ws2", "Caltech/JPL: FIRE-MAPS", ["jpl"], "prevention", "damage", "PNP", "EPE", "LEL", "LPL", 10, 55, "Datasets on Earth Engine, Zenodo, Commons (104 downloads); NISAR workflow; 3 papers"),
    ("ai2-olmo", "ws2", "Ai2: OlmoEarth and benchmark", ["ai2"], "prevention,detection", "damage", "NNN", "EPE", "EEL", "EPL", 0, 50, "Coordinates the benchmark; fuel-moisture model on JPL data; nine-organisation initiative, NSF proposal 4 Nov"),
    ("woodwell-models", "ws2", "Woodwell: boreal and Amazon models", ["woodwell"], "prevention", "damage,goodfire", "PNP", "EPE", "EEE", "EEE", 20, 60, "Carbon-vulnerability map Alaska/Canada; Amazon fire-probability model; FireSat early adopter"),
    ("edf-science", "ws2", "EDF: FireSat science and emissions", ["edf"], "detection", "damage", "PNP", "EPE", "EPL", "EPL", 10, 55, "Science roadmap 2026-2030 from ~100 experts; emissions comparison with Climate TRACE, SLU, Woodwell"),
    ("spark", "ws2", "CSIRO: SPARK", ["csiro"], "response", "damage", "LLP", "LLP", "LLE", "LLE", 25, 45, "36 experimental burns; Spark integration in progress; joint Sandbox bid with AFAC"),
    ("planet", "ws2", "Planet", ["planet"], "detection", "damage", "NNN", "PNP", "PNE", "PNE", None, None, "Benchmark subgroup member; no AIC:W product of its own yet"),
    ("watchduty", "ws3", "Watch Duty", ["watchduty"], "response", "damage", "LLN", "LLP", "LLL", "LLL", 40, 75, "16M+ users, 3,000+ counties; Pyregence and WIFIRE models live; NGFS feed"),
    ("planscape", "ws3", "SIG: Planscape", ["planscape", "sig"], "prevention", "damage,goodfire", "LLN", "LLP", "LLE", "LLE", 35, 70, "CONUS; 1,300+ plans; Placerville 80,000 acres, burn probability down 25%+"),
    ("fao-hub", "ws3", "FAO: Fire Hub and WGFD", ["fao"], "prevention,response", "damage,goodfire", "PNP", "EPE", "LEE", "LEE", 15, 55, "User Needs and Gaps report; 500+ page Global Fire Data Inventory nearly done"),
    ("firewerx", "ws3", "FireWERX", ["firewerx"], "response", "damage", "NNN", "PNP", "EEL", "EEL", 0, 50, "FIUs at OCFA, CAL FIRE, DoW, CONAF; CAL FIRE drone trial Jul 2026"),
    ("wfca-ftu", "ws3", "WFCA: Fire Tech U", ["wfca"], "response", "damage", "PNP", "EPE", "EEE", "EEE", 10, 30, "Ignite exercise; vendor interoperability pledge; reach not reported"),
    ("woodwell-brigades", "ws3", "Woodwell: Amazon brigades", ["woodwell"], "prevention,response", "goodfire", "PNP", "EPE", "EEE", "EEE", 10, 50, "5 GIS and participatory-mapping workshops; Pataxibas brigade workshop Oct 2026"),
    ("wef-gwln", "ws4", "WEF: GWLN and investment case", ["wef"], "enabler", "damage,goodfire", "PNP", "EPP", "EEE", "EEE", 15, 60, "White paper with PwC Jan 2026; Solutions Labs incl. one co-led with SIG"),
    ("afac-hub", "ws4", "AFAC: Emerging Technologies Hub", ["afac"], "detection,response", "damage", "PNP", "EPE", "EEE", "EEE", 10, 50, "Grass-curing AI app with Country Fire Service; AFAC26 showcase"),
    ("signal-pmo", "ws4", "SIG-NAL: PMO and Sandbox Fund", ["signal"], "enabler", "damage,goodfire", "PNP", "EPE", "EEE", "EEE", 20, 55, "Sandbox open, Round 1 closes 16 Nov; SAFF formed by a member"),
    ("carbon-finance", "ws4", "EDF and Woodwell: carbon finance case", ["edf", "woodwell"], "enabler", "goodfire", "NNN", "PNE", "EPE", "EPE", None, None, "Avoided-emissions draft (32 Mt CO2/yr, draft only); no financing secured yet"),
]
IND = ["capability", "used", "collaboration"]
timeseries = []


def ratings(codes):
    return {ind: LEVEL[c] for ind, c in zip(IND, codes)}


for key, ws, lbl, owners, levers, outcomes, m25, m26, o26, ns, s0, s1, ev in PROJ:
    pid = f"aicw-proj-{key}"
    imp = {"2025-03": ratings(m25), "2026-05": ratings(m26), "2026-10": ratings(o26)}
    live_now = sum(1 for v in imp["2026-10"].values() if v == "live")
    desc = (f"{WS[ws][0]} project. Capability / Used / Collaboration: "
            f"Mar 2025 {'/'.join(imp['2025-03'].values())}; May 2026 {'/'.join(imp['2026-05'].values())}; "
            f"Oct 2026 {'/'.join(imp['2026-10'].values())}"
            + (f" (North Star test: {'/'.join(ratings(ns).values())})" if ns != o26 else "")
            + (f". Launch-to-now score {s0} to {s1} of 100." if s0 is not None else ".")
            + f" Evidence: {ev}. PMO draft, to be corrected by each group on 3 Nov 2026.")
    joined = min(next(o[5][0] for o in ORGS if o[0] == k) for k in owners)
    node(pid, "product", lbl, startDate=joined, color=WS_HEX[ws], productType="Project / Hardware", status="Ongoing", description=desc,
         tags=["AIC:W", "Rated project", ws.upper()] + [f"Oct 2026 {i}: {imp['2026-10'][i]}" for i in IND] + (["Live now"] if live_now else []),
         impact=imp, impactNorthStar2026_10=ratings(ns), launchScore=s0, nowScore=s1,
         northStarLevers=levers.split(","), northStarOutcomes=outcomes.split(","))
    edge(f"aicw-{ws}", pid, "HAS_PROJECT", "project", start=LAUNCH)
    for i, o in enumerate(owners):
        edge(ORG[o], pid, "DEVELOPS", "builds", start=LAUNCH, weight=LEVEL_NUM[imp["2026-10"]["capability"]],
             how=f"Capability {imp['2025-03']['capability']} → {imp['2026-05']['capability']} → {imp['2026-10']['capability']}")
    for lv in levers.split(","):
        edge(pid, f"aicw-ns-{lv}", "HAS_TOPIC", "North Star lever")
    for oc in outcomes.split(","):
        edge(pid, f"aicw-ns-{oc}", "HAS_TOPIC", "North Star outcome")
    for (per, plabel), codes in zip(PERIODS, (m25, m26, o26)):
        for ind, c in zip(IND, codes):
            timeseries.append({"entity_id": pid, "entity": lbl, "kind": "project", "workstream": ws.upper(), "indicator": ind,
                               "lens": "own goal", "period": per, "period_label": plabel, "level": LEVEL[c], "level_num": LEVEL_NUM[LEVEL[c]],
                               "evidence": ev if per == "2026-10" else ""})
    for ind, c in zip(IND, ns):
        timeseries.append({"entity_id": pid, "entity": lbl, "kind": "project", "workstream": ws.upper(), "indicator": ind,
                           "lens": "North Star", "period": "2026-10", "period_label": "Oct 2026 (now)", "level": LEVEL[c],
                           "level_num": LEVEL_NUM[LEVEL[c]], "evidence": ev})
    if s0 is not None:
        for per, sc in (("2025-03", s0), ("2026-10", s1)):
            timeseries.append({"entity_id": pid, "entity": lbl, "kind": "project", "workstream": ws.upper(), "indicator": "launch-to-now score (0-100)",
                               "lens": "own goal", "period": per, "period_label": dict(PERIODS)[per], "level": "", "level_num": sc, "evidence": ev if per == "2026-10" else ""})

# Workstream-level indicators (W1a..W4c) on the workstream nodes
WSIND = {
    "ws1": [("capability", "PEE"), ("used", "NPE"), ("collaboration", "PEE")],
    "ws2": [("capability", "PEL"), ("used", "NPE"), ("collaboration", "PEL")],
    "ws3": [("capability", "ELL"), ("used", "ELL"), ("collaboration", "NPE")],
    "ws4": [("capability", "PEE"), ("used", "NPE"), ("collaboration", "PPP")],
}
for ws, inds in WSIND.items():
    imp = {per: {ind: LEVEL[c[i]] for ind, c in inds} for i, (per, _) in enumerate(PERIODS)}
    n = nodes[f"aicw-{ws}"]
    n["impact"] = imp
    n["description"] += " Workstream ratings (Capability / Used / Collaboration): " + "; ".join(
        f"{lbl.split(' (')[0]} {'/'.join(imp[per].values())}" for per, lbl in PERIODS) + "."
    for ind, c in inds:
        for i, (per, plabel) in enumerate(PERIODS):
            timeseries.append({"entity_id": f"aicw-{ws}", "entity": WS[ws][0], "kind": "workstream", "workstream": ws.upper(), "indicator": ind,
                               "lens": "own goal", "period": per, "period_label": plabel, "level": LEVEL[c[i]], "level_num": LEVEL_NUM[LEVEL[c[i]]], "evidence": ""})

# Linkages between workstreams (L1-L6)
LINKS = [
    ("L1", "ws1", "ws2", "WS1 observations into WS2 models", "NPE", "Ai2 satellite-pass interpolation models on benchmark fires; early-adopter data due end 2026"),
    ("L2", "ws1", "ws3", "WS1 observations into WS3 platforms", "NPP", "Still planned; Watch Duty runs on NOAA NGFS; FireSat to FIRMS not live"),
    ("L3", "ws2", "ws3", "WS2 models into WS3 platforms", "PEL", "Pyregence and WIFIRE models live inside Watch Duty, reaching 16-17M people"),
    ("L4", "ws3", "ws2", "WS3 user needs back to WS1 and WS2", "NPP", "No mechanism carries FAO user-needs findings into WS1/WS2 workplans"),
    ("L5", "ws3", "ws4", "WS1-WS3 evidence into the WS4 investment case", "NPE", "EDF economics (qualitative), Watch Duty and Planscape reach, Impact Index draft"),
    ("L6", "ws4", "ws1", "WS4 money and partners back to WS1-WS3", "PEE", "Sandbox open, awards early 2027; SAFF; Phase II ask pending"),
]
for code, a, b, lbl, codes, ev in LINKS:
    imp = {per: LEVEL[c] for (per, _), c in zip(PERIODS, codes)}
    edge(f"aicw-{a}", f"aicw-{b}", "INTEGRATES_WITH", f"{code}: {lbl}", start=LAUNCH, weight=LEVEL_NUM[imp["2026-10"]],
         how=f"{code} {imp['2025-03']} → {imp['2026-05']} → {imp['2026-10']}", modality=ev, linkage=code, impact=imp)
    for per, plabel in PERIODS:
        timeseries.append({"entity_id": f"aicw-{a}>{b}", "entity": f"{code}: {lbl}", "kind": "linkage", "workstream": f"{a.upper()}→{b.upper()}",
                           "indicator": "linkage", "lens": "own goal", "period": per, "period_label": plabel, "level": imp[per],
                           "level_num": LEVEL_NUM[imp[per]], "evidence": ev if per == "2026-10" else ""})

# Collaboration links between members (made or strengthened by the collaborative), with first-seen date
COLLAB = [
    ("efa", "ucsd", "data access tiers defined together; FireSat ingestion adapter waiting on data", "2026-05-05"),
    ("ucsd", "firms", "UCSD ingestion built for FIRMS data; FIRMS-aligned handoff planned", "2026-05-05"),
    ("efa", "ororatech", "partnered directly on WS1 detection feeds", "2026-05-05"),
    ("efa", "firms", "FireSat and OroraTech L2 feeds to be piloted in FIRMS staging", "2026-10-28"),
    ("jpl", "ai2", "FIRE-MAPS fuel products run in OlmoEarth", "2026-05-05"),
    ("jpl", "sig", "fuel products tested with SIG alongside AlphaEarth", "2026-05-05"),
    ("ai2", "sig", "benchmarking subgroup, then the nine-org initiative and NSF proposal", "2026-03-01"),
    ("ai2", "edf", "EDF in the benchmark subgroup agreeing fires and metrics", "2026-03-01"),
    ("edf", "woodwell", "joint emissions-management convening, Jan 2026, ~40 experts", "2026-01-15"),
    ("csiro", "afac", "joint Sandbox proposal: live ignitions into SPARK", "2026-10-16"),
    ("sig", "afac", "early talks on smoke vulnerability with AFAC and CSIRO", "2026-10-01"),
    ("watchduty", "planscape", "both built with SIG; PyreCast forecasts in Watch Duty", LAUNCH),
    ("watchduty", "firewerx", "two channels to agencies; FireSat data planned into both", "2026-05-05"),
    ("fao", "watchduty", "FAO Phase 2 names Watch Duty and Wildfire Commons as WS3 partners", "2026-10-01"),
    ("planscape", "woodwell", "Planscape Canada and Alaska expansion with Woodwell and EDF", "2026-10-01"),
    ("firewerx", "wfca", "both translate FireSat for fire services", "2026-05-05"),
    ("wef", "fao", "WEF, FAO and SIG aligning global fire initiatives", "2026-05-05"),
    ("wef", "signal", "GWLN highlights AIC:W tools and FireSat to industry and finance", "2026-01-01"),
    ("idinsight", "signal", "midterm finding that joint work needs its own budget shaped the Sandbox Fund", "2026-04-22"),
    ("edf", "wef", "economics of early detection feeds the investment case", "2026-10-01"),
    ("efa", "google", "Google Research adapting its fire-boundaries model to FireSat", "2026-10-28"),
    ("ucsd", "watchduty", "WIFIRE models displayed in Watch Duty", "2026-10-01"),
]
for a, b, how, start in COLLAB:
    edge(ORG[a], ORG[b], "COLLABORATES_WITH", "collaborates", start=start, how=how, modality=f"first seen {start}")
    timeseries.append({"entity_id": f"{ORG[a]}~{ORG[b]}", "entity": f"{nodes[ORG[a]]['label']} ↔ {nodes[ORG[b]]['label']}", "kind": "member link",
                       "workstream": "", "indicator": "collaboration link exists", "lens": "own goal", "period": start[:7],
                       "period_label": f"first seen {start}", "level": "present", "level_num": 1, "evidence": how})

# ---------------------------------------------------------------- outputs
meta = {"title": "AI Collaborative: Wildfires (AIC:W) network", "version": "1.0.0",
        "description": "AIC:W members, workstreams, leads, partner networks, funding, Sandbox Round 1, rated projects and linkages, dated for change over time. PMO draft ratings (none/planned/emerging/live) at Mar 2025, May 2026 and Oct 2026.",
        "lastUpdated": NOW}
NODES, EDGES = list(nodes.values()), edges
ids = {n["id"] for n in NODES}
bad = [e for e in EDGES if e["source"] not in ids or e["target"] not in ids]
assert not bad, bad


def dump(path, ns, es, m=meta):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump({"metadata": m, "nodes": ns, "edges": es}, f, indent=1, ensure_ascii=False)


dump(f"{HERE}/aicw-network.json", NODES, EDGES)

# Snapshots: keep what existed on each date; ratings shown are that date's
for per, plabel in PERIODS:
    cutoff = per + "-31"
    sn = []
    for n in NODES:
        s = n.get("startDate") or n.get("date")
        if (s and s > cutoff and n["type"] != "meeting") or n["id"] == ORG["salesforce"]:
            continue
        n2 = dict(n)
        if "impact" in n and n["type"] == "product":
            r = n["impact"][per]
            n2["tags"] = [t for t in n["tags"] if not t.startswith("Oct 2026") and t != "Live now"] + [f"{plabel[:8]} {i}: {r[i]}" for i in IND] + (["Live at this date"] if "live" in r.values() else [])
            n2["description"] = f"Ratings at {plabel}: Capability {r['capability']}, Used {r['used']}, Collaboration {r['collaboration']}. " + n["description"]
        sn.append(n2)
    keep = {n["id"] for n in sn}
    se = []
    for e in EDGES:
        if e["source"] not in keep or e["target"] not in keep:
            continue
        if e.get("startDate") and e["startDate"] > cutoff:
            continue
        if e["type"] == "MEMBER_OF" and not e.get("startDate"):
            continue
        e2 = dict(e)
        imp = (e.get("properties") or {}).get("impact")
        if imp:
            e2["weight"] = LEVEL_NUM[imp[per]]
            e2["label"] = e["label"].split(":")[0] + f": {imp[per]}"
        se.append(e2)
    se = [e for e in se if e["source"] in keep and e["target"] in keep]
    smeta = {**meta, "title": f"AIC:W network at {plabel}", "lastUpdated": NOW}
    dump(f"{HERE}/snapshots/aicw-{per}.json", sn, se, smeta)
    with open(f"{HERE}/snapshots/initialData-{per}.ts", "w") as f:
        f.write("import type { NetworkDataset } from '../types/graph';\n\n// AIC:W network snapshot, generated by aicw/graphember/build.py\n")
        f.write("export const INITIAL_DATASET: NetworkDataset = " + json.dumps({"metadata": smeta, "nodes": sn, "edges": se}, indent=1, ensure_ascii=False) + ";\n")
    print(per, len(sn), "nodes", len(se), "edges")

with open(f"{HERE}/aicw-impact-timeseries.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=list(timeseries[0].keys()))
    w.writeheader(); w.writerows(timeseries)
with open(f"{HERE}/aicw-nodes.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["id", "type", "label", "startDate", "tags", "description"])
    for n in NODES:
        w.writerow([n["id"], n["type"], n["label"], n.get("startDate") or n.get("date", ""), "; ".join(n.get("tags", [])), n.get("description") or n.get("abstract") or n.get("role", "")])
with open(f"{HERE}/aicw-edges.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["id", "source", "target", "type", "label", "startDate", "endDate", "weight", "how", "modality"])
    for e in EDGES:
        w.writerow([e["id"], e["source"], e["target"], e["type"], e.get("label", ""), e.get("startDate", ""), e.get("endDate", ""), e.get("weight", ""), e.get("how", ""), e.get("modality", "")])

# Merge into the existing GraphEmber landscape: reuse its node ids, add AIC:W tags and fields
if len(sys.argv) > 1:
    src = sys.argv[1]
    js = subprocess.run(["node", "-e", """
const fs=require('fs');let s=fs.readFileSync(process.argv[1],'utf8');
s=s.replace(/^import[^\\n]*\\n/,'').replace(/export const INITIAL_DATASET[^=]*=/,'globalThis.D =');eval(s);
process.stdout.write(JSON.stringify(globalThis.D));""", src], capture_output=True, text=True, check=True).stdout
    base = json.loads(js)
    by_id = {n["id"]: n for n in base["nodes"]}
    BASE_FIELDS = {"description", "website", "acronym", "location", "tags", "startDate", "endDate", "color", "impact"}
    dup = sorted({n["id"] for n in base["nodes"] if sum(1 for m in base["nodes"] if m["id"] == n["id"]) > 1})
    for n in NODES:
        if n["id"] in by_id:
            old = by_id[n["id"]]
            for k, v in n.items():
                if k == "tags":
                    old["tags"] = list(dict.fromkeys((old.get("tags") or []) + v))
                elif k == "description" and old.get("description"):
                    old["description"] = old["description"] + " | " + v
                elif k == "label":
                    continue  # keep the landscape's name
                elif k not in old and (old["type"] == n["type"] or k in BASE_FIELDS):
                    old[k] = v
        else:
            base["nodes"].append(n)
    base["edges"] += EDGES
    base["metadata"] = {**base["metadata"], "title": base["metadata"]["title"] + " + AIC:W network", "lastUpdated": NOW,
                        "description": base["metadata"]["description"] + " Includes the AIC:W network (members, workstreams, funding, rated projects and linkages over time)."}
    os.makedirs(f"{HERE}/merged", exist_ok=True)
    with open(f"{HERE}/merged/initialData.ts", "w") as f:
        f.write("import type { NetworkDataset } from '../types/graph';\n\n/**\n * CWI wildfire landscape plus the AIC:W network (generated by aicw/graphember/build.py).\n */\n")
        f.write("export const INITIAL_DATASET: NetworkDataset = " + json.dumps(base, indent=1, ensure_ascii=False) + ";\n")
    print("merged", len(base["nodes"]), "nodes", len(base["edges"]), "edges; duplicate ids in the landscape:", dup)

print("total", len(NODES), "nodes", len(EDGES), "edges", len(timeseries), "rating rows")
