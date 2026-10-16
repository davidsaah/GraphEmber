import type { NetworkDataset } from '../types/graph';

/**
 * Climate & Wildfire Institute (CWI) - GraphEmber Wildfire Intelligence Landscape Dataset
 * Grounded in the AI Wildfire Landscape Data and Firelines Ontology.
 */
export const INITIAL_DATASET: NetworkDataset = {
  metadata: {
    title: 'Climate & Wildfire Institute (CWI) - Wildfire Intelligence Landscape',
    version: '2.0.0',
    description: 'Comprehensive wildfire intelligence knowledge graph connecting organizations, systems, satellite constellations, grants, and topics.',
    lastUpdated: '2026-10-16',
  },
  nodes: [
  {
    "id": "topic-fire-monitoring",
    "type": "topic",
    "label": "Fire Monitoring & Early Detection",
    "domain": "Remote Sensing & Spaceborne Observation",
    "scope": "Thermal infrared sensors, satellite detection, automated wildfire alerts within minutes of ignition.",
    "modalities": [
      "satellite",
      "infrared",
      "edge-compute",
      "ground-sensor"
    ],
    "tags": [
      "Topic",
      "Detection",
      "Infrared",
      "Satellite",
      "Early Warning"
    ]
  },
  {
    "id": "topic-firesat",
    "type": "topic",
    "label": "FireSat Constellation & Orbitals",
    "domain": "Spaceborne Remote Sensing",
    "scope": "Multi-satellite constellation dedicated to high-frequency wildfire perimeter and hotspot tracking.",
    "modalities": [
      "satellite",
      "infrared",
      "space-telemetry"
    ],
    "tags": [
      "Topic",
      "FireSat",
      "Earth Fire Alliance",
      "Muon Space",
      "Google.org"
    ]
  },
  {
    "id": "topic-spread-modeling",
    "type": "topic",
    "label": "Wildfire Spread & Physics Modeling",
    "domain": "Computational Fire Physics & AI",
    "scope": "Surface fire propagation, crown runs, Rothermel physics, Albini ember spotting, level-set methods.",
    "modalities": [
      "simulation",
      "physics-engine",
      "ai-spread"
    ],
    "tags": [
      "Topic",
      "Simulation",
      "Physics",
      "Spread",
      "Embers"
    ]
  },
  {
    "id": "topic-risk-mapping",
    "type": "topic",
    "label": "Wildfire Risk & Hazard Mapping",
    "domain": "Geospatial Analytics & Pre-fire Assessment",
    "scope": "Parcel-level and landscape-level fire hazard severity mapping, fuel moisture, exposure modeling.",
    "modalities": [
      "gis",
      "satellite",
      "hazard-indices"
    ],
    "tags": [
      "Topic",
      "Risk Mapping",
      "WUI",
      "Hazard",
      "GIS"
    ]
  },
  {
    "id": "topic-remote-sensing",
    "type": "topic",
    "label": "Remote Sensing Tech & Applications",
    "domain": "Earth Observation & Sensor Systems",
    "scope": "Multispectral, hyperspectral, LiDAR, and SAR imaging for fuels, canopy height, and post-fire severity.",
    "modalities": [
      "satellite",
      "airborne",
      "lidar",
      "multispectral"
    ],
    "tags": [
      "Topic",
      "Remote Sensing",
      "Earth Observation",
      "LiDAR"
    ]
  },
  {
    "id": "topic-home-hardening",
    "type": "topic",
    "label": "Home Hardening & Defensible Space",
    "domain": "Community Resilience & Frontline Defense",
    "scope": "Structure survival, ember-resistant vents, non-combustible zone 0, homeowner grant distribution.",
    "modalities": [
      "on-the-ground",
      "grants",
      "structural-inspection"
    ],
    "tags": [
      "Topic",
      "Home Hardening",
      "Defensible Space",
      "Resilient Home Fund",
      "CWI"
    ]
  },
  {
    "id": "topic-decision-support",
    "type": "topic",
    "label": "Operational Decision Support & Incident Apps",
    "domain": "Incident Command & Policy Translation",
    "scope": "Real-time situational awareness platforms, evacuation planning, cross-agency coordination.",
    "modalities": [
      "web-platform",
      "api",
      "mobile-ops"
    ],
    "tags": [
      "Topic",
      "Decision Support",
      "Incident Command",
      "Operations"
    ]
  },
  {
    "id": "topic-data-commons",
    "type": "topic",
    "label": "Wildfire Data Stores & Commons",
    "domain": "Open Data & Federated Infrastructure",
    "scope": "Shared repositories of fire weather, historical fire perimeters, vegetation fuels, and benchmark datasets.",
    "modalities": [
      "cloud-storage",
      "open-api",
      "stac-catalogs"
    ],
    "tags": [
      "Topic",
      "Data Commons",
      "Open Data",
      "Benchmarks"
    ]
  },
  {
    "id": "inst-cwi",
    "type": "institution",
    "label": "Climate & Wildfire Institute",
    "acronym": "CWI",
    "institutionType": "NGO",
    "location": "Berkeley & Grass Valley, CA",
    "website": "https://climateandwildfire.org",
    "description": "Boundary organization accelerating the translation of wildfire science into public policy and frontline practice. Creator of the Firelines Knowledge Graph and administrator of the Resilient Home Fund.",
    "tags": [
      "CWI",
      "Wildfire",
      "Policy",
      "Community Resilience",
      "Boundary Org",
      "501(c)(3)"
    ]
  },
  {
    "id": "prog-rhf",
    "type": "program",
    "label": "Resilient Home Fund",
    "acronym": "RHF",
    "domain": "Community Wildfire Resilience",
    "leadInstitutionId": "inst-cwi",
    "launchYear": 2024,
    "status": "Active",
    "description": "Wildfire risk reduction grant program for California homeowners administered by the Climate & Wildfire Institute. Connects public action and funding to home hardening and defensible space.",
    "website": "https://www.resilienthomefund.org",
    "tags": [
      "CWI",
      "Resilient Home Fund",
      "Grants",
      "Home Hardening",
      "Defensible Space",
      "California"
    ]
  },
  {
    "id": "prod-firelines",
    "type": "product",
    "label": "Firelines Knowledge Graph & Ontology",
    "productType": "Web Platform / SaaS",
    "version": "v2.0",
    "status": "Operational",
    "repositoryUrl": "https://github.com/davidsaah/GraphEmber",
    "website": "https://climateandwildfire.org/advance",
    "description": "CWI boundary intelligence platform mapping cross-sector wildfire programs, satellite constellations, policy bodies, and scientific research.",
    "tags": [
      "CWI",
      "Firelines",
      "Ontology",
      "Knowledge Graph",
      "Wildfire Intelligence"
    ]
  },
  {
    "id": "collab-efa",
    "type": "collaborative",
    "label": "Earth Fire Alliance",
    "acronym": "EFA",
    "mission": "A global multi-stakeholder coalition accelerating early wildfire detection and tracking by developing and launching the FireSat constellation.",
    "formationYear": 2023,
    "governanceModel": "Consortium",
    "focusAreas": [
      "FireSat Constellation",
      "Satellite Infrared",
      "Early Detection",
      "Wildfire Policy"
    ],
    "tags": [
      "Collaborative",
      "Coalition",
      "San Francisco",
      "EFA",
      "FireSat"
    ],
    "description": "Alliance uniting Google.org, Muon Space, Environmental Defense Fund, CWI, Moore Foundation, and Minderoo Foundation to launch and operate FireSat."
  },
  {
    "id": "prod-firesat",
    "type": "product",
    "label": "FireSat Constellation",
    "productType": "Project / Hardware",
    "version": "52-satellite constellation",
    "status": "Active Development",
    "location": "Low Earth Orbit (LEO)",
    "documentationUrl": "https://earthfirealliance.org",
    "techStack": [
      "Custom Multispectral Infrared Sensor",
      "Muon Space Spacecraft Bus",
      "Google Cloud AI"
    ],
    "description": "Purpose-built satellite constellation tracking early-stage fires as small as 5x5 meters globally with 20-minute revisit times.",
    "tags": [
      "Product",
      "Satellite",
      "Hardware",
      "Infrared",
      "EFA",
      "FireSat"
    ]
  },
  {
    "id": "inst-google-org",
    "type": "institution",
    "label": "Google.org & Google Research",
    "acronym": "Google.org",
    "institutionType": "Private Sector",
    "location": "Mountain View, CA",
    "website": "https://google.org",
    "description": "Philanthropic and cutting-edge research arm of Google driving AI for social and climate impact.",
    "tags": [
      "AI/ML",
      "Philanthropy",
      "Earth Engine",
      "Cloud Tech"
    ]
  },
  {
    "id": "inst-muon-space",
    "type": "institution",
    "label": "Muon Space",
    "acronym": "Muon",
    "institutionType": "Private Sector",
    "location": "Mountain View, CA",
    "website": "https://muonspace.com",
    "description": "End-to-end satellite mission provider engineering constellation hardware, spacecraft buses, and payloads for Earth observation.",
    "tags": [
      "Satellites",
      "Space Hardware",
      "Remote Sensing",
      "Private Sector"
    ]
  },
  {
    "id": "inst-calfire",
    "type": "institution",
    "label": "CAL FIRE",
    "acronym": "CAL FIRE",
    "institutionType": "Federal Agency",
    "location": "Sacramento, CA",
    "website": "https://www.fire.ca.gov",
    "description": "California Department of Forestry and Fire Protection, leading wildland fire protection and stewardship.",
    "tags": [
      "Wildfire",
      "State Agency",
      "Fire Operations",
      "Forest Health",
      "California"
    ]
  },
  {
    "id": "land-89",
    "type": "institution",
    "label": "AD Telecom",
    "description": "Role: Industry · Delivery: Telecommunication",
    "website": "http://www.adtelecom.es/",
    "location": "",
    "tags": [
      "Utility / telecommunication",
      "Delivery Support",
      "Industry",
      "Telecommunication"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-47",
    "type": "institution",
    "label": "Adaptation Fund",
    "description": "Role: Program Funders · Deliverables: Wildfire management projects",
    "website": "https://www.adaptation-fund.org/",
    "location": "Global",
    "tags": [
      "Philanthropic",
      "Delivery Support",
      "Program Funders",
      "Developing Countries",
      "AI Charter"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-54",
    "type": "product",
    "label": "Advanced Fire Information System (AFIS)",
    "description": "Role: Other Partners · Delivery: Practitioners · Deliverables: Real-time fire alerts",
    "website": "https://engineeringnews.co.za/article/wildfire-satellite-detection-system-launched-across-africa-2015-08-21",
    "location": "South Africa",
    "tags": [
      "Startup / Private",
      "Delivery Support",
      "Other Partners",
      "Practitioners",
      "Africa",
      "Phase: Pre, Active",
      "Detect + Validate"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-118",
    "type": "institution",
    "label": "African Centre of Meteorological Application for Development (ACMAD)",
    "description": "Role: External · Deliverables: Weather forecasts; climate services",
    "website": "https://acmad.org/",
    "location": "Africa",
    "tags": [
      "Nonprofit",
      "External",
      "Africa"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-119",
    "type": "institution",
    "label": "African Union Commission (AUC)",
    "description": "Role: External · Deliverables: Continental policies and programs",
    "website": "https://au.int/en/commission",
    "location": "Africa",
    "tags": [
      "Government",
      "External",
      "Africa"
    ],
    "institutionType": "Federal Agency"
  },
  {
    "id": "land-103",
    "type": "product",
    "label": "AlertCalifornia",
    "description": "Role: Beneficiaries · Delivery: Government / Policy Makers · Tech: Use-Inspired Platforms",
    "website": "https://alertcalifornia.org/about/",
    "location": "",
    "tags": [
      "Academic",
      "Delivery Support",
      "Beneficiaries",
      "Government / Policy Makers"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-104",
    "type": "product",
    "label": "AlertWildfire",
    "description": "Role: Beneficiaries · Delivery: Government / Policy Makers · Deliverables: Detection and evacuation planning systems · Tech: Use-Inspired Platforms",
    "website": "https://www.alertwildfire.org/about/",
    "location": "Western USA",
    "tags": [
      "Academic",
      "Delivery Support",
      "Beneficiaries",
      "Government / Policy Makers",
      "Western USA",
      "Phase: Active",
      "Detect + Validate"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-55",
    "type": "collaborative",
    "label": "All Partners Access Network",
    "description": "Role: Other Partners · Delivery: Practitioners · Deliverables: Improved communication",
    "website": "https://www.apan.org/pages/case-study-wildfires",
    "location": "USA",
    "tags": [
      "Nonprofit",
      "Delivery Support",
      "Other Partners",
      "Practitioners",
      "Global"
    ],
    "governanceModel": "Consortium",
    "focusAreas": [
      "Improved communication",
      "All Stages"
    ]
  },
  {
    "id": "land-83",
    "type": "institution",
    "label": "American Family Insurance",
    "description": "Role: Industry · Delivery: Insurance",
    "website": "https://www.amfamventures.com/news/the-vast-potential-of-wildfire-tech/",
    "location": "",
    "tags": [
      "Startup / Private",
      "Delivery Support",
      "Industry",
      "Insurance"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-15",
    "type": "institution",
    "label": "American Forests",
    "description": "Role: Domain Subject Matter Experts",
    "website": "https://www.americanforests.org/",
    "location": "US",
    "tags": [
      "Nonprofit",
      "Advisors",
      "Domain Subject Matter Experts"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-51",
    "type": "institution",
    "label": "Arabella",
    "description": "Role: Other Partners · Delivery: Consultants",
    "website": "https://www.arabellaadvisors.com/company/",
    "location": "",
    "tags": [
      "Startup / Private",
      "Delivery Support",
      "Other Partners",
      "Consultants"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-87",
    "type": "institution",
    "label": "ARAUCO",
    "description": "Role: Industry · Delivery: Timber Companies · Deliverables: Sustainable timber products",
    "website": "https://ororatech.com/ororatech-arauco-battling-devastating-fires-in-chile/",
    "location": "Chile",
    "tags": [
      "Timber",
      "Delivery Support",
      "Industry",
      "Timber Companies",
      "Chile"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-164",
    "type": "institution",
    "label": "Australasian Fire and Emergency Services Council Limited (AFAC)",
    "description": "Role: Other Partners · Intervention: 2. Enabling faster, more precise data-driven decision making",
    "website": "https://www.afac.com.au/",
    "location": "",
    "tags": [
      "Nonprofit",
      "Other Partners",
      "AI Charter",
      "GWFC Funded"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-3",
    "type": "institution",
    "label": "Bayshore Global Management",
    "description": "Role: Anchor Funders · Deliverables: Environmental initiatives · Tech: Funding · Intervention: 3. Enabling environment",
    "website": "https://bayshorecap.com/",
    "location": "USA",
    "tags": [
      "Philanthropic",
      "Strategic Deciders",
      "Anchor Funders",
      "USA",
      "AI Charter"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-134",
    "type": "product",
    "label": "Behave/FlamMap/Farsite/FSIM (USFS RMRS FMI Software Suite)",
    "description": "Role: External · Deliverables: Simulation tools for fire management",
    "website": "https://www.firelab.org/applications",
    "location": "USA",
    "tags": [
      "Government",
      "External",
      "USA",
      "Phase: Pre",
      "AI Charter",
      "Assess Pre-fire Risks"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-120",
    "type": "product",
    "label": "Bellwether",
    "description": "Role: External · Deliverables: Quick detection alerts for high-risk areas",
    "website": "https://x.company/projects/bellwether/",
    "location": "USA",
    "tags": [
      "Startup / Private",
      "External",
      "Western USA",
      "Phase: Pre",
      "Pre-fire"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-5",
    "type": "institution",
    "label": "Bezos Earth Fund",
    "description": "Role: Anchor Funders · Deliverables: Wildfire prevention and management projects · Tech: Funding",
    "website": "https://www.bezosearthfund.org/",
    "location": "USA",
    "tags": [
      "Philanthropic",
      "Strategic Deciders",
      "Anchor Funders",
      "Global",
      "AI Charter"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-39",
    "type": "institution",
    "label": "Blue Forest",
    "description": "Role: Program Funders",
    "website": "https://www.blueforest.org/finance/forest-resilience-bond/",
    "location": "",
    "tags": [
      "Nonprofit",
      "Delivery Support",
      "Program Funders"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-121",
    "type": "institution",
    "label": "Bushfire Research Centre of Excellence",
    "description": "Role: External · Deliverables: Improved bushfire management strategies",
    "website": "https://brcoe.org/",
    "location": "Australia",
    "tags": [
      "Nonprofit",
      "External",
      "Australia"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-40",
    "type": "collaborative",
    "label": "CA Organized Investment Network",
    "description": "Role: Program Funders",
    "website": "https://www.insurance.ca.gov/0250-insurers/0700-coin/",
    "location": "",
    "tags": [
      "Government",
      "Delivery Support",
      "Program Funders"
    ],
    "governanceModel": "Consortium",
    "focusAreas": []
  },
  {
    "id": "land-13",
    "type": "institution",
    "label": "Cal-Poly Wildland-Urban Interface Fire Institute",
    "description": "Role: Research · Deliverables: Risk mitigation strategies in urban areas",
    "website": "https://fire.calpoly.edu/",
    "location": "USA",
    "tags": [
      "Academic",
      "Advisors",
      "Research",
      "USA"
    ],
    "institutionType": "University"
  },
  {
    "id": "land-94",
    "type": "institution",
    "label": "CalFIRE",
    "description": "Role: Beneficiaries · Delivery: Frontline Users of the AI solutions · Deliverables: Statewide fire management",
    "website": "https://www.fire.ca.gov/",
    "location": "USA",
    "tags": [
      "Government",
      "Delivery Support",
      "Beneficiaries",
      "Frontline Users of the AI solutions",
      "California, USA"
    ],
    "institutionType": "Federal Agency"
  },
  {
    "id": "land-156",
    "type": "institution",
    "label": "California Governor's Office of Emergency Services (CalOES)",
    "description": "Role: External",
    "website": "https://www.caloes.ca.gov/",
    "location": "",
    "tags": [
      "Government",
      "External"
    ],
    "institutionType": "Federal Agency"
  },
  {
    "id": "land-31",
    "type": "institution",
    "label": "California Natural Resource Agency",
    "description": "Role: Primary Delivery Partners · Delivery: Policymakers / Analysts",
    "website": "https://resources.ca.gov/",
    "location": "",
    "tags": [
      "Government",
      "Primary Delivery",
      "Primary Delivery Partners",
      "Policymakers / Analysts"
    ],
    "institutionType": "Federal Agency"
  },
  {
    "id": "land-113",
    "type": "collaborative",
    "label": "California Wildfire & Forest Resilience Task Force",
    "description": "Role: Beneficiaries · Delivery: Researchers",
    "website": "https://wildfiretaskforce.org/",
    "location": "",
    "tags": [
      "NGO / Private / Public Partnership",
      "Delivery Support",
      "Beneficiaries",
      "Researchers"
    ],
    "governanceModel": "Consortium",
    "focusAreas": []
  },
  {
    "id": "land-172",
    "type": "institution",
    "label": "Canadian Interagency Forest Fire Centre",
    "description": "Role: Domain Subject Matter Experts · Intervention: 1. Creating data, technology, & AI solutions that accelerate action",
    "website": "",
    "location": "",
    "tags": [
      "Government",
      "Domain Subject Matter Experts"
    ],
    "institutionType": "Federal Agency"
  },
  {
    "id": "land-26",
    "type": "institution",
    "label": "Cary Institute",
    "description": "Role: Primary Delivery Partners · Delivery: Research",
    "website": "https://www.caryinstitute.org/",
    "location": "",
    "tags": [
      "Nonprofit",
      "Primary Delivery",
      "Primary Delivery Partners",
      "Research",
      "AI Charter"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-56",
    "type": "institution",
    "label": "CIMA Foundation",
    "description": "Role: Other Partners · Delivery: Practitioners · Deliverables: Prediction and prevention of wildfires",
    "website": "https://www.cimafoundation.org/en/",
    "location": "Italy",
    "tags": [
      "Nonprofit",
      "Delivery Support",
      "Other Partners",
      "Practitioners",
      "Italy; Europe",
      "AI Charter"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-111",
    "type": "institution",
    "label": "Climate and Wildfire Institute",
    "description": "Role: Beneficiaries · Delivery: Other information users · Deliverables: Solutions for climate and wildfire challenges · Intervention: 2. Enabling faster, more precise data-driven decision making",
    "website": "https://climateandwildfire.org/",
    "location": "USA",
    "tags": [
      "Nonprofit",
      "Delivery Support",
      "Beneficiaries",
      "Other information users",
      "USA"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-42",
    "type": "institution",
    "label": "Climate Resilience Fund",
    "description": "Role: Program Funders · Intervention: 3. Enabling environment",
    "website": "https://www.climateresiliencefund.org/initiatives/wildfire-resilience-funders/",
    "location": "",
    "tags": [
      "Nonprofit",
      "Delivery Support",
      "Program Funders",
      "AI Charter"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-73",
    "type": "institution",
    "label": "Colorado Forest Restoration Institute (CFRI)",
    "description": "Role: Research · Deliverables: Forest restoration strategies",
    "website": "https://cfri.colostate.edu/",
    "location": "Colorado",
    "tags": [
      "Academic",
      "Delivery Support",
      "Research",
      "Colorado, USA"
    ],
    "institutionType": "University"
  },
  {
    "id": "land-122",
    "type": "institution",
    "label": "Colorado State University",
    "description": "Role: External · Deliverables: Forest resilience strategies",
    "website": "https://csfs.colostate.edu/wildfire-mitigation/",
    "location": "Colorado",
    "tags": [
      "Academic",
      "External",
      "Colorado, USA"
    ],
    "institutionType": "University"
  },
  {
    "id": "land-63",
    "type": "institution",
    "label": "Conservation X Labs",
    "description": "Role: Other Partners · Delivery: Other Participants / Grantees",
    "website": "https://conservationxlabs.com/",
    "location": "",
    "tags": [
      "Startup / Private",
      "Delivery Support",
      "Other Partners",
      "Other Participants / Grantees"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-48",
    "type": "institution",
    "label": "Convective Capital",
    "description": "Role: Program Funders",
    "website": "https://www.convectivecapital.com/",
    "location": "",
    "tags": [
      "Venture Capital",
      "Delivery Support",
      "Program Funders",
      "AI Charter"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-123",
    "type": "institution",
    "label": "Copernicus EU",
    "description": "Role: External · Deliverables: Data for environmental monitoring",
    "website": "https://www.copernicus.eu/en/european-forest-fire-information-system",
    "location": "EU",
    "tags": [
      "Government",
      "External",
      "EU"
    ],
    "institutionType": "Federal Agency"
  },
  {
    "id": "land-109",
    "type": "institution",
    "label": "CSIRO",
    "description": "Role: Beneficiaries · Delivery: Government / Policy Makers · Intervention: 1. Creating data, technology, & AI solutions that accelerate action",
    "website": "https://www.csiro.au/en/news/all/articles/2020/december/hazard-reduction-burning",
    "location": "",
    "tags": [
      "Government",
      "Delivery Support",
      "Beneficiaries",
      "Government / Policy Makers",
      "AI Charter",
      "GWFC Funded"
    ],
    "institutionType": "Federal Agency"
  },
  {
    "id": "land-124",
    "type": "institution",
    "label": "Data Blanket",
    "description": "Role: External · Deliverables: Infrastructure monitoring",
    "website": "https://www.datablanket.com/",
    "location": "USA",
    "tags": [
      "Startup / Private",
      "External",
      "USA",
      "Phase: Active",
      "Respond + Monitor"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-78",
    "type": "product",
    "label": "Delft University of Technology",
    "description": "Role: Research",
    "website": "https://www.tudelft.nl/en/stories/articles/fighting-wildfires-with-ai-and-simulations",
    "location": "",
    "tags": [
      "Academic",
      "Delivery Support",
      "Research"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-125",
    "type": "institution",
    "label": "Descartes Labs",
    "description": "Role: External · Deliverables: Global fire detection",
    "website": "https://www.businessinsider.com/how-descartes-labs-leveraging-artificial-intelligence-fight-wildfires-2019-12",
    "location": "USA",
    "tags": [
      "Startup / Private",
      "External",
      "Global",
      "Phase: Pre",
      "Detect + Validate"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-95",
    "type": "product",
    "label": "Drought Informatics System of South America",
    "description": "Role: Beneficiaries · Delivery: Frontline Users of the AI solutions · Deliverables: Regional early warning and wildfire strategies",
    "website": "https://sissa.crc-sas.org/blog/2024/06/18/la-importancia-del-manejo-de-los-incendios-para-la-gestion-de-riesgo-en-el-sur-de-sudamerica/",
    "location": "South America",
    "tags": [
      "Government",
      "Delivery Support",
      "Beneficiaries",
      "Frontline Users of the AI solutions",
      "Latin America",
      "Phase: Pre, Active",
      "AI Charter",
      "Detect + Validate"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-126",
    "type": "institution",
    "label": "Dryad",
    "description": "Role: External · Deliverables: Early fire detection",
    "website": "https://www.dryad.net/",
    "location": "Germany",
    "tags": [
      "Startup / Private",
      "External",
      "Europe",
      "Phase: Pre",
      "Detect + Validate"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-85",
    "type": "institution",
    "label": "Edison International",
    "description": "Role: Industry · Delivery: Utilities",
    "website": "https://www.edison.com/investors/southern-california-wildfires",
    "location": "",
    "tags": [
      "Utility / telecommunication",
      "Delivery Support",
      "Industry",
      "Utilities"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-127",
    "type": "institution",
    "label": "Ember Guard",
    "description": "Role: External · Deliverables: Enhanced detection capabilities",
    "website": "https://www.xprize.org/prizes/wildfire/articles/announcing-the-xprize-wildfire-space-based-qualified-teams",
    "location": "Australia",
    "tags": [
      "Startup / Private",
      "External",
      "Australia",
      "Phase: Pre",
      "Detect + Validate"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-170",
    "type": "institution",
    "label": "Embrace the forest",
    "description": "Role: External",
    "website": "https://embracetheforest.com/",
    "location": "",
    "tags": [
      "Startup / Private",
      "External"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-4",
    "type": "institution",
    "label": "Emerson Collective",
    "description": "Role: Anchor Funders · Tech: Funding",
    "website": "https://www.emersoncollective.com",
    "location": "USA",
    "tags": [
      "Philanthropic",
      "Strategic Deciders",
      "Anchor Funders",
      "AI Charter"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-23",
    "type": "institution",
    "label": "Environmental Defense Fund (EDF)",
    "description": "Role: Primary Delivery Partners · Delivery: Implementers · Deliverables: Policies for environmental protection · Intervention: 2. Enabling faster, more precise data-driven decision making",
    "website": "https://www.edf.org/climate/heres-how-climate-change-affects-wildfires",
    "location": "Global",
    "tags": [
      "Nonprofit",
      "Primary Delivery",
      "Primary Delivery Partners",
      "Implementers",
      "Global",
      "AI Charter",
      "GWFC Funded"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-86",
    "type": "institution",
    "label": "Eskom",
    "description": "Role: Industry · Delivery: Utilities · Deliverables: Reliable energy supply",
    "website": "https://www.eskom.co.za/",
    "location": "South Africa",
    "tags": [
      "Utility / telecommunication",
      "Delivery Support",
      "Industry",
      "Utilities",
      "South Africa"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-105",
    "type": "product",
    "label": "EU’s Emergency Response Coordination Centre (ERCC)",
    "description": "Role: Beneficiaries · Delivery: Government / Policy Makers · Deliverables: Efficient emergency responses",
    "website": "https://civil-protection-humanitarian-aid.ec.europa.eu/what/civil-protection/emergency-response-coordination-centre-ercc_en",
    "location": "EU",
    "tags": [
      "Government",
      "Delivery Support",
      "Beneficiaries",
      "Government / Policy Makers",
      "EU",
      "AI Charter"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-57",
    "type": "product",
    "label": "EUMETCast",
    "description": "Role: Other Partners · Delivery: Practitioners",
    "website": "https://user.eumetsat.int/data-access/eumetcast-europe",
    "location": "",
    "tags": [
      "Government",
      "Delivery Support",
      "Other Partners",
      "Practitioners"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-128",
    "type": "product",
    "label": "European Forest Fire Information System (EFFIS)",
    "description": "Role: External · Deliverables: Forest fire data and reports",
    "website": "https://forest-fire.emergency.copernicus.eu/",
    "location": "EU",
    "tags": [
      "Government",
      "External",
      "Europe"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-9",
    "type": "institution",
    "label": "European Space Agency",
    "description": "Role: Domain Subject Matter Experts",
    "website": "https://www.esa.int/",
    "location": "EU",
    "tags": [
      "Government",
      "Advisors",
      "Domain Subject Matter Experts"
    ],
    "institutionType": "Federal Agency"
  },
  {
    "id": "land-129",
    "type": "institution",
    "label": "Exci",
    "description": "Role: External · Deliverables: Comprehensive detection systems",
    "website": "https://www.exci.ai/how-it-works/",
    "location": "USA",
    "tags": [
      "Government",
      "External",
      "USA",
      "Phase: Pre",
      "Detect + Validate"
    ],
    "institutionType": "Federal Agency"
  },
  {
    "id": "land-84",
    "type": "institution",
    "label": "Farmers Insurance",
    "description": "Role: Industry · Delivery: Insurance",
    "website": "https://www.farmers.com/prepare/wildfires/",
    "location": "",
    "tags": [
      "Startup / Private",
      "Delivery Support",
      "Industry",
      "Insurance"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-34",
    "type": "institution",
    "label": "Federation of American Scientists",
    "description": "Role: Primary Delivery Partners · Delivery: Policymakers / Analysts",
    "website": "https://fas.org/publication/wildland-fire-policy-recommendations/",
    "location": "",
    "tags": [
      "Nonprofit",
      "Primary Delivery",
      "Primary Delivery Partners",
      "Policymakers / Analysts"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-160",
    "type": "product",
    "label": "Fire Factor",
    "description": "Role: External",
    "website": "https://firststreet.org/methodology/fire?from=riskfactor.com",
    "location": "",
    "tags": [
      "Startup / Private",
      "External"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-157",
    "type": "product",
    "label": "Fire Integrated Real-Time Intelligence System Program (FIRIS)",
    "description": "Role: External",
    "website": "https://wifire.ucsd.edu/firis",
    "location": "",
    "tags": [
      "Government / Academic",
      "External"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-131",
    "type": "collaborative",
    "label": "Fire Neural Network",
    "description": "Role: External · Deliverables: Rapid fire detection",
    "website": "https://fireneuralnetwork.com/",
    "location": "USA",
    "tags": [
      "Startup / Private",
      "External",
      "USA",
      "Phase: Pre",
      "Detect + Validate"
    ],
    "governanceModel": "Consortium",
    "focusAreas": [
      "Rapid fire detection",
      "Detect + Validate"
    ]
  },
  {
    "id": "land-60",
    "type": "product",
    "label": "Fire Research and Management Exchange System (Frames)",
    "description": "Role: Other Partners · Delivery: Practitioners",
    "website": "https://www.frames.gov/",
    "location": "",
    "tags": [
      "Government",
      "Delivery Support",
      "Other Partners",
      "Practitioners"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-58",
    "type": "product",
    "label": "FIRE-RES",
    "description": "Role: Other Partners · Delivery: Practitioners",
    "website": "https://fire-res.eu/",
    "location": "",
    "tags": [
      "Government",
      "Delivery Support",
      "Other Partners",
      "Practitioners"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-59",
    "type": "product",
    "label": "fireEUrisk",
    "description": "Role: Other Partners · Delivery: Practitioners",
    "website": "https://fireurisk.eu/",
    "location": "",
    "tags": [
      "Government",
      "Delivery Support",
      "Other Partners",
      "Practitioners"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-64",
    "type": "product",
    "label": "FireLogue",
    "description": "Role: Other Partners · Delivery: Other Participants / Grantees · Deliverables: Stakeholder coordination and ecosystem recovery",
    "website": "https://lessonsonfire.firelogue.eu/",
    "location": "EU",
    "tags": [
      "Government",
      "Delivery Support",
      "Other Partners",
      "Other Participants / Grantees",
      "Southern Europe",
      "Phase: Post",
      "Assess Damage + Restore"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-132",
    "type": "product",
    "label": "FireSat",
    "description": "Role: Primary Delivery Partners · Deliverables: Global fire detection from space",
    "website": "https://sites.research.google/gr/wildfires/firesat/",
    "location": "USA",
    "tags": [
      "NGO / Private Partnership",
      "Primary Delivery Partners",
      "Global",
      "Phase: Pre",
      "AI Charter",
      "GWFC Funded",
      "Detect + Validate"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-133",
    "type": "institution",
    "label": "FireSwarm Solutions",
    "description": "Role: External · Deliverables: Firefighting drones",
    "website": "https://www.xprize.org/prizes/wildfire/articles/announcing-the-xprize-wildfire-autonomous-qualified-teams",
    "location": "USA",
    "tags": [
      "Startup / Private",
      "External",
      "USA",
      "Phase: Active",
      "Respond + Monitor"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-65",
    "type": "institution",
    "label": "First Street",
    "description": "Role: Other Partners · Delivery: Other Participants / Grantees",
    "website": "https://firststreet.org/methodology/fire?from=riskfactor.com",
    "location": "",
    "tags": [
      "Startup / Private",
      "Delivery Support",
      "Other Partners",
      "Other Participants / Grantees"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-82",
    "type": "institution",
    "label": "FM Global Property Insurance",
    "description": "Role: Industry · Delivery: Insurance",
    "website": "https://newsroom.fmglobal.com/releases/releases-20230911",
    "location": "",
    "tags": [
      "Startup / Private",
      "Delivery Support",
      "Industry",
      "Insurance"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-135",
    "type": "institution",
    "label": "GatorX",
    "description": "Role: External · Deliverables: Rapid detection tools",
    "website": "https://www.xprize.org/prizes/wildfire/articles/announcing-the-xprize-wildfire-autonomous-qualified-teams",
    "location": "USA",
    "tags": [
      "Startup / Private",
      "External",
      "USA",
      "Phase: Pre",
      "Detect + Validate"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-106",
    "type": "product",
    "label": "Global Wildfire Information System (GWIS)",
    "description": "Role: Beneficiaries · Delivery: Government / Policy Makers · Deliverables: Centralized global wildfire data",
    "website": "https://gwis.jrc.ec.europa.eu/",
    "location": "Global",
    "tags": [
      "Government",
      "Delivery Support",
      "Beneficiaries",
      "Government / Policy Makers",
      "Global",
      "AI Charter"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-172",
    "type": "institution",
    "label": "Google Research",
    "description": "Role: Research · Intervention: 1. Creating data, technology, & AI solutions that accelerate action",
    "website": "",
    "location": "USA",
    "tags": [
      "Startup / Private",
      "Research",
      "Phase: Pre, Active",
      "AI Charter"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-2",
    "type": "institution",
    "label": "Gordon and Betty Moore Foundation",
    "description": "Role: Anchor Funders · Deliverables: Wildfire resilience initiatives · Tech: Funding · Intervention: 3. Enabling environment",
    "website": "https://www.moore.org/",
    "location": "USA",
    "tags": [
      "Philanthropic",
      "Strategic Deciders",
      "Anchor Funders",
      "USA",
      "AI Charter"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-88",
    "type": "collaborative",
    "label": "Green Triangle Fire Alliance",
    "description": "Role: Industry · Delivery: Timber Companies",
    "website": "https://gtfih.com.au/wp-content/uploads/2024/03/Green-Triangle-Fire-Alliance_Overview_7-March-2024_no-date_LOW-RES.pdf",
    "location": "",
    "tags": [
      "Nonprofit",
      "Delivery Support",
      "Industry",
      "Timber Companies"
    ],
    "governanceModel": "Consortium",
    "focusAreas": []
  },
  {
    "id": "land-136",
    "type": "product",
    "label": "gridFirm",
    "description": "Role: External · Deliverables: Grid risk management",
    "website": "https://www.rhizomedata.com/post/introducing-rhizomes-wildfire-intelligence-platform-gridfirm",
    "location": "USA",
    "tags": [
      "Startup / Private",
      "External",
      "USA",
      "Phase: Pre",
      "Assess Pre-fire Risks"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-137",
    "type": "institution",
    "label": "Grupo BoticÃ¡rio",
    "description": "Role: External · Deliverables: Sustainable products",
    "website": "www.boticario.com/",
    "location": "Brazil",
    "tags": [
      "Startup / Private",
      "Delivery Support",
      "External",
      "Brazil"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-90",
    "type": "institution",
    "label": "Huawei",
    "description": "Role: Industry · Delivery: Telecommunication",
    "website": "https://www.huawei.com/en/",
    "location": "",
    "tags": [
      "Utility / telecommunication",
      "Delivery Support",
      "Industry",
      "Telecommunication"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-169",
    "type": "institution",
    "label": "ID Insight",
    "description": "Role: Other Partners · Intervention: 3. Enabling environment",
    "website": "https://www.idinsight.org/methodology/data-science/?utm_source=google&utm_medium=ag&utm_campaign=gs23&gad_source=1&gclid=Cj0KCQiAkJO8BhCGARIsAMkswyhkGUDbP7LAz7EzAspYBF-KRTwruCS_ycYCeSXQq7FLWS0bxWg42t4aAvYKEALw_wcB",
    "location": "",
    "tags": [
      "Nonprofit",
      "Other Partners",
      "AI Charter",
      "GWFC Funded"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-66",
    "type": "product",
    "label": "Ignis",
    "description": "Role: Other Partners · Delivery: Other Participants / Grantees · Deliverables: Unified mapping tools",
    "website": "https://www.ignistech.io/",
    "location": "USA",
    "tags": [
      "Startup / Private",
      "Delivery Support",
      "Other Partners",
      "Other Participants / Grantees",
      "USA"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-114",
    "type": "institution",
    "label": "Indigenous Leadership Initiative",
    "description": "Role: Beneficiaries · Delivery: Researchers",
    "website": "https://www.ilinationhood.ca/guardians-fire-summary",
    "location": "",
    "tags": [
      "Government",
      "Delivery Support",
      "Beneficiaries",
      "Researchers"
    ],
    "institutionType": "Federal Agency"
  },
  {
    "id": "land-80",
    "type": "institution",
    "label": "Instituto Tecnológico y de Estudios Superiores de Monterrey",
    "description": "Role: Research",
    "website": "Kumu connection",
    "location": "",
    "tags": [
      "Academic",
      "Delivery Support",
      "Research"
    ],
    "institutionType": "University"
  },
  {
    "id": "land-165",
    "type": "institution",
    "label": "International Association of Fire Chiefs",
    "description": "Role: External",
    "website": "https://www.iafc.org/about-iafc",
    "location": "",
    "tags": [
      "Nonprofit",
      "External"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-96",
    "type": "institution",
    "label": "International Association of Fire Fighters",
    "description": "Role: Beneficiaries · Delivery: Frontline Users of the AI solutions · Deliverables: Improved pay and conditions for firefighters",
    "website": "https://www.iaff.org/",
    "location": "North America",
    "tags": [
      "Nonprofit",
      "Delivery Support",
      "Beneficiaries",
      "Frontline Users of the AI solutions",
      "North America",
      "Phase: Active",
      "AI Charter",
      "Respond + Monitor"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-138",
    "type": "institution",
    "label": "International Association of Wildland Fire (IAWF)",
    "description": "Role: External · Deliverables: Knowledge sharing; networking",
    "website": "https://www.iawfonline.org/",
    "location": "Global",
    "tags": [
      "Nonprofit",
      "External",
      "Global"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-139",
    "type": "institution",
    "label": "IQ FireWatch",
    "description": "Role: External · Deliverables: Early fire detection",
    "website": "https://www.iq-firewatch.com/",
    "location": "Germany",
    "tags": [
      "Startup / Private",
      "External",
      "Europe",
      "Phase: Pre",
      "Detect + Validate"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-49",
    "type": "institution",
    "label": "Jack Dangermond",
    "description": "Role: Program Funders",
    "website": "https://www.dangermondpreserve.org/stewardship/",
    "location": "",
    "tags": [
      "Philanthropic",
      "Delivery Support",
      "Program Funders"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-162",
    "type": "institution",
    "label": "JPL / California Institute of Technology",
    "description": "Role: Research · Intervention: 1. Creating data, technology, & AI solutions that accelerate action",
    "website": "https://www.caltech.edu/research/jpl",
    "location": "",
    "tags": [
      "Academic",
      "Research",
      "AI Charter",
      "GWFC Funded"
    ],
    "institutionType": "University"
  },
  {
    "id": "land-37",
    "type": "institution",
    "label": "Kayrros",
    "description": "Role: Primary Delivery Partners · Delivery: Engineers",
    "website": "https://www.kayrros.com/",
    "location": "",
    "tags": [
      "Startup / Private",
      "Primary Delivery",
      "Primary Delivery Partners",
      "Engineers"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-77",
    "type": "institution",
    "label": "King’s College",
    "description": "Role: Research · Deliverables: Policy recommendations for wildfire management",
    "website": "https://wildfire.geog.kcl.ac.uk/",
    "location": "UK",
    "tags": [
      "Academic",
      "Delivery Support",
      "Research",
      "UK; Europe"
    ],
    "institutionType": "University"
  },
  {
    "id": "land-115",
    "type": "institution",
    "label": "LA Times",
    "description": "Role: Beneficiaries · Delivery: Researchers",
    "website": "https://www.latimes.com/topic/fires",
    "location": "",
    "tags": [
      "Startup / Private",
      "Delivery Support",
      "Beneficiaries",
      "Researchers"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-72",
    "type": "institution",
    "label": "Lawrence Berkeley Lab",
    "description": "Role: Research",
    "website": "https://wildfire.lbl.gov/",
    "location": "",
    "tags": [
      "Government",
      "Delivery Support",
      "Research"
    ],
    "institutionType": "Federal Agency"
  },
  {
    "id": "land-41",
    "type": "institution",
    "label": "Luksic Foundation and Grupo Boticario",
    "description": "Role: Program Funders · Deliverables: Environmental projects including wildfire management",
    "website": "https://luksicscholars.org/en/",
    "location": "Chile",
    "tags": [
      "Philanthropic",
      "Delivery Support",
      "Program Funders",
      "Chile"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-67",
    "type": "institution",
    "label": "MAST Reforestation",
    "description": "Role: Other Partners · Delivery: Other Participants / Grantees · Deliverables: Post-fire reforestation initiatives",
    "website": "https://www.mastreforest.com/",
    "location": "USA",
    "tags": [
      "Startup / Private",
      "Delivery Support",
      "Other Partners",
      "Other Participants / Grantees",
      "Global",
      "Phase: Post",
      "Assess Damage + Restore"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-68",
    "type": "institution",
    "label": "Mayday",
    "description": "Role: Other Partners · Delivery: Other Participants / Grantees",
    "website": "https://mayday.ai/",
    "location": "Germany",
    "tags": [
      "Startup / Private",
      "Delivery Support",
      "Other Partners",
      "Other Participants / Grantees"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-69",
    "type": "institution",
    "label": "Megafire Action",
    "description": "Role: Other Partners · Delivery: Other Participants / Grantees · Deliverables: Policy change and public engagement",
    "website": "https://www.megafire.org/",
    "location": "USA",
    "tags": [
      "Nonprofit",
      "Delivery Support",
      "Other Partners",
      "Other Participants / Grantees",
      "USA"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-45",
    "type": "institution",
    "label": "Minderoo Foundation",
    "description": "Role: Program Funders · Deliverables: Comprehensive resilience and early detection",
    "website": "https://cdn.minderoo.org/content/uploads/2021/05/11143758/Fire-and-Flood-Resilience-Program-Proprosal.pdf",
    "location": "Australia",
    "tags": [
      "Philanthropic",
      "Delivery Support",
      "Program Funders",
      "Australia",
      "AI Charter"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-107",
    "type": "product",
    "label": "Monitoring of the Environment for Security in Africa (MESA)",
    "description": "Role: Beneficiaries · Delivery: Government / Policy Makers · Deliverables: Environmental data and analysis",
    "website": "http://csc.sadc.int/en/mesa",
    "location": "Africa",
    "tags": [
      "Government",
      "Delivery Support",
      "Beneficiaries",
      "Government / Policy Makers",
      "Africa",
      "AI Charter"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-168",
    "type": "institution",
    "label": "NASA Disasters",
    "description": "Role: Domain Subject Matter Experts",
    "website": "Nick LaHaye",
    "location": "",
    "tags": [
      "Government",
      "Domain Subject Matter Experts",
      "AI Charter"
    ],
    "institutionType": "Federal Agency"
  },
  {
    "id": "land-173",
    "type": "institution",
    "label": "NASA FireSense",
    "description": "Role: Domain Subject Matter Experts · Intervention: 3. Enabling environment",
    "website": "https://cce.nasa.gov/firesense/",
    "location": "",
    "tags": [
      "Government",
      "Domain Subject Matter Experts",
      "AI Charter"
    ],
    "institutionType": "Federal Agency"
  },
  {
    "id": "land-174",
    "type": "institution",
    "label": "NASA FIRMS",
    "description": "Role: Domain Subject Matter Experts · Intervention: 1. Creating data, technology, & AI solutions that accelerate action",
    "website": "Nick LaHaye",
    "location": "",
    "tags": [
      "Government",
      "Domain Subject Matter Experts",
      "AI Charter"
    ],
    "institutionType": "Federal Agency"
  },
  {
    "id": "land-81",
    "type": "institution",
    "label": "National Association of Insurance Commissioners",
    "description": "Role: Industry · Delivery: Insurance",
    "website": "https://content.naic.org/",
    "location": "",
    "tags": [
      "Nonprofit",
      "Delivery Support",
      "Industry",
      "Insurance"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-116",
    "type": "institution",
    "label": "National Fire Safety Council",
    "description": "Role: Beneficiaries · Delivery: Researchers · Deliverables: Fire safety materials and programs",
    "website": "https://nationalfiresafetycouncil.org/",
    "location": "USA",
    "tags": [
      "Nonprofit",
      "Delivery Support",
      "Beneficiaries",
      "Researchers",
      "USA"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-97",
    "type": "institution",
    "label": "National Interagency Fire Center",
    "description": "Role: Beneficiaries · Delivery: Frontline Users of the AI solutions",
    "website": "https://www.nifc.gov/about-us/what-is-nifc",
    "location": "",
    "tags": [
      "Government",
      "Delivery Support",
      "Beneficiaries",
      "Frontline Users of the AI solutions",
      "AI Charter"
    ],
    "institutionType": "Federal Agency"
  },
  {
    "id": "land-11",
    "type": "institution",
    "label": "NOAA",
    "description": "Role: Domain Subject Matter Experts",
    "website": "https://www.noaa.gov/",
    "location": "US",
    "tags": [
      "Government",
      "Advisors",
      "Domain Subject Matter Experts"
    ],
    "institutionType": "Federal Agency"
  },
  {
    "id": "land-140",
    "type": "product",
    "label": "NOBURN App",
    "description": "Role: External · Deliverables: Community risk awareness · Tech: https://noburn.app/",
    "website": "https://www.abc.net.au/news/rural/2024-01-11/ai-helps-protect-australias-forests-green-triangle-from-fires/103277424",
    "location": "Australia",
    "tags": [
      "Academic",
      "External",
      "Australia",
      "Phase: Pre",
      "Assess Pre-fire Risks"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-108",
    "type": "product",
    "label": "North Australia Rangelands and Fire Information (NAFI)",
    "description": "Role: Beneficiaries · Delivery: Government / Policy Makers · Deliverables: Fire management information",
    "website": "https://firenorth.org.au/nafi3/",
    "location": "Australia",
    "tags": [
      "Government",
      "Delivery Support",
      "Beneficiaries",
      "Government / Policy Makers",
      "Australia",
      "AI Charter"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-141",
    "type": "institution",
    "label": "Norwegian University of Science and Technology",
    "description": "Role: External · Deliverables: Technological solutions for wildfire management",
    "website": "https://www.ntnu.edu/",
    "location": "Norway",
    "tags": [
      "Academic",
      "External",
      "Norway; Europe"
    ],
    "institutionType": "University"
  },
  {
    "id": "land-46",
    "type": "institution",
    "label": "NVIDIA Inception",
    "description": "Role: Program Funders",
    "website": "https://www.nvidia.com/en-us/startups/",
    "location": "",
    "tags": [
      "Startup / Private",
      "Delivery Support",
      "Program Funders"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-36",
    "type": "institution",
    "label": "Ororatech",
    "description": "Role: Primary Delivery Partners · Delivery: Engineers · Deliverables: Real-time fire tracking and detection networks · Intervention: 1. Creating data, technology, & AI solutions that accelerate action",
    "website": "http://ororatech.com/",
    "location": "Global",
    "tags": [
      "Startup / Private",
      "Primary Delivery",
      "Primary Delivery Partners",
      "Engineers",
      "Global",
      "Phase: Pre, Active",
      "AI Charter",
      "Detect + Validate"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-142",
    "type": "institution",
    "label": "PanoAI",
    "description": "Role: External · Deliverables: Early detection and situational awareness",
    "website": "https://www.pano.ai/",
    "location": "USA",
    "tags": [
      "Startup / Private",
      "External",
      "USA; Australia",
      "Phase: Pre",
      "Detect + Validate"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-143",
    "type": "product",
    "label": "Pantera",
    "description": "Role: External · Deliverables: Asset protection",
    "website": "https://embracetheforest.com/",
    "location": "USA",
    "tags": [
      "Startup / Private",
      "External",
      "USA",
      "Phase: Pre",
      "Assess Pre-fire Risks"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-61",
    "type": "institution",
    "label": "Pau Costa Foundation",
    "description": "Role: Other Partners · Delivery: Practitioners · Deliverables: Wildfire management education",
    "website": "https://www.paucostafoundation.org/en/organization/",
    "location": "Spain",
    "tags": [
      "Nonprofit",
      "Delivery Support",
      "Other Partners",
      "Practitioners",
      "Europe",
      "AI Charter"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-44",
    "type": "institution",
    "label": "PG&E",
    "description": "Role: Program Funders",
    "website": "https://www.pge.com/en.html",
    "location": "",
    "tags": [
      "Startup / Private",
      "Delivery Support",
      "Program Funders"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-22",
    "type": "collaborative",
    "label": "Planscape Cooperative",
    "description": "Role: Primary Delivery Partners · Delivery: Implementers · Deliverables: Optimized landscape treatments, enhanced ecosystem resilience · Intervention: 1. Creating data, technology, & AI solutions that accelerate action",
    "website": "https://www.planscape.org/",
    "location": "USA",
    "tags": [
      "NGO / Private / Public Partnership",
      "Primary Delivery",
      "Primary Delivery Partners",
      "Implementers",
      "Western USA",
      "Phase: Pre, Post",
      "AI Charter",
      "GWFC Funded",
      "Pre-fire, Post-fire Recovery"
    ],
    "governanceModel": "Consortium",
    "focusAreas": [
      "Optimized landscape treatments, enhanced ecosystem resilience",
      "Pre-fire, Post-fire Recovery"
    ]
  },
  {
    "id": "land-158",
    "type": "product",
    "label": "Planscape Platform",
    "description": "Role: Primary Delivery Partners · Delivery: Implementers · Deliverables: Optimized landscape treatments, enhanced ecosystem resilience",
    "website": "https://app.planscape.org/home",
    "location": "USA",
    "tags": [
      "NGO / Private / Public Partnership",
      "Primary Delivery",
      "Primary Delivery Partners",
      "Implementers",
      "Western USA",
      "Phase: Pre, Post",
      "AI Charter",
      "GWFC Funded",
      "Pre-fire, Post-fire Recovery"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-52",
    "type": "institution",
    "label": "Prometheus Fire Consulting",
    "description": "Role: Other Partners · Delivery: Consultants",
    "website": "https://www.prometheusfireconsulting.com/",
    "location": "",
    "tags": [
      "Startup / Private",
      "Delivery Support",
      "Other Partners",
      "Consultants"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-144",
    "type": "product",
    "label": "PyreCast",
    "description": "Role: External · Deliverables: Accurate pre-fire risk maps, real-time wind-based modeling",
    "website": "https://pyrecast.org/",
    "location": "USA",
    "tags": [
      "NGO / Private / Public Partnership",
      "External",
      "Western USA",
      "Phase: Pre",
      "AI Charter",
      "Pre-fire"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-35",
    "type": "collaborative",
    "label": "Pyregence",
    "description": "Role: Primary Delivery Partners · Delivery: Engineers",
    "website": "https://pyregence.org/",
    "location": "",
    "tags": [
      "NGO / Private / Public Partnership",
      "Primary Delivery",
      "Primary Delivery Partners",
      "Engineers",
      "AI Charter"
    ],
    "governanceModel": "Consortium",
    "focusAreas": []
  },
  {
    "id": "land-24",
    "type": "institution",
    "label": "Rain Aero",
    "description": "Role: Primary Delivery Partners · Delivery: Implementers",
    "website": "https://www.rain.aero/",
    "location": "",
    "tags": [
      "Startup / Private",
      "Primary Delivery",
      "Primary Delivery Partners",
      "Implementers"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-145",
    "type": "product",
    "label": "RedEYE FirePrep",
    "description": "Role: External · Deliverables: Risk assessment reports",
    "website": "https://knowledge.aidr.org.au/media/9041/ajem_08_2021-04.pdf",
    "location": "USA",
    "tags": [
      "Startup / Private",
      "External",
      "USA",
      "Phase: Pre",
      "Assess Pre-fire Risks"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-33",
    "type": "institution",
    "label": "Resources for the Future",
    "description": "Role: Primary Delivery Partners · Delivery: Policymakers / Analysts",
    "website": "https://www.rff.org/topics/climate-risks-and-resilience/wildfires/",
    "location": "",
    "tags": [
      "Nonprofit",
      "Primary Delivery",
      "Primary Delivery Partners",
      "Policymakers / Analysts"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-166",
    "type": "institution",
    "label": "Rhizome",
    "description": "Role: External",
    "website": "https://www.rhizomedata.com/post/introducing-rhizomes-wildfire-intelligence-platform-gridfirm",
    "location": "",
    "tags": [
      "Startup / Private",
      "External"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-74",
    "type": "institution",
    "label": "RMIT University",
    "description": "Role: Research · Deliverables: Wildfire risk assessment tools",
    "website": "https://www.rmit.edu.au/research/centres-collaborations/disaster-research-and-response-network",
    "location": "Australia",
    "tags": [
      "Academic",
      "Delivery Support",
      "Research",
      "Australia"
    ],
    "institutionType": "University"
  },
  {
    "id": "land-146",
    "type": "institution",
    "label": "RoboticsCats",
    "description": "Role: External · Deliverables: Community detection tools",
    "website": "https://www.moore.org/docs/default-source/default-document-library/the-state-of-fire-tech.pdf",
    "location": "USA",
    "tags": [
      "Startup / Private",
      "External",
      "Western USA",
      "Phase: Pre",
      "Detect + Validate"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-171",
    "type": "institution",
    "label": "RTI Exploration",
    "description": "Role: External",
    "website": "https://www.rtiexploration.com/fire-prevention-&-eco-forestation-mapping-w1.html",
    "location": "",
    "tags": [
      "Startup / Private",
      "External"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-62",
    "type": "product",
    "label": "SAFERS",
    "description": "Role: Other Partners · Delivery: Practitioners · Deliverables: Real-time wildfire response and post-fire risk assessment",
    "website": "https://safers-project.eu/",
    "location": "EU",
    "tags": [
      "Government",
      "Delivery Support",
      "Other Partners",
      "Practitioners",
      "Southern Europe, Africa"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-147",
    "type": "institution",
    "label": "Satellites on Fire",
    "description": "Role: External · Deliverables: Regional fire detection",
    "website": "https://www.satellitesonfire.com/",
    "location": "Chile",
    "tags": [
      "Startup / Private",
      "External",
      "South America",
      "Phase: Pre",
      "Detect + Validate"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-50",
    "type": "collaborative",
    "label": "SmartSat CRC",
    "description": "Role: Program Funders",
    "website": "https://smartsatcrc.com/",
    "location": "",
    "tags": [
      "NGO / Private / Public Partnership",
      "Delivery Support",
      "Program Funders"
    ],
    "governanceModel": "Consortium",
    "focusAreas": []
  },
  {
    "id": "land-117",
    "type": "institution",
    "label": "Southern African Development Community  (SADC)",
    "description": "Role: Beneficiaries · Delivery: Researchers · Deliverables: Regional policies; development projects",
    "website": "https://www.sadc.int/",
    "location": "Africa",
    "tags": [
      "Government",
      "Delivery Support",
      "Beneficiaries",
      "Researchers",
      "Southern Africa"
    ],
    "institutionType": "Federal Agency"
  },
  {
    "id": "land-19",
    "type": "institution",
    "label": "Spatial Informatics Group (SIG)",
    "description": "Role: Program Management Office · Intervention: 3. Enabling environment",
    "website": "https://sig-gis.com",
    "location": "Global",
    "tags": [
      "Startup / Private",
      "Primary Delivery",
      "Program Management Office",
      "AI Charter",
      "GWFC Funded"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-100",
    "type": "institution",
    "label": "State of California",
    "description": "Role: Beneficiaries · Delivery: Government / Policy Makers",
    "website": "https://www.ca.gov/",
    "location": "",
    "tags": [
      "Government",
      "Delivery Support",
      "Beneficiaries",
      "Government / Policy Makers"
    ],
    "institutionType": "Federal Agency"
  },
  {
    "id": "land-148",
    "type": "institution",
    "label": "Swansea University Centre for Wildfire Research",
    "description": "Role: External · Deliverables: Advanced wildfire behavior models",
    "website": "https://www.swansea.ac.uk/geography/research-and-impact/centre-for-wildfire-research/",
    "location": "UK",
    "tags": [
      "Academic",
      "External",
      "UK; Europe"
    ],
    "institutionType": "University"
  },
  {
    "id": "land-75",
    "type": "institution",
    "label": "Swinburne University of Technology",
    "description": "Role: Research · Deliverables: Technological solutions for wildfire detection",
    "website": "https://www.swinburne.edu.au/news/2020/02/bushfire-research-at-swinburne/",
    "location": "Australia",
    "tags": [
      "Academic",
      "Delivery Support",
      "Research",
      "Australia"
    ],
    "institutionType": "University"
  },
  {
    "id": "land-149",
    "type": "institution",
    "label": "Technosylva",
    "description": "Role: External · Deliverables: Operational risk assessments",
    "website": "https://technosylva.com/",
    "location": "USA",
    "tags": [
      "Startup / Private",
      "External",
      "USA",
      "Phase: Pre",
      "Assess Pre-fire Risks"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-91",
    "type": "institution",
    "label": "Teleglobal Communications",
    "description": "Role: Industry · Delivery: Telecommunication",
    "website": "https://teleglobals.com/",
    "location": "",
    "tags": [
      "Utility / telecommunication",
      "Delivery Support",
      "Industry",
      "Telecommunication"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-29",
    "type": "institution",
    "label": "The Council for Scientific and Industrial Research (CSIR)",
    "description": "Role: Primary Delivery Partners · Delivery: Research · Deliverables: Solutions for wildfire management and other sectors",
    "website": "https://www.csir.co.za/",
    "location": "South Africa",
    "tags": [
      "Nonprofit",
      "Primary Delivery",
      "Primary Delivery Partners",
      "Research",
      "South Africa"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-112",
    "type": "institution",
    "label": "The Institute of Foresters of Australia and Australian Forest Growers’s Forest Fire Management",
    "description": "Role: Beneficiaries · Delivery: Other information users",
    "website": "https://www.forestry.org.au/forest-fire-management/",
    "location": "",
    "tags": [
      "Nonprofit",
      "Delivery Support",
      "Beneficiaries",
      "Other information users"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-16",
    "type": "institution",
    "label": "The Nature Conservancy",
    "description": "Role: Domain Subject Matter Experts · Deliverables: Wildfire management solutions",
    "website": "https://www.nature.org/en-us/about-us/who-we-are/how-we-work/policy/wildfire-resilience-policy-roadmap/",
    "location": "Global",
    "tags": [
      "Nonprofit",
      "Advisors",
      "Domain Subject Matter Experts",
      "Global"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-38",
    "type": "product",
    "label": "TREEADS",
    "description": "Role: Primary Delivery Partners · Delivery: Engineers · Deliverables: Early detection in high-risk areas",
    "website": "https://treeads-project.eu/project-details/detection-and-response/",
    "location": "EU",
    "tags": [
      "Government",
      "Primary Delivery",
      "Primary Delivery Partners",
      "Engineers",
      "Southern Europe",
      "Phase: Pre, Active",
      "AI Charter",
      "Detect + Validate"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-14",
    "type": "institution",
    "label": "UC Berkeley",
    "description": "Role: Research",
    "website": "https://forests.berkeley.edu/the-center-for-fire-research-and-outreach",
    "location": "US",
    "tags": [
      "Academic",
      "Advisors",
      "Research"
    ],
    "institutionType": "University"
  },
  {
    "id": "land-171",
    "type": "institution",
    "label": "UC Irvine / Climate, Carbon, and Fire Dynamics Lab",
    "description": "Role: Research · Intervention: 1. Creating data, technology, & AI solutions that accelerate action",
    "website": "https://sites.uci.edu/randersonlab/",
    "location": "",
    "tags": [
      "Academic",
      "Research"
    ],
    "institutionType": "University"
  },
  {
    "id": "land-12",
    "type": "institution",
    "label": "UC San Diego / WiFIRE Lab",
    "description": "Role: Research · Intervention: 3. Enabling environment",
    "website": "https://wifire.ucsd.edu/",
    "location": "US",
    "tags": [
      "Academic",
      "Advisors",
      "Research",
      "AI Charter"
    ],
    "institutionType": "University"
  },
  {
    "id": "land-32",
    "type": "institution",
    "label": "UN FAO",
    "description": "Role: Primary Delivery Partners · Delivery: Policymakers / Analysts · Intervention: 2. Enabling faster, more precise data-driven decision making",
    "website": "https://www.fao.org/forestry-fao/firemanagement/101248/en/",
    "location": "",
    "tags": [
      "Government",
      "Primary Delivery",
      "Primary Delivery Partners",
      "Policymakers / Analysts",
      "AI Charter",
      "GWFC Funded"
    ],
    "institutionType": "Federal Agency"
  },
  {
    "id": "land-98",
    "type": "institution",
    "label": "Ungrauemeio",
    "description": "Role: Beneficiaries · Delivery: Frontline Users of the AI solutions",
    "website": "https://www.umgrauemeio.com/en",
    "location": "",
    "tags": [
      "Startup / Private",
      "Delivery Support",
      "Beneficiaries",
      "Frontline Users of the AI solutions"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-110",
    "type": "institution",
    "label": "United Nations Office for Disaster Risk Reduction (UNDRR)",
    "description": "Role: Beneficiaries · Delivery: Government / Policy Makers · Deliverables: Global frameworks for disaster risk reduction",
    "website": "https://www.undrr.org/news/early-warnings-all-africa",
    "location": "Global",
    "tags": [
      "Government",
      "Delivery Support",
      "Beneficiaries",
      "Government / Policy Makers",
      "Global"
    ],
    "institutionType": "Federal Agency"
  },
  {
    "id": "land-150",
    "type": "institution",
    "label": "Universidad de ConcepciÃ³n",
    "description": "Role: External · Deliverables: Wildfire prevention and management strategies",
    "website": "https://noticias.udec.cl/incendios-forestales-estudio-udec-concluye-que-zonas-con-plantaciones-forestales-fueron-las-mas-afectadas/",
    "location": "Chile",
    "tags": [
      "Academic",
      "External",
      "Chile"
    ],
    "institutionType": "University"
  },
  {
    "id": "land-79",
    "type": "institution",
    "label": "Università degli Studi di Bari Aldo Moro",
    "description": "Role: Research",
    "website": "https://www.uniba.it/it/ricerca/dipartimenti/disspa/attivita-didattica/dottorato-di-ricerca/gestione-sostenibile-del-territorio/gestione-sostenibile-del-territorio_en",
    "location": "",
    "tags": [
      "Academic",
      "Delivery Support",
      "Research"
    ],
    "institutionType": "University"
  },
  {
    "id": "land-30",
    "type": "institution",
    "label": "University of Queensland",
    "description": "Role: Primary Delivery Partners · Delivery: Research",
    "website": "https://www.uq.edu.au/",
    "location": "",
    "tags": [
      "Academic",
      "Primary Delivery",
      "Primary Delivery Partners",
      "Research"
    ],
    "institutionType": "University"
  },
  {
    "id": "land-76",
    "type": "institution",
    "label": "University of South Australia",
    "description": "Role: Research",
    "website": "https://unisa.edu.au/media-centre/Releases/2024/fighting-fires-from-space-in-record-time-how-ai-could-prevent-a-repeat-of-australias-devastating-wildfires/",
    "location": "",
    "tags": [
      "Academic",
      "Delivery Support",
      "Research"
    ],
    "institutionType": "University"
  },
  {
    "id": "land-8",
    "type": "institution",
    "label": "US Department of Interior (DOI)",
    "description": "Role: Domain Subject Matter Experts",
    "website": "https://www.space.gov.au/",
    "location": "Austraalia",
    "tags": [
      "Government",
      "Advisors",
      "Domain Subject Matter Experts"
    ],
    "institutionType": "Federal Agency"
  },
  {
    "id": "land-102",
    "type": "institution",
    "label": "US Fire Administration",
    "description": "Role: Beneficiaries · Delivery: Government / Policy Makers",
    "website": "https://www.usfa.fema.gov/",
    "location": "",
    "tags": [
      "Government",
      "Delivery Support",
      "Beneficiaries",
      "Government / Policy Makers"
    ],
    "institutionType": "Federal Agency"
  },
  {
    "id": "land-53",
    "type": "institution",
    "label": "USAID",
    "description": "Role: Other Partners · Delivery: Consultants",
    "website": "https://www.usaid.gov/",
    "location": "",
    "tags": [
      "Government",
      "Delivery Support",
      "Other Partners",
      "Consultants"
    ],
    "institutionType": "Federal Agency"
  },
  {
    "id": "land-101",
    "type": "institution",
    "label": "USFS",
    "description": "Role: Beneficiaries · Delivery: Government / Policy Makers · Deliverables: Conservation and wildfire management",
    "website": "https://www.fs.usda.gov/",
    "location": "USA",
    "tags": [
      "Government",
      "Delivery Support",
      "Beneficiaries",
      "Government / Policy Makers",
      "USA",
      "AI Charter"
    ],
    "institutionType": "Federal Agency"
  },
  {
    "id": "land-92",
    "type": "institution",
    "label": "Vodafone",
    "description": "Role: Industry · Delivery: Telecommunication",
    "website": "https://www.vodafone.com/",
    "location": "",
    "tags": [
      "Utility / telecommunication",
      "Delivery Support",
      "Industry",
      "Telecommunication"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-70",
    "type": "product",
    "label": "VOLTALARM",
    "description": "Role: Other Partners · Delivery: Other Participants / Grantees",
    "website": "https://abv.int/en/early-warning-systems-hold-the-key-to-disaster-management-in-west-africa/",
    "location": "",
    "tags": [
      "Government",
      "Delivery Support",
      "Other Partners",
      "Other Participants / Grantees"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-163",
    "type": "institution",
    "label": "Watch Duty",
    "description": "Role: Primary Delivery Partners · Intervention: 1. Creating data, technology, & AI solutions that accelerate action",
    "website": "https://www.watchduty.org/",
    "location": "",
    "tags": [
      "Nonprofit",
      "Primary Delivery Partners",
      "AI Charter",
      "GWFC Funded"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-152",
    "type": "institution",
    "label": "WATEX System",
    "description": "Role: External · Deliverables: Soil moisture data",
    "website": "https://www.rtiexploration.com/fire-prevention-&-eco-forestation-mapping-w1.html",
    "location": "Spain",
    "tags": [
      "Startup / Private",
      "External",
      "Europe",
      "Phase: Pre",
      "Assess Pre-fire Risks"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-153",
    "type": "product",
    "label": "WEF FireAId Pilot",
    "description": "Role: External · Deliverables: Enhanced risk assessment",
    "website": "https://www3.weforum.org/docs/WEF_The_Next_Frontier_Wildfire_Fighting_2023.pdf",
    "location": "Turkey",
    "tags": [
      "Nonprofit",
      "External",
      "Turkey",
      "Phase: Pre",
      "AI Charter",
      "Assess Pre-fire Risks"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-130",
    "type": "institution",
    "label": "Western Fire Chiefs Association",
    "description": "Role: External · Deliverables: Advocacy; leadership; coordination · Intervention: 2. Enabling faster, more precise data-driven decision making",
    "website": "https://wfca.com/",
    "location": "USA",
    "tags": [
      "Nonprofit",
      "External",
      "USA",
      "AI Charter",
      "GWFC Funded"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-6",
    "type": "product",
    "label": "White House Summit on Building Climate Resilient Communities",
    "description": "Role: Domain Subject Matter Experts",
    "website": "https://www.whitehouse.gov/briefing-room/statements-releases/2023/09/28/fact-sheet-biden-harris-administration-hosts-first-ever-white-house-climate-resilience-summit-and-releases-national-climate-resilience-framework/",
    "location": "US",
    "tags": [
      "Government",
      "Strategic Deciders",
      "Domain Subject Matter Experts"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-99",
    "type": "institution",
    "label": "Wildfire Industry Collective",
    "description": "Role: Beneficiaries · Delivery: Frontline Users of the AI solutions",
    "website": "https://www.wildfire.industries/",
    "location": "",
    "tags": [
      "Nonprofit",
      "Delivery Support",
      "Beneficiaries",
      "Frontline Users of the AI solutions",
      "AI Charter"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-28",
    "type": "institution",
    "label": "Wildfire Interdisciplinary Research Center",
    "description": "Role: Primary Delivery Partners · Delivery: Research · Deliverables: Advanced predictive tools for wildfire management",
    "website": "https://iucrc.nsf.gov/centers/wildfire-interdisciplinary-research-center-wirc/",
    "location": "USA",
    "tags": [
      "Academic",
      "Primary Delivery",
      "Primary Delivery Partners",
      "Research",
      "USA",
      "AI Charter"
    ],
    "institutionType": "University"
  },
  {
    "id": "land-167",
    "type": "product",
    "label": "Wildfire Science and Technology Commons",
    "description": "Role: External",
    "website": "https://www.wildfirecommons.org/",
    "location": "",
    "tags": [
      "NGO / Private / Public Partnership",
      "External",
      "AI Charter"
    ],
    "productType": "Web Platform / SaaS",
    "status": "Operational"
  },
  {
    "id": "land-154",
    "type": "institution",
    "label": "Windracers Environmental",
    "description": "Role: External · Deliverables: Autonomous firefighting drones",
    "website": "https://windracers.com/windracers-environmental-selected-to-advance-in-the-prestigious-xprize-wildfire-competition/",
    "location": "UK",
    "tags": [
      "Startup / Private",
      "External",
      "UK; Europe",
      "Phase: Active",
      "Respond + Monitor"
    ],
    "institutionType": "Private Sector"
  },
  {
    "id": "land-25",
    "type": "institution",
    "label": "Woodwell",
    "description": "Role: Primary Delivery Partners · Delivery: Implementers · Intervention: 1. Creating data, technology, & AI solutions that accelerate action",
    "website": "https://www.woodwellclimate.org/fire-and-climate-audio-story/",
    "location": "",
    "tags": [
      "Nonprofit",
      "Primary Delivery",
      "Primary Delivery Partners",
      "Implementers",
      "AI Charter",
      "GWFC Funded"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-93",
    "type": "institution",
    "label": "World Bank",
    "description": "Role: Industry · Delivery: Telecommunication",
    "website": "https://datacatalog.worldbank.org/search?q=global%20wildfire%20hazard",
    "location": "",
    "tags": [
      "Government",
      "Delivery Support",
      "Industry",
      "Telecommunication"
    ],
    "institutionType": "Federal Agency"
  },
  {
    "id": "land-7",
    "type": "institution",
    "label": "World Economic Forum",
    "description": "Role: Domain Subject Matter Experts · Intervention: 3. Enabling environment",
    "website": "https://www.weforum.org/publications/the-next-frontier-in-fighting-wildfires-fireaid-pilot-and-scaling/",
    "location": "Global",
    "tags": [
      "Nonprofit",
      "Strategic Deciders",
      "Domain Subject Matter Experts",
      "AI Charter",
      "GWFC Funded"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-18",
    "type": "institution",
    "label": "World Meteorological Organization (WMO)",
    "description": "Role: Domain Subject Matter Experts",
    "website": "https://wmo.int/",
    "location": "Global",
    "tags": [
      "Government",
      "Advisors",
      "Domain Subject Matter Experts"
    ],
    "institutionType": "Federal Agency"
  },
  {
    "id": "land-17",
    "type": "institution",
    "label": "World Wildlife Fund",
    "description": "Role: Domain Subject Matter Experts",
    "website": "https://www.worldwildlife.org/stories/fire-management",
    "location": "Global",
    "tags": [
      "Nonprofit",
      "Advisors",
      "Domain Subject Matter Experts"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-71",
    "type": "institution",
    "label": "XPRIZE Wildfires",
    "description": "Role: Other Partners · Delivery: Other Participants / Grantees",
    "website": "https://www.xprize.org/prizes/wildfire",
    "location": "",
    "tags": [
      "Nonprofit",
      "Delivery Support",
      "Other Partners",
      "Other Participants / Grantees"
    ],
    "institutionType": "NGO"
  },
  {
    "id": "land-155",
    "type": "institution",
    "label": "XyloPlan",
    "description": "Role: External · Deliverables: Risk maps and reports",
    "website": "https://www.xyloplan.com/",
    "location": "Canada",
    "tags": [
      "Startup / Private",
      "External",
      "Canada",
      "Phase: Pre",
      "Assess Pre-fire Risks"
    ],
    "institutionType": "Private Sector"
  }
],
  edges: [
  {
    "id": "edge-cwi-rhf",
    "source": "inst-cwi",
    "target": "prog-rhf",
    "type": "OPERATES",
    "label": "administers",
    "how": "administers statewide wildfire risk reduction grant program",
    "modality": "grant funding & homeowner technical assistance"
  },
  {
    "id": "edge-cwi-firelines",
    "source": "inst-cwi",
    "target": "prod-firelines",
    "type": "LEADS",
    "label": "develops",
    "how": "leads wildfire intelligence graph architecture & decision tools",
    "modality": "knowledge graph & data ontology"
  },
  {
    "id": "edge-cwi-efa",
    "source": "inst-cwi",
    "target": "collab-efa",
    "type": "PARTNERS_IN",
    "label": "partners in",
    "how": "boundary policy translation & science advisory",
    "modality": "coalition leadership"
  },
  {
    "id": "edge-calfire-rhf",
    "source": "inst-calfire",
    "target": "prog-rhf",
    "type": "FUNDS",
    "label": "co-funds",
    "how": "California state wildfire defense & community grants",
    "modality": "public finance"
  },
  {
    "id": "edge-google-efa",
    "source": "inst-google-org",
    "target": "collab-efa",
    "type": "PARTNERS_IN",
    "label": "partners in",
    "how": "AI fire detection models & cloud analytics funding",
    "modality": "machine learning & compute"
  },
  {
    "id": "edge-muon-efa",
    "source": "inst-muon-space",
    "target": "collab-efa",
    "type": "PARTNERS_IN",
    "label": "partners in",
    "how": "makes satellites & sensor buses",
    "modality": "satellite hardware"
  },
  {
    "id": "edge-efa-firesat",
    "source": "collab-efa",
    "target": "prod-firesat",
    "type": "PRODUCES",
    "label": "produces",
    "how": "develops & operates satellite constellation",
    "modality": "satellite operations"
  },
  {
    "id": "edge-firesat-topic-mon",
    "source": "prod-firesat",
    "target": "topic-fire-monitoring",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "spaceborne active fire detection",
    "modality": "infrared imaging"
  },
  {
    "id": "edge-firesat-topic-sat",
    "source": "prod-firesat",
    "target": "topic-firesat",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "orbital constellation",
    "modality": "LEO telemetry"
  },
  {
    "id": "edge-rhf-topic-hh",
    "source": "prog-rhf",
    "target": "topic-home-hardening",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "homeowner defense & structure hardening grants",
    "modality": "parcel-level grants"
  },
  {
    "id": "edge-firelines-topic-dec",
    "source": "prod-firelines",
    "target": "topic-decision-support",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "operational knowledge mapping",
    "modality": "graph platform"
  },
  {
    "id": "edge-land-100",
    "source": "land-54",
    "target": "land-29",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "Real-time fire alerts",
    "modality": "Phase: Pre, Active"
  },
  {
    "id": "edge-land-101",
    "source": "land-54",
    "target": "land-168",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "Real-time fire alerts",
    "modality": "Phase: Pre, Active"
  },
  {
    "id": "edge-land-102",
    "source": "land-118",
    "target": "land-119",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "Weather forecasts; climate services",
    "modality": "Phase: All"
  },
  {
    "id": "edge-land-103",
    "source": "land-118",
    "target": "land-18",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "Weather forecasts; climate services",
    "modality": "Phase: All"
  },
  {
    "id": "edge-topic-104",
    "source": "land-87",
    "target": "topic-decision-support",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "Data-driven decision making and incident tools",
    "modality": "operational apps"
  },
  {
    "id": "edge-topic-105",
    "source": "land-3",
    "target": "topic-decision-support",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "Data-driven decision making and incident tools",
    "modality": "operational apps"
  },
  {
    "id": "edge-topic-106",
    "source": "land-134",
    "target": "topic-decision-support",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "Data-driven decision making and incident tools",
    "modality": "operational apps"
  },
  {
    "id": "edge-topic-107",
    "source": "land-120",
    "target": "topic-decision-support",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "Data-driven decision making and incident tools",
    "modality": "operational apps"
  },
  {
    "id": "edge-topic-108",
    "source": "land-5",
    "target": "topic-decision-support",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "Data-driven decision making and incident tools",
    "modality": "operational apps"
  },
  {
    "id": "edge-land-109",
    "source": "land-94",
    "target": "land-22",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "Statewide fire management",
    "modality": "Phase: All"
  },
  {
    "id": "edge-land-110",
    "source": "land-94",
    "target": "land-144",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "Statewide fire management",
    "modality": "Phase: All"
  },
  {
    "id": "edge-land-111",
    "source": "land-56",
    "target": "land-123",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "Prediction and prevention of wildfires",
    "modality": "Phase: All"
  },
  {
    "id": "edge-land-112",
    "source": "land-73",
    "target": "land-122",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "Forest restoration strategies",
    "modality": "Phase: All"
  },
  {
    "id": "edge-land-113",
    "source": "land-123",
    "target": "land-9",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "Data for environmental monitoring",
    "modality": "Phase: All"
  },
  {
    "id": "edge-land-114",
    "source": "land-95",
    "target": "land-110",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "Regional early warning and wildfire strategies",
    "modality": "Phase: Pre, Active"
  },
  {
    "id": "edge-land-115",
    "source": "collab-efa",
    "target": "land-132",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "Near real-time wildfire detection",
    "modality": "Phase: All"
  },
  {
    "id": "edge-topic-116",
    "source": "collab-efa",
    "target": "topic-remote-sensing",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "Remote sensing technology & observation",
    "modality": "remote sensing"
  },
  {
    "id": "edge-topic-117",
    "source": "collab-efa",
    "target": "topic-data-commons",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "Wildfire data repositories and stores",
    "modality": "data store"
  },
  {
    "id": "edge-topic-118",
    "source": "land-23",
    "target": "topic-firesat",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "FireSat satellite data integration",
    "modality": "satellite data pipeline"
  },
  {
    "id": "edge-topic-119",
    "source": "land-23",
    "target": "topic-data-commons",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "Wildfire data repositories and stores",
    "modality": "data store"
  },
  {
    "id": "edge-land-120",
    "source": "land-64",
    "target": "land-62",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "Stakeholder coordination and ecosystem recovery",
    "modality": "Phase: Post"
  },
  {
    "id": "edge-land-121",
    "source": "land-132",
    "target": "land-168",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "Global fire detection from space",
    "modality": "Phase: Pre"
  },
  {
    "id": "edge-topic-122",
    "source": "land-132",
    "target": "topic-remote-sensing",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "Remote sensing technology & observation",
    "modality": "remote sensing"
  },
  {
    "id": "edge-topic-123",
    "source": "land-132",
    "target": "topic-data-commons",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "Wildfire data repositories and stores",
    "modality": "data store"
  },
  {
    "id": "edge-land-124",
    "source": "land-106",
    "target": "land-123",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "Centralized global wildfire data",
    "modality": "Phase: All"
  },
  {
    "id": "edge-land-125",
    "source": "inst-google-org",
    "target": "land-123",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "15-minute wildfire detection reduction, global int",
    "modality": "Phase: All"
  },
  {
    "id": "edge-land-126",
    "source": "land-107",
    "target": "land-119",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "Environmental data and analysis",
    "modality": "Phase: All"
  },
  {
    "id": "edge-land-127",
    "source": "land-107",
    "target": "land-123",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "Environmental data and analysis",
    "modality": "Phase: All"
  },
  {
    "id": "edge-land-128",
    "source": "land-36",
    "target": "inst-google-org",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "Real-time fire tracking and detection networks",
    "modality": "Phase: Pre, Active"
  },
  {
    "id": "edge-topic-129",
    "source": "land-36",
    "target": "topic-remote-sensing",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "Remote sensing technology & observation",
    "modality": "remote sensing"
  },
  {
    "id": "edge-land-130",
    "source": "land-22",
    "target": "land-19",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "Optimized landscape treatments, enhanced ecosystem",
    "modality": "Phase: Pre, Post"
  },
  {
    "id": "edge-topic-131",
    "source": "land-22",
    "target": "topic-firesat",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "FireSat satellite data integration",
    "modality": "satellite data pipeline"
  },
  {
    "id": "edge-topic-132",
    "source": "land-22",
    "target": "topic-risk-mapping",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "Wildfire hazard & vulnerability mapping",
    "modality": "hazard analysis"
  },
  {
    "id": "edge-topic-133",
    "source": "land-22",
    "target": "topic-decision-support",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "Data-driven decision making and incident tools",
    "modality": "operational apps"
  },
  {
    "id": "edge-topic-134",
    "source": "land-22",
    "target": "topic-data-commons",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "Wildfire data repositories and stores",
    "modality": "data store"
  },
  {
    "id": "edge-land-135",
    "source": "land-158",
    "target": "land-19",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "Optimized landscape treatments, enhanced ecosystem",
    "modality": "Phase: Pre, Post"
  },
  {
    "id": "edge-land-136",
    "source": "land-158",
    "target": "land-94",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "Optimized landscape treatments, enhanced ecosystem",
    "modality": "Phase: Pre, Post"
  },
  {
    "id": "edge-topic-137",
    "source": "land-158",
    "target": "topic-firesat",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "FireSat satellite data integration",
    "modality": "satellite data pipeline"
  },
  {
    "id": "edge-topic-138",
    "source": "land-158",
    "target": "topic-risk-mapping",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "Wildfire hazard & vulnerability mapping",
    "modality": "hazard analysis"
  },
  {
    "id": "edge-topic-139",
    "source": "land-158",
    "target": "topic-decision-support",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "Data-driven decision making and incident tools",
    "modality": "operational apps"
  },
  {
    "id": "edge-topic-140",
    "source": "land-158",
    "target": "topic-data-commons",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "Wildfire data repositories and stores",
    "modality": "data store"
  },
  {
    "id": "edge-land-141",
    "source": "land-62",
    "target": "land-123",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "Real-time wildfire response and post-fire risk ass",
    "modality": "Phase: All"
  },
  {
    "id": "edge-land-142",
    "source": "land-62",
    "target": "land-106",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "Real-time wildfire response and post-fire risk ass",
    "modality": "Phase: All"
  },
  {
    "id": "edge-land-143",
    "source": "land-148",
    "target": "land-9",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "Advanced wildfire behavior models",
    "modality": "Phase: All"
  },
  {
    "id": "edge-land-144",
    "source": "land-148",
    "target": "land-123",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "Advanced wildfire behavior models",
    "modality": "Phase: All"
  },
  {
    "id": "edge-land-145",
    "source": "land-75",
    "target": "land-109",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "Technological solutions for wildfire detection",
    "modality": "Phase: All"
  },
  {
    "id": "edge-land-146",
    "source": "land-16",
    "target": "inst-google-org",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "Wildfire management solutions",
    "modality": "Phase: All"
  },
  {
    "id": "edge-land-147",
    "source": "land-38",
    "target": "land-62",
    "type": "COLLABORATES_WITH",
    "label": "collaborates with",
    "how": "Early detection in high-risk areas",
    "modality": "Phase: Pre, Active"
  },
  {
    "id": "edge-topic-148",
    "source": "land-130",
    "target": "topic-firesat",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "FireSat satellite data integration",
    "modality": "satellite data pipeline"
  },
  {
    "id": "edge-topic-149",
    "source": "land-130",
    "target": "topic-risk-mapping",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "Wildfire hazard & vulnerability mapping",
    "modality": "hazard analysis"
  },
  {
    "id": "edge-topic-150",
    "source": "land-130",
    "target": "topic-decision-support",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "Data-driven decision making and incident tools",
    "modality": "operational apps"
  },
  {
    "id": "edge-topic-151",
    "source": "land-130",
    "target": "topic-data-commons",
    "type": "HAS_TOPIC",
    "label": "has topic",
    "how": "Wildfire data repositories and stores",
    "modality": "data store"
  }
],
};
