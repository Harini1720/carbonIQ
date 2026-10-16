import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { GRID_EMISSION_REGIONS, TRANSPORT_MODES, WASTE_STREAMS } from '../data/emissionFactors';
import {
  calculateElectricityEmissions,
  calculateTransportEmissions,
  calculateWasteEmissions,
  calculateTotalFootprint,
  calculateScenarioResults,
  calculateEquivalents
} from '../utils/calculations';

const CarbonContext = createContext(null);
const SUPPORTED_THEMES = new Set(['light', 'ocean', 'lavender']);

const EMPTY_INPUTS = {
  electricityKwh: '',
  gridFactorId: '',
  customGridFactor: '',
  solarOffsetPercent: '',
  dailyCommuteKm: '',
  commuteDays: '',
  commutersCount: '',
  selectedTransportMode: '',
  carpoolingOccupancy: '',
  wasteBreakdown: {
    landfill: '',
    recycled: '',
    composted: '',
    ewaste: ''
  }
};

export function CarbonProvider({ children }) {
  // Theme state: 'light' (default), 'ocean', or 'lavender'.
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('carboniq_theme');
      return SUPPORTED_THEMES.has(savedTheme) ? savedTheme : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('carboniq_theme', theme);
    } catch {}
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = `theme-${theme}`;
  }, [theme]);

  // Reporting period multiplier: monthly (1), quarterly (3), annual (12)
  const [reportingPeriod, setReportingPeriod] = useState('monthly');
  const periodMultiplier = useMemo(() => {
    switch (reportingPeriod) {
      case 'quarterly': return 3;
      case 'annual': return 12;
      default: return 1;
    }
  }, [reportingPeriod]);

  const [inputs, setInputs] = useState(EMPTY_INPUTS);

  const [scenarioLevers, setScenarioLevers] = useState({
    electricityReductionPct: 0,
    solarSharePct: 0,
    transportShiftPct: 0,
    wasteDiversionPct: 0
  });

  // Calculate Grid Factor
  const currentGridFactor = useMemo(() => {
    if (inputs.gridFactorId === 'custom') {
      return Number(inputs.customGridFactor) || 0;
    }
    const region = GRID_EMISSION_REGIONS.find(r => r.id === inputs.gridFactorId);
    return region ? region.factor : 0;
  }, [inputs.gridFactorId, inputs.customGridFactor]);

  // Calculate Transport Mode Factor
  const currentTransportMode = useMemo(() => {
    return TRANSPORT_MODES.find(m => m.id === inputs.selectedTransportMode) || null;
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
      factorPerKm: currentTransportMode?.factorPerKm || 0,
      occupancy: inputs.carpoolingOccupancy,
      isVehicleBased: currentTransportMode?.isVehicleBased || false,
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

  const dataCompleteness = useMemo(() => ({
    electricity: inputs.electricityKwh !== '' && inputs.solarOffsetPercent !== '' && Boolean(inputs.gridFactorId)
      && (inputs.gridFactorId !== 'custom' || inputs.customGridFactor !== ''),
    transport: inputs.dailyCommuteKm !== '' && inputs.commuteDays !== ''
      && inputs.commutersCount !== '' && Boolean(inputs.selectedTransportMode)
      && (!currentTransportMode?.isVehicleBased || inputs.carpoolingOccupancy !== ''),
    waste: Object.values(inputs.wasteBreakdown).every(value => value !== '')
  }), [inputs, currentTransportMode]);
  const hasCompleteFootprint = Object.values(dataCompleteness).every(Boolean);

  const updateInputs = (partial) => {
    setInputs(prev => ({
      ...prev,
      ...partial
    }));
  };

  const resetInputs = () => {
    setInputs(EMPTY_INPUTS);
  };

  const updateScenarioLevers = (partial) => {
    setScenarioLevers(prev => ({
      ...prev,
      ...partial
    }));
  };

  const resetScenario = () => {
    setScenarioLevers({
      electricityReductionPct: 0,
      solarSharePct: 0,
      transportShiftPct: 0,
      wasteDiversionPct: 0
    });
  };

  const value = {
    reportingPeriod,
    setReportingPeriod,
    periodMultiplier,
    inputs,
    updateInputs,
    resetInputs,
    currentGridFactor,
    currentTransportMode,
    electricityEmissions,
    transportEmissions,
    wasteEmissions,
    totalFootprint,
    dataCompleteness,
    hasCompleteFootprint,
    scenarioLevers,
    updateScenarioLevers,
    resetScenario,
    scenarioResults,
    equivalents,
    // Theme
    theme,
    setTheme: nextTheme => {
      if (SUPPORTED_THEMES.has(nextTheme)) setTheme(nextTheme);
    }
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
