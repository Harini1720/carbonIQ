import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { CAMPUS_PRESETS } from '../data/campusPresets';
import { GRID_EMISSION_REGIONS, TRANSPORT_MODES, WASTE_STREAMS } from '../data/emissionFactors';
import { CAMPUS_BUILDINGS } from '../data/buildingsData';
import {
  calculateElectricityEmissions,
  calculateTransportEmissions,
  calculateWasteEmissions,
  calculateTotalFootprint,
  calculateScenarioResults,
  calculateEquivalents
} from '../utils/calculations';

const CarbonContext = createContext(null);

export function CarbonProvider({ children }) {
  // Theme state: 'forest' (default), 'light', 'cyber'
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('carboniq_theme') || 'forest';
    } catch {
      return 'forest';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('carboniq_theme', theme);
    } catch {}
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = `theme-${theme}`;
  }, [theme]);

  // Current active preset
  const [activePresetId, setActivePresetId] = useState('dsu_innovation');
  const activePreset = useMemo(
    () => CAMPUS_PRESETS.find(p => p.id === activePresetId) || CAMPUS_PRESETS[0],
    [activePresetId]
  );

  // Reporting period multiplier: monthly (1), quarterly (3), annual (12)
  const [reportingPeriod, setReportingPeriod] = useState('monthly');
  const periodMultiplier = useMemo(() => {
    switch (reportingPeriod) {
      case 'quarterly': return 3;
      case 'annual': return 12;
      default: return 1;
    }
  }, [reportingPeriod]);

  // Form Inputs (Base monthly values)
  const [inputs, setInputs] = useState(activePreset.inputs);

  // Digital Twin state
  const [selectedBuildingId, setSelectedBuildingId] = useState('bldg-eng');
  const [comparisonBuildingIds, setComparisonBuildingIds] = useState(['bldg-eng', 'bldg-research']);
  const [activeBuildingRetrofits, setActiveBuildingRetrofits] = useState({
    'bldg-eng': ['eng-m1'],
    'bldg-student': ['stu-m1']
  });

  // Simulator levers
  const [scenarioLevers, setScenarioLevers] = useState({
    electricityReductionPct: 20,
    solarSharePct: 25,
    transportShiftPct: 30,
    wasteDiversionPct: 40,
    activeMeasures: [
      { id: 'm-led', name: 'Smart LED & Occupancy Sensors', category: 'electricity', reductionPct: 8 },
      { id: 'm-ev-shuttle', name: 'Campus Electric Shuttle Fleet', category: 'transport', reductionPct: 15 },
      { id: 'm-compost', name: 'Zero-Waste Dining & Composting Hub', category: 'waste', reductionPct: 25 }
    ]
  });

  // Calculate Grid Factor
  const currentGridFactor = useMemo(() => {
    if (inputs.gridFactorId === 'custom') {
      return Number(inputs.customGridFactor) || 0.82;
    }
    const region = GRID_EMISSION_REGIONS.find(r => r.id === inputs.gridFactorId);
    return region ? region.factor : 0.82;
  }, [inputs.gridFactorId, inputs.customGridFactor]);

  // Calculate Transport Mode Factor
  const currentTransportMode = useMemo(() => {
    return TRANSPORT_MODES.find(m => m.id === inputs.selectedTransportMode) || TRANSPORT_MODES[0];
  }, [inputs.selectedTransportMode]);

  // 1. Electricity Emissions (period-adjusted)
  const electricityEmissions = useMemo(() => {
    const raw = calculateElectricityEmissions(
      inputs.electricityKwh * periodMultiplier,
      currentGridFactor,
      inputs.solarOffsetPercent
    );
    return raw;
  }, [inputs.electricityKwh, periodMultiplier, currentGridFactor, inputs.solarOffsetPercent]);

  // 2. Transport Emissions (period-adjusted)
  const transportEmissions = useMemo(() => {
    const raw = calculateTransportEmissions({
      dailyKm: inputs.dailyCommuteKm,
      daysPerMonth: inputs.commuteDays * periodMultiplier,
      factorPerKm: currentTransportMode.factorPerKm,
      occupancy: inputs.carpoolingOccupancy,
      isVehicleBased: currentTransportMode.isVehicleBased,
      commutersCount: inputs.commutersCount
    });
    return raw;
  }, [
    inputs.dailyCommuteKm,
    inputs.commuteDays,
    periodMultiplier,
    currentTransportMode,
    inputs.carpoolingOccupancy,
    inputs.commutersCount
  ]);

  // 3. Waste Emissions (period-adjusted)
  const wasteEmissions = useMemo(() => {
    const periodAdjustedStreams = {};
    Object.keys(inputs.wasteBreakdown).forEach(k => {
      periodAdjustedStreams[k] = (inputs.wasteBreakdown[k] || 0) * periodMultiplier;
    });
    return calculateWasteEmissions(periodAdjustedStreams, WASTE_STREAMS);
  }, [inputs.wasteBreakdown, periodMultiplier]);

  // 4. Combined Baseline Footprint
  const totalFootprint = useMemo(() => {
    return calculateTotalFootprint({
      electricityNetKg: electricityEmissions.netEmissions,
      transportNetKg: transportEmissions.emissionsKg,
      wasteNetKg: wasteEmissions.totalEmissionsKg
    });
  }, [electricityEmissions.netEmissions, transportEmissions.emissionsKg, wasteEmissions.totalEmissionsKg]);

  // 5. Scenario Results
  const scenarioResults = useMemo(() => {
    return calculateScenarioResults(
      {
        electricity: electricityEmissions.netEmissions,
        transport: transportEmissions.emissionsKg,
        waste: wasteEmissions.totalEmissionsKg
      },
      scenarioLevers
    );
  }, [electricityEmissions.netEmissions, transportEmissions.emissionsKg, wasteEmissions.totalEmissionsKg, scenarioLevers]);

  // 6. Tangible Equivalents
  const equivalents = useMemo(() => {
    return calculateEquivalents(scenarioResults.avoidedTotalKg);
  }, [scenarioResults.avoidedTotalKg]);

  // Actions
  const switchPreset = (presetId) => {
    const p = CAMPUS_PRESETS.find(item => item.id === presetId);
    if (p) {
      setActivePresetId(presetId);
      setInputs(p.inputs);
    }
  };

  const updateInputs = (partial) => {
    setInputs(prev => ({
      ...prev,
      ...partial
    }));
  };

  const resetToPreset = () => {
    setInputs(activePreset.inputs);
  };

  const updateScenarioLevers = (partial) => {
    setScenarioLevers(prev => ({
      ...prev,
      ...partial
    }));
  };

  const toggleScenarioMeasure = (measure) => {
    setScenarioLevers(prev => {
      const exists = prev.activeMeasures.some(m => m.id === measure.id);
      return {
        ...prev,
        activeMeasures: exists
          ? prev.activeMeasures.filter(m => m.id !== measure.id)
          : [...prev.activeMeasures, measure]
      };
    });
  };

  const resetScenario = () => {
    setScenarioLevers({
      electricityReductionPct: 0,
      solarSharePct: 0,
      transportShiftPct: 0,
      wasteDiversionPct: 0,
      activeMeasures: []
    });
  };

  const toggleBuildingRetrofit = (buildingId, measureId) => {
    setActiveBuildingRetrofits(prev => {
      const currentList = prev[buildingId] || [];
      const updated = currentList.includes(measureId)
        ? currentList.filter(id => id !== measureId)
        : [...currentList, measureId];
      return { ...prev, [buildingId]: updated };
    });
  };

  const applyRecommendationToScenario = (rec) => {
    if (!rec) return;
    setScenarioLevers(prev => {
      const updated = { ...prev };
      if (rec.category === 'electricity') {
        updated.electricityReductionPct = Math.min(60, Math.max(updated.electricityReductionPct, rec.recommendedLeverVal || 25));
      } else if (rec.category === 'transport') {
        updated.transportShiftPct = Math.min(80, Math.max(updated.transportShiftPct, rec.recommendedLeverVal || 35));
      } else if (rec.category === 'waste') {
        updated.wasteDiversionPct = Math.min(90, Math.max(updated.wasteDiversionPct, rec.recommendedLeverVal || 50));
      } else if (rec.category === 'solar') {
        updated.solarSharePct = Math.min(100, Math.max(updated.solarSharePct, rec.recommendedLeverVal || 40));
      }

      if (rec.associatedMeasure && !prev.activeMeasures.some(m => m.id === rec.associatedMeasure.id)) {
        updated.activeMeasures = [...prev.activeMeasures, rec.associatedMeasure];
      }
      return updated;
    });
  };

  const value = {
    activePreset,
    activePresetId,
    switchPreset,
    reportingPeriod,
    setReportingPeriod,
    periodMultiplier,
    inputs,
    updateInputs,
    resetToPreset,
    currentGridFactor,
    currentTransportMode,
    electricityEmissions,
    transportEmissions,
    wasteEmissions,
    totalFootprint,
    scenarioLevers,
    updateScenarioLevers,
    toggleScenarioMeasure,
    resetScenario,
    scenarioResults,
    equivalents,
    // Digital Twin
    selectedBuildingId,
    setSelectedBuildingId,
    comparisonBuildingIds,
    setComparisonBuildingIds,
    activeBuildingRetrofits,
    toggleBuildingRetrofit,
    applyRecommendationToScenario,
    allBuildings: CAMPUS_BUILDINGS,
    // Theme
    theme,
    setTheme
  };

  return (
    <CarbonContext.Provider value={value}>
      {children}
    </CarbonContext.Provider>
  );
}

export function useCarbon() {
  const context = useContext(CarbonContext);
  if (!context) {
    throw new Error('useCarbon must be used within a CarbonProvider');
  }
  return context;
}
