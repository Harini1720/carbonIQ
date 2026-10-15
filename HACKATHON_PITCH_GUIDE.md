# 🏆 CarbonIQ (PS05) — Hackathon Presentation & Judging Guide

Use this guide to deliver a winning pitch to hackathon judges.

---

## 🎯 1. The 30-Second Elevator Pitch

> *"Most carbon calculators are static forms that spit out a number with generic advice. **CarbonIQ** is an interactive Carbon Intelligence and Digital Twin Platform that bridges the gap between emissions data and real-world capital decisions. It models campus emissions across Scopes 1, 2, and 3, visualizes energy flows on an animated 3D digital twin, and allows university decision-makers to simulate the outcome of sustainability investments before spending a single dollar."*

---

## 🚀 2. The 2-Minute Demo Script for Judges

### **Step 1: The Problem (0:00 - 0:30)**
- *"University campuses and corporate parks represent mini-cities with heavy energy demands, thousands of daily commuters, and metric tonnes of waste. Facility managers struggle to turn dry spreadsheet audits into actionable roadmaps."*
- **Action:** Show the **Overview Dashboard** with the key metrics ($121.6\text{ tCO}_2e$ gross footprint) and the interactive Donut Breakdown.

### **Step 2: The Digital Twin Signature (0:30 - 1:00)**
- *"Rather than boring tables, we created an interactive digital twin of the campus."*
- **Action:** Open the **Campus Digital Twin**. Point out:
  - Continuously rotating micro-wind turbine.
  - Swaying trees.
  - Dynamic solar PV shimmer and animated microgrid conduits.
  - The electric transit shuttle cruising the ring road.
  - **Click on "Block A: Engineering"** -> Open the inspection drawer, toggle **Smart HVAC Optimization**, and point out how the avoided $kg\text{ CO}_2e$ recalculates instantly!

### **Step 3: The What-If Scenario Simulator (1:00 - 1:30)**
- *"Here is our core differentiator: the Scenario Simulator."*
- **Action:** Navigate to the **Scenario Simulator**.
  - Move the **Solar PV slider to 45%**.
  - Toggle **"Campus Electric Transit Shuttle Fleet"** and **"Zero-Waste Dining & Composting Hub"**.
  - Show the **Avoided Emissions counter** animate in real-time (`-34.8% Decarbonized`).
  - Highlight the **Tangible Equivalencies**: *"This translates to 2,140 mature trees planted or 84,000 liters of petrol saved."*

### **Step 4: AI Recommendations & Scientific Rigor (1:30 - 2:00)**
- **Action:** Navigate to **AI Recommendations**.
  - Show how the rule engine dynamically ranks recommendations based on the campus's largest emission driver (e.g. Electricity vs Commuter Transit).
  - Click **"Apply to Scenario Simulator"** to demonstrate one-click integration.
  - Show the **Methodology page**: *"Every factor is scientifically traceable to the Central Electricity Authority (CEA India v19), UK DEFRA, and IPCC AR6 models."*

---

## 💡 3. Key Differentiators to Emphasize

| Feature | Typical Student Projects | CarbonIQ (PS05) |
|---|---|---|
| **Architecture** | Hardcoded mockups or simple forms | Full-stack reactive state with centralized mathematical engine |
| **Visuals** | Static images or basic CSS cards | Animated 2.5D isometric SVG campus with live microgrid flows |
| **Calculations** | Arbitrary formulas without citations | Documented factors (CEA India v19, EPA eGRID, IPCC) with double-counting safeguards |
| **Decarbonization** | Generic tips ("turn off lights") | Interactive scenario simulator with discrete ROI, payback & tangible tree equivalents |
| **Recommendations** | Fake/canned ChatGPT mock text | Deterministic, explainable rule engine that dynamically writes parameters to the simulator |

---

## ❓ 4. Judge Q&A Preparation & Winning Answers

### Q1: *"Where does your data come from? Are these real sensors?"*
> **Answer:** *"For this prototype, the numbers represent a calibrated academic demonstration baseline (PS05). However, unlike toy apps that invent numbers, every emission factor in CarbonIQ is authentic—sourced directly from the Central Electricity Authority (CEA India Baseline Database v19, 0.82 kg CO₂e/kWh), US EPA eGRID, and IPCC AR6. The data model is modular, so physical IoT meters or BACnet/MQTT building automation feeds can be plugged directly into our state engine."*

### Q2: *"How do you handle double-counting in commuter transportation?"*
> **Answer:** *"In our transport calculation module, vehicle occupancy is explicitly factored in. For private vehicles, total passenger-kilometers are divided by the carpool occupancy factor before applying the fuel conversion factor. This ensures carpoolers share a single vehicle's tailpipe footprint rather than multiplying it."*

### Q3: *"Is there an actual AI model powering the recommendations?"*
> **Answer:** *"We intentionally built an explainable, deterministic rule-based intelligent engine for this hackathon rather than relying on black-box LLM APIs that could hallucinate or fail offline. The engine evaluates the marginal carbon intensity of the user's specific campus profile, sorts interventions by carbon abatement cost efficiency, and directly updates the simulator levers."*

### Q4: *"Can the simulation results go negative or exceed 100% savings?"*
> **Answer:** *"No. We implemented thermodynamic conservation constraints in `calculations.js`. Scenario reductions are capped so that cumulative mitigation can never mathematically exceed 100% of the active baseline."*
