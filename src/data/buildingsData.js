/**
 * Campus Buildings Dataset (Simulated Demonstration Model)
 * Detailed structural, energetic, and carbon profiles for the digital twin.
 */

export const CAMPUS_BUILDINGS = [
  {
    id: 'bldg-eng',
    name: 'Block A: Engineering & Tech',
    type: 'Academic & Laboratories',
    areaSqM: 14500,
    floors: 5,
    occupants: 1400,
    monthlyKwh: 38500,
    gridFactor: 0.82,
    solarCapacityKwp: 60,
    solarMonthlyKwh: 7200,
    wasteKgMonthly: 1850,
    commutersDaily: 950,
    intensityStatus: 'high_intensity', // high_intensity, moderate, efficient
    euiKwhPerSqM: 31.8,
    position: { x: 190, y: 155, width: 140, height: 110 },
    color: '#059669',
    description: 'High-density computational clusters, robotics labs, and multi-tier lecture halls.',
    currentMeasures: ['Occupancy sensors on Floor 1 & 2', '60 kWp Rooftop Solar PV'],
    availableMeasures: [
      {
        id: 'eng-m1',
        title: 'Smart HVAC Variable Air Volume (VAV) Optimization',
        description: 'Dynamic temperature setback with AI occupancy integration.',
        kwhSavingsMonthly: 6200,
        reductionPct: 16.1,
        paybackYears: 1.4,
        costEstimate: '$8,500'
      },
      {
        id: 'eng-m2',
        title: 'Complete LED & Daylight Harvesting Retrofit',
        description: 'Upgrade remaining T5 fluorescent tubes to daylight-dimming LEDs.',
        kwhSavingsMonthly: 3400,
        reductionPct: 8.8,
        paybackYears: 0.9,
        costEstimate: '$4,200'
      },
      {
        id: 'eng-m3',
        title: 'Solar PV Expansion (+50 kWp)',
        description: 'Utilize unused shaded terrace space for bifacial solar panels.',
        kwhSavingsMonthly: 6000,
        reductionPct: 15.6,
        paybackYears: 3.2,
        costEstimate: '$19,000'
      }
    ]
  },
  {
    id: 'bldg-research',
    name: 'Research & Innovation Hub',
    type: 'High-Tech Research & Cleanrooms',
    areaSqM: 11200,
    floors: 4,
    occupants: 650,
    monthlyKwh: 31000,
    gridFactor: 0.82,
    solarCapacityKwp: 40,
    solarMonthlyKwh: 4800,
    wasteKgMonthly: 1100,
    commutersDaily: 420,
    intensityStatus: 'moderate',
    euiKwhPerSqM: 33.2,
    position: { x: 370, y: 120, width: 130, height: 95 },
    color: '#10b981',
    description: 'Advanced material science facilities, supercomputer node, and prototyping workshops.',
    currentMeasures: ['Heat recovery chiller system', '40 kWp Solar Carport'],
    availableMeasures: [
      {
        id: 'res-m1',
        title: 'Server Virtualization & Green Computing',
        description: 'Consolidate campus departmental compute servers into high-efficiency racks.',
        kwhSavingsMonthly: 5500,
        reductionPct: 17.7,
        paybackYears: 1.1,
        costEstimate: '$6,000'
      },
      {
        id: 'res-m2',
        title: 'Fume Hood Auto-Sash Closure Regulators',
        description: 'Prevent conditioned air loss when chemistry fume hoods are unattended.',
        kwhSavingsMonthly: 3800,
        reductionPct: 12.3,
        paybackYears: 1.8,
        costEstimate: '$7,500'
      }
    ]
  },
  {
    id: 'bldg-library',
    name: 'Central Library & Admin Tower',
    type: 'Study, Archives & Administration',
    areaSqM: 9800,
    floors: 6,
    occupants: 800,
    monthlyKwh: 16500,
    gridFactor: 0.82,
    solarCapacityKwp: 35,
    solarMonthlyKwh: 4200,
    wasteKgMonthly: 920,
    commutersDaily: 510,
    intensityStatus: 'efficient',
    euiKwhPerSqM: 20.2,
    position: { x: 530, y: 170, width: 120, height: 110 },
    color: '#047857',
    description: 'Digitized archives, silent reading atriums, and campus executive offices.',
    currentMeasures: ['Double-glazed thermal windows', '35 kWp Rooftop Solar array', 'Greywater flush'],
    availableMeasures: [
      {
        id: 'lib-m1',
        title: 'Smart Micro-Zoned Lighting in Stacks',
        description: 'Passive infrared sensors dimming lighting in unoccupied book stacks.',
        kwhSavingsMonthly: 2100,
        reductionPct: 12.7,
        paybackYears: 0.8,
        costEstimate: '$2,800'
      },
      {
        id: 'lib-m2',
        title: 'Cool Roof Reflective Coating',
        description: 'High-albedo ceramic membrane reducing roof heat gain by 30%.',
        kwhSavingsMonthly: 1900,
        reductionPct: 11.5,
        paybackYears: 2.1,
        costEstimate: '$5,100'
      }
    ]
  },
  {
    id: 'bldg-student',
    name: 'Student Commons & Dining Pavilion',
    type: 'Dining, Recreation & Retail',
    areaSqM: 8600,
    floors: 3,
    occupants: 1900,
    monthlyKwh: 24200,
    gridFactor: 0.82,
    solarCapacityKwp: 25,
    solarMonthlyKwh: 3000,
    wasteKgMonthly: 3400, // high organic waste
    commutersDaily: 1100,
    intensityStatus: 'high_intensity',
    euiKwhPerSqM: 33.8,
    position: { x: 230, y: 285, width: 135, height: 95 },
    color: '#14b8a6',
    description: 'Central cafeteria, student union, convenience stalls, and event auditorium.',
    currentMeasures: ['Grease-trap recovery system', '25 kWp Solar canopy'],
    availableMeasures: [
      {
        id: 'stu-m1',
        title: 'On-site Commercial Biodigester for Food Scraps',
        description: 'Converts 1.8 tonnes/month of organic dining waste into biogas and fertilizer.',
        kwhSavingsMonthly: 1800,
        reductionPct: 7.4,
        paybackYears: 2.4,
        costEstimate: '$12,000'
      },
      {
        id: 'stu-m2',
        title: 'Smart Cold-Storage & Kitchen Demand Management',
        description: 'Nighttime thermal storage defrost cycle and variable kitchen exhaust hoods.',
        kwhSavingsMonthly: 4100,
        reductionPct: 16.9,
        paybackYears: 1.5,
        costEstimate: '$6,800'
      }
    ]
  },
  {
    id: 'bldg-sports',
    name: 'Sports Complex & Aquatic Pavilion',
    type: 'Recreation & Gymnasium',
    areaSqM: 7400,
    floors: 2,
    occupants: 550,
    monthlyKwh: 14800,
    gridFactor: 0.82,
    solarCapacityKwp: 45,
    solarMonthlyKwh: 5400,
    wasteKgMonthly: 650,
    commutersDaily: 340,
    intensityStatus: 'efficient',
    euiKwhPerSqM: 24.0,
    position: { x: 420, y: 280, width: 125, height: 85 },
    color: '#0d9488',
    description: 'Indoor multi-court arena, heated pool, fitness suites, and locker rooms.',
    currentMeasures: ['Solar thermal water preheating', '45 kWp Rooftop Solar array'],
    availableMeasures: [
      {
        id: 'spo-m1',
        title: 'High-Efficiency Pool Pump Inverters',
        description: 'Variable frequency drives modulating water filtration based on bathing load.',
        kwhSavingsMonthly: 2800,
        reductionPct: 18.9,
        paybackYears: 1.2,
        costEstimate: '$3,900'
      },
      {
        id: 'spo-m2',
        title: 'Smart Arena Floodlight LED Conversion',
        description: 'Precision beam LED arena fixtures with automatic sport preset dimming.',
        kwhSavingsMonthly: 2200,
        reductionPct: 14.8,
        paybackYears: 1.6,
        costEstimate: '$4,800'
      }
    ]
  },
  {
    id: 'bldg-biotech',
    name: 'Biotech & Life Sciences Wing',
    type: 'Specialized Laboratories',
    areaSqM: 9100,
    floors: 4,
    occupants: 580,
    monthlyKwh: 22500,
    gridFactor: 0.82,
    solarCapacityKwp: 30,
    solarMonthlyKwh: 3600,
    wasteKgMonthly: 980,
    commutersDaily: 390,
    intensityStatus: 'moderate',
    euiKwhPerSqM: 29.7,
    position: { x: 575, y: 295, width: 115, height: 85 },
    color: '#15803d',
    description: 'Cell culture chambers, ultra-low temperature freezers (-80°C), and botanical greenhouse.',
    currentMeasures: ['30 kWp Solar array', 'Zoned autoclaves'],
    availableMeasures: [
      {
        id: 'bio-m1',
        title: 'Ultra-Low Freezer Setpoint Stewardship (-80°C to -70°C)',
        description: 'Global standard safe warmup reducing freezer compressor energy by 30%.',
        kwhSavingsMonthly: 3100,
        reductionPct: 13.8,
        paybackYears: 0.2,
        costEstimate: '$600'
      },
      {
        id: 'bio-m2',
        title: 'Greenhouse Automated Shading & Evaporative Cooling',
        description: 'Microcontroller motorized solar screens regulating botanical temperatures.',
        kwhSavingsMonthly: 1900,
        reductionPct: 8.4,
        paybackYears: 2.2,
        costEstimate: '$5,500'
      }
    ]
  }
];

export const CAMPUS_FACILITIES = [
  {
    id: 'wind-turbine',
    name: 'Micro Wind Turbine Alpha',
    type: 'Renewable Generation',
    capacityKw: 25,
    monthlyKwh: 3200,
    position: { x: 80, y: 130 }
  },
  {
    id: 'solar-farm',
    name: 'Canopy Solar Array 1 & 2',
    type: 'Rooftop & Carport PV',
    capacityKw: 235,
    monthlyKwh: 28200,
    position: { x: 260, y: 80 }
  },
  {
    id: 'ev-hub',
    name: 'EV Transit & Charging Hub',
    type: 'Clean Transportation',
    chargers: 8,
    shuttlesOperating: 2,
    position: { x: 120, y: 310 }
  },
  {
    id: 'waste-station',
    name: 'Central Resource Recovery & Composting Yard',
    type: 'Circular Waste',
    compostTonsMonth: 4.5,
    diversionRate: 64,
    position: { x: 710, y: 220 }
  }
];
