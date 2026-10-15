# CarbonIQ — Carbon Footprint Intelligence Platform (PS05)

CarbonIQ is a carbon footprint intelligence, digital twin, and decarbonization simulation web platform designed for university campuses, research facilities, and commercial buildings.

The platform empowers campus facility managers, sustainability directors, and students to understand greenhouse gas emissions across Scope 1, 2, and 3, visualize spatial energy flows on an interactive 3D digital twin, and simulate real-time decarbonization scenarios before capital investment.

---

## 🌟 Key Features

### 1. Unified Carbon Intelligence Dashboard
- **Key Carbon Metrics:** Real-time accounting of Total Gross Emissions (kg CO₂e & metric tonnes), Scope 2 Electricity, Scope 3 Commuting Transit, Scope 3 Operational Waste, Avoided Emissions, and percentage delta vs baseline.
- **Interactive Visualizations:**
  - Interactive SVG Donut Contribution Chart with category tooltips and slice highlights.
  - Comparative Baseline vs Projected Decarbonization Bar Chart.
  - 12-Month Historical Emissions Area Chart benchmarked against the Campus 2030 Climate Neutrality target path.
- **Reporting Period Selector:** Instant toggle between Monthly, Quarterly, and Annual reporting modes.
- **Executive Summary Export:** One-click snapshot generation and PDF printing dialog with celebratory animations.

### 2. Animated 3D-Style Sustainable Campus Digital Twin
- **Signature Interactive Isometric Campus:**
  - Campus buildings (Academic Blocks, Research & Innovation Hub, Science Labs, Student Commons, Library, Sports Pavilion).
  - Continuously rotating micro wind turbine blades (`@keyframes spinSlow`).
  - Landscaped greenery with natural swaying trees (`@keyframes swayGently`).
  - Rooftop solar photovoltaic arrays with dynamic sunlight energy shimmering effects.
  - Animated pulsing smart microgrid conduits transporting clean energy between generation nodes and facilities.
  - Moving electric transit shuttle traversing the perimeter ring road.
  - Central resource recovery yard with color-coded multi-stream sorting and composting.
- **Building Inspection Panel:** Click any facility to inspect gross area, occupancy, Energy Use Index (EUI in kWh/m²), rooftop solar capacity, and toggle live retrofit measures (Smart HVAC, daylight dimming, freezer setpoints).
- **Comparative Facility Matrix:** Side-by-side analysis of two campus buildings to evaluate relative carbon intensities.
- **Campus Legend:** Visual explanation of all symbols, energy conduits, and color indicators.

### 3. Multimodal Emissions Calculator
- **Electricity (Scope 2):** Input metered kWh, select regional grid emission factors (India CEA v19, US EPA eGRID, UK DEFRA, EU Average, or custom factor), and configure onsite solar generation offset.
- **Transportation (Scope 3 - Category 7):** Calculate commuter mobility footprint using roundtrip distance, travel days, commuter population, and vehicle occupancy factors to prevent passenger double-counting. Supports petrol/diesel cars, EVs, motorcycles, buses, metro trains, and active walking/biking.
- **Solid Waste (Scope 3 - Category 5):** Track waste streams (Landfill, Recycled, Organic Composting, E-Waste) with live circular diversion rate tracking and documented EPA WARM v15 lifecycle factors.
- **Data Validation & Scientific Guardrails:** Automatically enforces non-negative inputs and displays exact formula derivations for every calculation.

### 4. Interactive Scenario Simulator (Core Decarbonization Engine)
- **Dynamic Policy Levers:**
  - Energy Efficiency & Smart HVAC slider (0–60%).
  - On-Site Clean Solar Share slider (0–100%).
  - Commuter Modal Shift & Transit Electrification slider (0–80%).
  - Circular Waste Diversion & Composting slider (0–90%).
- **Modular Campus Initiatives:** Click to activate discrete measures (Smart LED retrofits, 250 kWp solar carport, campus EV transit shuttles, cafeteria biodigesters).
- **Tangible Real-World Equivalencies:** Contextualizes avoided carbon into mature urban trees planted, vehicle kilometers eliminated, liters of petrol saved, and mobile phone zero-carbon charging cycles.
- **Thermodynamic Integrity:** Constrained mathematical engine ensures projected reductions never exceed physical consumption limits.

### 5. Rule-Based Intelligent Recommendations
- **Transparent, Deterministic Engine:** Operates without external paid LLM APIs or black-box hallucination.
- **Data-Driven Prioritization:** Dynamically ranks decarbonization recommendations by analyzing the campus's largest carbon driver.
- **Actionable Metadata:** Each recommendation includes actionable steps, data-driven rationale, category, quantified monthly kg CO₂e avoidance, implementation difficulty, and financial payback period.
- **One-Click Simulator Integration:** Click "Apply to Scenario Simulator" on any recommendation to automatically configure the corresponding simulator sliders and campus initiatives.

### 6. Scientific Methodology & Standards
- Fully documented mathematical formulations for all emission scopes.
- Documented citation tables listing authoritative sources (CEA India v19 2023-24, UK DEFRA 2023, US EPA eGRID2022, IPCC AR6 Guidelines).
- Explicit disclaimers clarifying simulated academic demonstration status vs physical IoT meters.

---

## 🛠️ Technology Stack

- **Frontend:** React 18 + Vite (JavaScript)
- **Styling:** Modern responsive CSS with custom design tokens, glassmorphism, and accessibility (`prefers-reduced-motion`)
- **Visuals:** Custom Isometric 2.5D SVG graphics with CSS keyframe animation systems
- **Charts:** High-performance responsive SVG chart system (Donut, Comparative Bars, 12-Month Area Trend)
- **Icons:** Lucide React
- **Celebration Effects:** Canvas-Confetti

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Installation
```bash
# Clone or navigate to the project directory
cd DSU

# Install dependencies
npm install
```

### Running Locally
```bash
# Start the Vite development server
npm run dev
```
Open your browser and navigate to `http://localhost:3000` (or the port specified by Vite).

### Production Build
```bash
# Build optimized static production bundle
npm run build

# Preview the production build locally
npm run preview
```

---

## 🧭 Hackathon Demo Journey

1. **Dashboard Overview:** Review top-level carbon metrics, category shares, and campus 2030 target path.
2. **Calculator:** Adjust monthly electricity kWh, commuter numbers, or waste streams to see real-time recalculation.
3. **Campus Digital Twin:** Explore the animated 3D campus, watch the rotating wind turbine and EV shuttle, and click on buildings to simulate retrofits.
4. **Scenario Simulator:** Move sliders and toggle campus initiatives to observe projected decarbonization and real-world tree equivalents.
5. **AI Recommendations:** Review dynamically ranked measures and click "Apply to Scenario Simulator" to immediately see the simulated impact.
6. **Methodology:** Review documented CEA/DEFRA factors and mathematical formulas.
