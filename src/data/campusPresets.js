/**
 * Campus Profile Presets
 * Pre-configured realistic baselines for hackathon exploration and testing.
 */

export const CAMPUS_PRESETS = [
  {
    id: 'dsu_innovation',
    name: 'DSU Main Innovation Campus',
    category: 'University Campus',
    description: 'Autonomous engineering & science campus with 5,400 students, 6 key buildings, and active transit corridors.',
    period: 'monthly',
    inputs: {
      electricityKwh: 147500,
      gridFactorId: 'cea_india',
      customGridFactor: 0.82,
      solarOffsetPercent: 18.5, // ~27,200 kWh generated onsite

      // Transport
      dailyCommuteKm: 14.2,
      commuteDays: 22,
      commutersCount: 3800,
      selectedTransportMode: 'bus',
      carpoolingOccupancy: 1.8,

      // Waste (kg/month)
      wasteBreakdown: {
        landfill: 4800,
        recycled: 2600,
        composted: 1400,
        ewaste: 120
      }
    },
    meta: {
      grossAreaSqM: 60600,
      studentCount: 5400,
      facultyCount: 380,
      baselineYear: '2023-2024'
    }
  },
  {
    id: 'greentech_park',
    name: 'GreenTech Research Park',
    category: 'Corporate / R&D Campus',
    description: 'Corporate tech park with cleanrooms, data centers, high solar adoption, and corporate EV fleet.',
    period: 'monthly',
    inputs: {
      electricityKwh: 225000,
      gridFactorId: 'cea_india',
      customGridFactor: 0.82,
      solarOffsetPercent: 35.0, // 78,750 kWh solar

      dailyCommuteKm: 22.0,
      commuteDays: 20,
      commutersCount: 2200,
      selectedTransportMode: 'car_petrol',
      carpoolingOccupancy: 2.2,

      wasteBreakdown: {
        landfill: 2100,
        recycled: 4500,
        composted: 1800,
        ewaste: 650
      }
    },
    meta: {
      grossAreaSqM: 45000,
      studentCount: 0,
      facultyCount: 2200,
      baselineYear: '2023-2024'
    }
  },
  {
    id: 'urban_academy',
    name: 'Urban High School & Academy',
    category: 'Secondary Education',
    description: 'Compact high-density campus with minimal labs, walking/biking transit, and municipal composting.',
    period: 'monthly',
    inputs: {
      electricityKwh: 42000,
      gridFactorId: 'cea_india',
      customGridFactor: 0.82,
      solarOffsetPercent: 12.0,

      dailyCommuteKm: 6.5,
      commuteDays: 22,
      commutersCount: 1600,
      selectedTransportMode: 'bus',
      carpoolingOccupancy: 1.0,

      wasteBreakdown: {
        landfill: 1600,
        recycled: 1200,
        composted: 950,
        ewaste: 35
      }
    },
    meta: {
      grossAreaSqM: 18000,
      studentCount: 1500,
      facultyCount: 120,
      baselineYear: '2023-2024'
    }
  }
];
