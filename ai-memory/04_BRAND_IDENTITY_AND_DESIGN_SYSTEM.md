# Brand Identity & Design System Specification
## Project: GraphEmber
**Location**: `c:\Users\David\Projects\GraphEmber\ai-memory\04_BRAND_IDENTITY_AND_DESIGN_SYSTEM.md`  
**Reference Code**: [`src/index.css`](file:///c:/Users/David/Projects/GraphEmber/src/index.css), [`src/components/CwiLogo.tsx`](file:///c:/Users/David/Projects/GraphEmber/src/components/CwiLogo.tsx), [`src/components/CwiBrandModal.tsx`](file:///c:/Users/David/Projects/GraphEmber/src/components/CwiBrandModal.tsx), [`index.html`](file:///c:/Users/David/Projects/GraphEmber/index.html)

---

## 1. Institutional Context: Climate & Wildfire Institute (CWI)

The **Climate & Wildfire Institute (CWI)** is an independent 501(c)(3) non-profit boundary organization headquartered in California.

* **Official Portal**: [`https://www.climateandwildfire.org/`](https://www.climateandwildfire.org/)
* **Boundary Organization Mission**: Bridging the gap between cutting-edge climate and wildfire science, technological innovation, public policymaking, and operational frontline response. CWI translates complex predictive models and Earth observation datasets into actionable strategies for land managers, policymakers, and communities.
* **Core Flagship Initiatives**:
  1. **Resilient Home Fund ([`https://www.resilienthomefund.org/`](https://www.resilienthomefund.org/))**: Dedicated fund providing residential home hardening, defensible space grants, and community-scale wildfire mitigation.
  2. **Firelines**: Cross-institutional knowledge graph and ontology modeling relationships across entities, satellites, predictive models, and wildfire research.
  3. **Applied Policy & Translation**: Collaborating with the California Natural Resources Agency (CNRA), CAL FIRE, and insurance regulatory bodies (such as the California Department of Insurance COIN initiative).

---

## 2. Official Brand Assets & File Locations

GraphEmber ships with authentic high-resolution CWI brand assets extracted directly from production portals during development on October 16, 2026:

| Asset Name | Local File Path | Format / Dimensions | Usage in GraphEmber |
|:---|:---|:---:|:---|
| **Faceted Flame Prism Mark** | [`public/cwi-logo.png`](file:///c:/Users/David/Projects/GraphEmber/public/cwi-logo.png) | PNG (34.1 KB, 300dpi) | Browser Favicon in `index.html`, Header brand mark, modal headers, watermark badge. |
| **Horizontal Brand Lockup** | [`public/cwi-horizontal-logo.jpg`](file:///c:/Users/David/Projects/GraphEmber/public/cwi-horizontal-logo.jpg) | JPG (22.3 KB, Wide Lockup) | Showcase presentation in `CwiBrandModal.tsx`. |

### Logo React Component: `src/components/CwiLogo.tsx`
Provides three standardized variants across the UI:
1. `variant="mark"`: The faceted flame prism icon with an optional glowing halo.
2. `variant="horizontal"`: Full corporate lockup with flame icon and styled typographic text (*"CLIMATE & WILDFIRE INSTITUTE"*).
3. `variant="badge"`: Compact pill badge displaying the flame mark alongside a *"501(c)(3) Boundary Organization"* tag.

---

## 3. Design System & CSS Token Architecture

GraphEmber's design system is authored in pure **Vanilla CSS** with a comprehensive CSS Variable architecture in [`src/index.css`](file:///c:/Users/David/Projects/GraphEmber/src/index.css).

### Color Tokens

```css
:root {
  /* CWI Institutional Brand Tokens */
  --color-cwi-gold: #f59e0b;
  --color-cwi-amber: #d97706;
  --color-cwi-flame: #f97316;
  --color-cwi-crimson: #e11d48;
  --color-cwi-dark: #07090e;

  /* Brand Gradients & Glows */
  --cwi-gradient-flame: linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #e11d48 100%);
  --cwi-glow: 0 0 20px rgba(249, 115, 22, 0.4);
  --cwi-glow-intense: 0 0 35px rgba(249, 115, 22, 0.65);

  /* Obsidian Slate Surface Tokens */
  --bg-canvas: #07090e;
  --bg-surface: rgba(15, 23, 42, 0.78);
  --bg-surface-elevated: rgba(30, 41, 59, 0.85);
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-medium: rgba(255, 255, 255, 0.16);

  /* Typography Colors */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
}
```

---

## 4. Typography Pairing Hierarchy

Loaded via Google Fonts in [`index.html`](file:///c:/Users/David/Projects/GraphEmber/index.html):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Nunito:wght@400;600;700;800&family=Outfit:wght@400;500;600;700;800&family=Poppins:wght@500;600;700;800&display=swap" rel="stylesheet">
```

* **Brand Titles & Display Headings**: `Poppins`, `Outfit`, sans-serif (heavy geometry, bold weight, modern presence).
* **Interface & Body Text**: `Nunito`, `Inter`, sans-serif (warm, human-centric, high legibility on dark surfaces).
* **Code, Metadata & Attributes**: `JetBrains Mono`, monospace (clean character separation for node IDs, edge modalities, DOI links, and grant numbers).

---

## 5. Micro-Animations & Dynamic Effects

### Breathing Ember Glow Animation (`.cwi-flame-pulse`)
Applied to the header brand icon and CWI highlight badges to evoke a living ember:
```css
@keyframes cwiFlamePulse {
  0%, 100% {
    filter: drop-shadow(0 0 6px rgba(249, 115, 22, 0.5));
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 0 16px rgba(249, 115, 22, 0.85)) drop-shadow(0 0 28px rgba(225, 29, 72, 0.4));
    transform: scale(1.04);
  }
}

.cwi-flame-pulse {
  animation: cwiFlamePulse 3.2s ease-in-out infinite;
}
```

### Glassmorphism Surface Architecture
Every modal card, drawer, and header uses backdrop blur filters to preserve spatial awareness of the underlying D3 network canvas:
```css
.glass-panel {
  background: rgba(15, 23, 42, 0.78);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05);
}
```

---

## 6. Institutional Showcase Modal: `src/components/CwiBrandModal.tsx`

The **"About CWI"** modal is triggered via the prominent gold/flame badge in the top navigation header. It provides:
1. **Mission Statement**: Explanation of CWI's boundary organization mandate.
2. **Resilient Home Fund Highlight**: Direct link to [resilienthomefund.org](https://www.resilienthomefund.org/) with programmatic grant context.
3. **Interactive Graph Triggers**:
   * *"Highlight CWI Ecosystem in Canvas"*: Programmatically focuses the CWI institution node and its 1-hop neighborhood.
   * *"Filter by CWI & Firelines Initiatives"*: Updates active filter tags to immediately isolate firelines-relevant products and topics.
