/**
 * CarbonIQ Emission Factors Database
 * Documented emission factors from authoritative environmental agencies.
 * Units: kg CO2e per activity unit.
 */

export const GRID_EMISSION_REGIONS = [
  {
    id: 'cea_india',
    name: 'India (CEA National Baseline v19)',
    factor: 0.82,
    unit: 'kg CO₂e / kWh',
    source: 'Central Electricity Authority (CEA) CO2 Baseline Database v19, 2023-2024',
    scope: 'Scope 2 (Purchased Electricity)',
    notes: 'Weighted average emission factor for Indian National Grid'
  },
  {
    id: 'us_egrid',
    name: 'United States (US EPA eGRID Average)',
    factor: 0.386,
    unit: 'kg CO₂e / kWh',
    source: 'US Environmental Protection Agency (EPA) eGRID2022 summary tables',
    scope: 'Scope 2 (Purchased Electricity)',
    notes: 'US national annual average output emission rate'
  },
  {
    id: 'uk_defra',
    name: 'United Kingdom (DEFRA / DESNZ 2023)',
    factor: 0.207,
    unit: 'kg CO₂e / kWh',
    source: 'UK Department for Energy Security and Net Zero GHG Conversion Factors',
    scope: 'Scope 2 (Purchased Electricity)',
    notes: 'UK electricity grid generation factor'
  },
  {
    id: 'eu_average',
    name: 'European Union (EEA Average)',
    factor: 0.251,
    unit: 'kg CO₂e / kWh',
    source: 'European Environment Agency (EEA) Greenhouse Gas Emission Intensity',
    scope: 'Scope 2 (Purchased Electricity)',
    notes: 'EU-27 electricity generation greenhouse gas intensity'
  },
  {
    id: 'renewable_certified',
    name: '100% Certified On-Site Solar / PPA',
    factor: 0.0,
    unit: 'kg CO₂e / kWh',
    source: 'GHG Protocol Scope 2 Market-based Method',
    scope: 'Scope 2 (Renewable Energy Certificate / Direct PPA)',
    notes: 'Zero direct grid operational emissions'
  }
];

export const TRANSPORT_MODES = [
  {
    id: 'car_petrol',
    name: 'Car (Petrol / Gasoline)',
    factorPerKm: 0.170, // per vehicle-km
    isVehicleBased: true,
    typicalOccupancy: 1,
    unit: 'kg CO₂e / vehicle-km',
    source: 'UK DEFRA GHG Conversion Factors & IPCC AR6 Guidelines',
    category: 'Private Vehicle',
    icon: 'Car'
  },
  {
    id: 'car_diesel',
    name: 'Car (Diesel)',
    factorPerKm: 0.171,
    isVehicleBased: true,
    typicalOccupancy: 1,
    unit: 'kg CO₂e / vehicle-km',
    source: 'UK DEFRA GHG Conversion Factors',
    category: 'Private Vehicle',
    icon: 'Car'
  },
  {
    id: 'ev',
    name: 'Electric Vehicle (EV - Grid Charged)',
    factorPerKm: 0.053,
    isVehicleBased: true,
    typicalOccupancy: 1,
    unit: 'kg CO₂e / vehicle-km',
    source: 'International Council on Clean Transportation (ICCT) Life-Cycle Report',
    category: 'Clean Vehicle',
    icon: 'Zap'
  },
  {
    id: 'motorcycle',
    name: 'Motorcycle / Scooter (Petrol)',
    factorPerKm: 0.103,
    isVehicleBased: true,
    typicalOccupancy: 1,
    unit: 'kg CO₂e / vehicle-km',
    source: 'UK DEFRA GHG Conversion Factors',
    category: 'Two-Wheeler',
    icon: 'Bike'
  },
  {
    id: 'bus',
    name: 'Campus / Municipal Bus',
    factorPerKm: 0.089, // per passenger-km
    isVehicleBased: false,
    typicalOccupancy: 1,
    unit: 'kg CO₂e / passenger-km',
    source: 'IPCC AR6 Working Group III / National Transit Database',
    category: 'Public Transit',
    icon: 'Bus'
  },
  {
    id: 'train',
    name: 'Metro / Suburban Electric Train',
    factorPerKm: 0.035, // per passenger-km
    isVehicleBased: false,
    typicalOccupancy: 1,
    unit: 'kg CO₂e / passenger-km',
    source: 'International Union of Railways (UIC) Carbon Footprint Survey',
    category: 'Public Transit',
    icon: 'Train'
  },
  {
    id: 'bicycle_walk',
    name: 'Bicycle / Walking (Active Mobility)',
    factorPerKm: 0.0,
    isVehicleBased: false,
    typicalOccupancy: 1,
    unit: 'kg CO₂e / km',
    source: 'Zero Operational Tailpipe Emissions',
    category: 'Active Travel',
    icon: 'Footprints'
  }
];

export const WASTE_STREAMS = [
  {
    id: 'landfill',
    name: 'Landfill Disposal (Mixed Waste)',
    factorPerKg: 0.587,
    unit: 'kg CO₂e / kg waste',
    source: 'US EPA Waste Reduction Model (WARM) v15 & IPCC Municipal Solid Waste Model',
    notes: 'Accounts for anaerobic methane generation in uncaptured landfills',
    treatment: 'Disposal'
  },
  {
    id: 'recycled',
    name: 'Recycled Materials (Paper, Plastic, Metal)',
    factorPerKg: 0.021,
    unit: 'kg CO₂e / kg waste',
    source: 'WRAP UK & EPA WARM Material Life Cycle Assessment',
    notes: 'Emissions from collection and MRF sorting; net virgin material savings',
    treatment: 'Diversion'
  },
  {
    id: 'composted',
    name: 'Organic Composting (Food & Horticultural)',
    factorPerKg: 0.010,
    unit: 'kg CO₂e / kg waste',
    source: 'IPCC Guidelines for National GHG Inventories - Biological Treatment of Waste',
    notes: 'Aerobic composting emissions; prevents anaerobic landfill methane',
    treatment: 'Diversion'
  },
  {
    id: 'ewaste',
    name: 'Certified E-Waste Recycling',
    factorPerKg: 0.045,
    unit: 'kg CO₂e / kg waste',
    source: 'StEP Initiative / UN University E-Waste Monitor',
    notes: 'Controlled dismantling and critical mineral recovery',
    treatment: 'Diversion'
  }
];

/**
 * Equivalencies for contextualizing carbon savings
 * Derived from EPA Greenhouse Gas Equivalencies Calculator
 */
export const EQUIVALENCY_FACTORS = {
  treeAbsorptionPerYearKg: 21.77, // 1 mature tree absorbs ~21.77 kg CO2/year
  passengerCarKmKg: 0.170, // 1 km driven by typical passenger vehicle
  gasolineLitersKg: 2.31, // 1 liter of petrol combusted emits ~2.31 kg CO2
  smartphoneChargesKg: 0.00822 // charging 1 smartphone emits ~8.22 grams CO2
};
