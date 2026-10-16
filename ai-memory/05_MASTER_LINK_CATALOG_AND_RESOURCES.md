# Master Link Catalog & External Resources Directory
## Project: GraphEmber
**Location**: `c:\Users\David\Projects\GraphEmber\ai-memory\05_MASTER_LINK_CATALOG_AND_RESOURCES.md`  
**Last Updated**: October 16, 2026

---

## 1. Executive Summary

This catalog provides an authoritative, categorized, and searchable directory of **every single URL, web portal, spreadsheet, research initiative, institutional website, and code repository** referenced, fetched, or integrated into GraphEmber across all development sessions.

---

## 2. Core Portals & Institutional Flagships

| Organization / Platform | URL | Role & Context in GraphEmber |
|:---|:---|:---|
| **Climate & Wildfire Institute (CWI)** | [`https://www.climateandwildfire.org/`](https://www.climateandwildfire.org/) | 501(c)(3) independent boundary organization. Primary institutional brand identity, logo source, and ecosystem sponsor. |
| **Resilient Home Fund** | [`https://www.resilienthomefund.org/`](https://www.resilienthomefund.org/) | CWI flagship fund accelerating residential home hardening, defensible space grants, and community wildfire adaptation. |
| **Earth Fire Alliance (EFA)** | [`https://earthfirealliance.org/`](https://earthfirealliance.org/) | Global non-profit coalition powering the FireSat constellation; foundational case study for the Firelines ontology. |
| **Google.org Wildfire Initiatives** | [`https://www.google.org/`](https://www.google.org/) | Major philanthropic funder of the AI Wildfire Commons and Earth Fire Alliance; author of the AI Wildfire Landscape dataset. |
| **Gordon and Betty Moore Foundation** | [`https://www.moore.org/`](https://www.moore.org/) | Core philanthropic co-funder of the Earth Fire Alliance (Palo Alto, CA). |
| **Minderoo Foundation** | [`https://www.minderoo.org/`](https://www.minderoo.org/) | Global philanthropic funder of wildfire intelligence and Earth Fire Alliance (Australia). |
| **Environmental Defense Fund (EDF)** | [`https://www.edf.org/`](https://www.edf.org/) | Founding operating partner in the Earth Fire Alliance leading policy and regulatory alignment. |
| **Muon Space** | [`https://www.muonspace.com/`](https://www.muonspace.com/) | Space technology partner architecting and manufacturing the dedicated FireSat satellite constellation. |
| **Spatial Informatics Group (SIG)** | [`https://sig-gis.com/`](https://sig-gis.com/) | Environmental data science and geospatial analytics consultancy; developer of Pyregence and wildfire tools. |
| **University of San Francisco (USF GsAL)** | [`https://www.usfca.edu/`](https://www.usfca.edu/) | Geospatial Analysis Lab conducting applied wildfire modeling, remote sensing, and student researcher training. |

---

## 3. Google Sheets & Data Repositories

| Dataset Title | URL / Export Endpoint | Status & Ingestion Details |
|:---|:---|:---|
| **AI Wildfire Landscape Data (Sheet 1)** | [`https://docs.google.com/spreadsheets/d/1bw2XNGHbQXSmz2UCveUSq8TLgGJGXpnUIrjVmOCIOvE/edit`](https://docs.google.com/spreadsheets/d/1bw2XNGHbQXSmz2UCveUSq8TLgGJGXpnUIrjVmOCIOvE/edit) | **Fully Ingested**. Contains 172 landscape entities across 40 columns. Saved locally as [`sheet1.csv`](file:///c:/Users/David/Projects/GraphEmber/sheet1.csv). |
| **Supplemental Registry Data (Sheet 2)** | [`https://docs.google.com/spreadsheets/d/16byGxXobEVl8YKtmImO7UMR-95ZsmLYFjY7qjSyY_LY/edit?gid=0#gid=0`](https://docs.google.com/spreadsheets/d/16byGxXobEVl8YKtmImO7UMR-95ZsmLYFjY7qjSyY_LY/edit?gid=0#gid=0) | **Pending Public Access**. Currently returns Google OAuth sign-in redirect (HTTP 302). Dumped locally as [`sheet2.csv`](file:///c:/Users/David/Projects/GraphEmber/sheet2.csv). |
| **Sheet 1 Direct CSV Export URL** | `https://docs.google.com/spreadsheets/d/1bw2XNGHbQXSmz2UCveUSq8TLgGJGXpnUIrjVmOCIOvE/export?format=csv&gid=0` | Public CSV export endpoint used to fetch `sheet1.csv`. |
| **Sheet 2 Direct CSV Export URL** | `https://docs.google.com/spreadsheets/d/16byGxXobEVl8YKtmImO7UMR-95ZsmLYFjY7qjSyY_LY/export?format=csv&gid=0` | CSV export endpoint configured for automated ingestion once public sharing is enabled. |

---

## 4. Wildfire Systems, Tools, Platforms & Satellites

Extracted from the AI Wildfire Landscape dataset and integrated into [`src/data/initialData.ts`](file:///c:/Users/David/Projects/GraphEmber/src/data/initialData.ts):

| System / Tool / Program Name | Website / Reference URL | Domain & Deliverables |
|:---|:---|:---|
| **AlertCalifornia / AlertWildfire** | [`https://www.alertwildfire.org/about/`](https://www.alertwildfire.org/about/) | Pan-tilt-zoom AI camera network for real-time fire confirmation across the western US. |
| **FireSat Constellation** | [`https://earthfirealliance.org/`](https://earthfirealliance.org/) | Multi-satellite orbital constellation dedicated to high-frequency wildfire perimeter and hotspot tracking. |
| **Pyregence Wildfire Modeling** | [`https://pyregence.org/`](https://pyregence.org/) | Next-generation cloud-native wildfire spread, hazard, and risk prediction engine. |
| **LANDFIRE Program** | [`https://www.landfire.gov/`](https://www.landfire.gov/) | Comprehensive vegetation, wildland fuel, and fire regime national mapping program. |
| **Advanced Fire Information System (AFIS)** | [`https://engineeringnews.co.za/article/wildfire-satellite-detection-system-launched-across-africa-2015-08-21`](https://engineeringnews.co.za/article/wildfire-satellite-detection-system-launched-across-africa-2015-08-21) | Satellite-based thermal fire detection and warning system operating across Southern Africa. |
| **CIMA Research Foundation** | [`https://www.cimafoundation.org/en/`](https://www.cimafoundation.org/en/) | Disaster risk reduction research institute (early warning and wildfire hazard modeling in Europe). |
| **Bellwether Project (Alphabet X)** | [`https://x.company/projects/bellwether/`](https://x.company/projects/bellwether/) | AI-powered geospatial prediction platform for natural disasters and climate resilience. |
| **USFS Missoula FireLab Applications** | [`https://www.firelab.org/applications`](https://www.firelab.org/applications) | USFS Rocky Mountain Research Station applications (FARSITE, BehavePlus, FlamMap). |
| **Forest Resilience Bond (Blue Forest)** | [`https://www.blueforest.org/finance/forest-resilience-bond/`](https://www.blueforest.org/finance/forest-resilience-bond/) | Innovative conservation finance tool funding forest health and wildfire risk reduction treatments. |
| **AD Telecom Sensors** | [`http://www.adtelecom.es/`](http://www.adtelecom.es/) | Ground and optical sensor telecommunications systems for early wildfire ignition detection. |
| **SERVIR Global / GeoAI Hub** | [`https://servirglobal.net/geoai-hub`](https://servirglobal.net/geoai-hub) | NASA and USAID joint geospatial intelligence and Earth observation initiative. |
| **USGS 3D Elevation Program (3DEP)** | [`https://www.usgs.gov/3d-elevation-program`](https://www.usgs.gov/3d-elevation-program) | High-resolution LiDAR and elevation datasets for canopy height and terrain modeling. |

---

## 5. Government Agencies, Task Forces & Foundations

| Institution / Agency | URL | Scope & Engagement |
|:---|:---|:---|
| **CAL FIRE** | [`https://www.fire.ca.gov/`](https://www.fire.ca.gov/) | California Department of Forestry and Fire Protection; primary operational deployment partner. |
| **California Natural Resources Agency (CNRA)** | [`https://resources.ca.gov/`](https://resources.ca.gov/) | State cabinet-level agency coordinating climate, biodiversity, and forestry policy. |
| **California Governor's Office of Emergency Services (Cal OES)** | [`https://www.caloes.ca.gov/`](https://www.caloes.ca.gov/) | State emergency management authority coordinating mutual aid and disaster response. |
| **California Department of Insurance (COIN)** | [`https://www.insurance.ca.gov/0250-insurers/0700-coin/`](https://www.insurance.ca.gov/0250-insurers/0700-coin/) | California Organized Investment Network focusing on insurance resilience in high-hazard WUI zones. |
| **California Wildfire & Forest Resilience Task Force** | [`https://wildfiretaskforce.org/`](https://wildfiretaskforce.org/) | High-level interagency task force driving California's Wildfire and Forest Resilience Action Plan. |
| **AFAC (Australasia)** | [`https://www.afac.com.au/`](https://www.afac.com.au/) | National council for fire, emergency services, and land management agencies in Australia and New Zealand. |
| **Adaptation Fund (UNFCCC)** | [`https://www.adaptation-fund.org/`](https://www.adaptation-fund.org/) | International fund financing concrete adaptation projects in climate-vulnerable developing countries. |
| **Bezos Earth Fund** | [`https://www.bezosearthfund.org/`](https://www.bezosearthfund.org/) | Global grantmaking organization investing in climate solutions, nature conservation, and environmental monitoring. |
| **American Forests** | [`https://www.americanforests.org/`](https://www.americanforests.org/) | National nonprofit advancing climate-adapted reforestation and urban forestry resilience. |
| **Cary Institute of Ecosystem Studies** | [`https://www.caryinstitute.org/`](https://www.caryinstitute.org/) | Independent research institute investigating disturbance ecology and environmental resilience. |

---

## 6. Code Repositories & Local Infrastructure

| Asset | Local File / Remote URL | Description |
|:---|:---|:---|
| **GraphEmber GitHub Repository** | [`https://github.com/davidsaah/GraphEmber`](https://github.com/davidsaah/GraphEmber) | Upstream production git repository on branch `main`. |
| **Local Development Server** | [`http://localhost:5173/`](http://localhost:5173/) | Vite dev server running in daemon mode on port 5173. |
| **CWI Flame Logo (PNG)** | [`public/cwi-logo.png`](file:///c:/Users/David/Projects/GraphEmber/public/cwi-logo.png) | High-res transparent faceted flame icon mark. |
| **CWI Horizontal Logo (JPG)** | [`public/cwi-horizontal-logo.jpg`](file:///c:/Users/David/Projects/GraphEmber/public/cwi-horizontal-logo.jpg) | High-res wide corporate brand lockup. |
| **Pyretechnics Repository** | `c:\Users\David\Projects\pyrotechnix_ai` | Sibling project developing Earth Engine ADK fire weather agent pipelines. |
| **GeoAI Hub Repository** | `c:\Users\David\Projects\GeoAI-Hub` | Sibling project deploying LibreChat, STAC, and SERVIR Earth Engine MCP connectors. |
| **GLC Feasibility Repository** | `c:\Users\David\Projects\glc-feasibility` | Sibling project implementing the ZFC automated IFM carbon proforma pipeline. |
