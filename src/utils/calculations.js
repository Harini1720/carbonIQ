/**
 * CarbonIQ Centralized Calculation Engine
 * Ensures 100% mathematical consistency across:
 * - Dashboard Overview
 * - Emissions Calculator
 * - Interactive Campus Digital Twin
 * - Scenario Simulator
 * - AI Recommendations
 */

import { EQUIVALENCY_FACTORS } from '../data/emissionFactors';

/**
 * Calculates electricity carbon emissions.
 * Formula: Net Grid Consumption (kWh) * Emission Factor (kg CO2e/kWh)
 *
 * @param {number} consumptionKwh - Total monthly electricity in kWh
 * @param {number} emissionFactor - Grid emission factor (kg CO2e/kWh)
 * @param {number} solarOffsetPercent - Onsite solar or green power offset (0 to 100%)
 * @returns {object} { grossEmissions, avoidedBySolar, netEmissions, netKwh }
 */
export function calculateElectricityEmissions(
  consumptionKwh = 0,
  emissionFactor = 0.82,
  solarOffsetPercent = 0
) {
  const safeKwh = Math.max(0, Number(consumptionKwh) || 0);
  const safeFactor = Math.max(0, Number(emissionFactor) || 0);
  const safeOffset = Math.min(100, Math.max(0, Number(solarOffsetPercent) || 0));

  const grossEmissions = safeKwh * safeFactor;
  const avoidedKwh = safeKwh * (safeOffset / 100);
  const avoidedBySolar = avoidedKwh * safeFactor;
  const netKwh = safeKwh - avoidedKwh;
  const netEmissions = netKwh * safeFactor;

  return {
    grossEmissions,
    avoidedBySolar,
    netEmissions: Math.max(0, netEmissions),
    netKwh: Math.max(0, netKwh),
    solarKwh: avoidedKwh
  };
}

/**
 * Calculates transportation carbon emissions.
 * Formula for vehicle-based (car/motorcycle): (Daily Km * Days * (Commuters / Occupancy)) * Factor
 * Formula for public/active (bus/train/walk): (Daily Km * Days * Commuters) * Factor
 *
 * @param {number} dailyKm - Average roundtrip distance in km
 * @param {number} daysPerMonth - Number of travel days per month (e.g. 22 working days)
 * @param {number} factorPerKm - kg CO2e per km
 * @param {number} occupancy - Average vehicle occupancy (passengers per vehicle)
 * @param {boolean} isVehicleBased - Whether factor is per vehicle-km or per passenger-km
 * @param {number} commutersCount - Number of commuters
 * @returns {object} { emissionsKg, totalPassengerKm, vehicleKmTraveled }
 */
export function calculateTransportEmissions({
  dailyKm = 0,
  daysPerMonth = 22,
  factorPerKm = 0.17,
  occupancy = 1,
  isVehicleBased = true,
  commutersCount = 1
} = {}) {
  const safeKm = Math.max(0, Number(dailyKm) || 0);
  const safeDays = Math.max(0, Number(daysPerMonth) || 0);
  const safeFactor = Math.max(0, Number(factorPerKm) || 0);
  const safeOccupancy = Math.max(1, Number(occupancy) || 1);
  const safeCommuters = Math.max(1, Number(commutersCount) || 1);

  const totalPassengerKm = safeKm * safeDays * safeCommuters;
  let vehicleKmTraveled = totalPassengerKm;

  let emissionsKg = 0;
  if (isVehicleBased) {
    // If factor is per vehicle-km, carpooling divides vehicle km traveled
    vehicleKmTraveled = totalPassengerKm / safeOccupancy;
    emissionsKg = vehicleKmTraveled * safeFactor;
  } else {
    // Factor is already per passenger-km
    emissionsKg = totalPassengerKm * safeFactor;
  }

  return {
    emissionsKg: Math.max(0, emissionsKg),
    totalPassengerKm,
    vehicleKmTraveled
  };
}

/**
 * Calculates waste emissions based on stream allocation.
 *
 * @param {object} streamKgMap - Map of stream ID to kilograms per month
 * @param {Array} streamFactors - Array of waste stream factor objects
 * @returns {object} { totalEmissionsKg, streamBreakdown }
 */
export function calculateWasteEmissions(streamKgMap = {}, streamFactors = []) {
  let totalEmissionsKg = 0;
  const streamBreakdown = {};

  streamFactors.forEach(stream => {
    const kg = Math.max(0, Number(streamKgMap[stream.id]) || 0);
    const emissions = kg * (stream.factorPerKg || 0);
    streamBreakdown[stream.id] = {
      kg,
      emissionsKg: emissions,
      factor: stream.factorPerKg,
      name: stream.name
    };
    totalEmissionsKg += emissions;
  });

  return {
    totalEmissionsKg: Math.max(0, totalEmissionsKg),
    streamBreakdown
  };
}

/**
 * Calculates complete campus baseline footprint.
 */
export function calculateTotalFootprint({
  electricityNetKg = 0,
  transportNetKg = 0,
  wasteNetKg = 0
}) {
  const electricity = Math.max(0, Number(electricityNetKg) || 0);
  const transport = Math.max(0, Number(transportNetKg) || 0);
  const waste = Math.max(0, Number(wasteNetKg) || 0);

  const totalKg = electricity + transport + waste;
  const totalTonnes = totalKg / 1000;

  const electricityShare = totalKg > 0 ? (electricity / totalKg) * 100 : 0;
  const transportShare = totalKg > 0 ? (transport / totalKg) * 100 : 0;
  const wasteShare = totalKg > 0 ? (waste / totalKg) * 100 : 0;

  return {
    totalKg,
    totalTonnes,
    breakdown: {
      electricity: { kg: electricity, tonnes: electricity / 1000, share: electricityShare },
      transport: { kg: transport, tonnes: transport / 1000, share: transportShare },
      waste: { kg: waste, tonnes: waste / 1000, share: wasteShare }
    }
  };
}

/**
 * Simulates decarbonization scenarios.
 * Ensures reductions never exceed 100% of the baseline and never become negative.
 *
 * @param {object} baselineBreakdown - { electricity: kg, transport: kg, waste: kg }
 * @param {object} scenarioLevers - { electricityReductionPct, solarSharePct, transportShiftPct, wasteDiversionPct, activeMeasures }
 * @returns {object} { projectedKg, avoidedKg, percentageReduction, categoryComparison }
 */
export function calculateScenarioResults(baselineBreakdown, scenarioLevers) {
  const {
    electricityReductionPct = 0,
    solarSharePct = 0,
    transportShiftPct = 0,
    wasteDiversionPct = 0,
    activeMeasures = []
  } = scenarioLevers;

  const baseElec = Math.max(0, baselineBreakdown.electricity || 0);
  const baseTrans = Math.max(0, baselineBreakdown.transport || 0);
  const baseWaste = Math.max(0, baselineBreakdown.waste || 0);
  const baseTotal = baseElec + baseTrans + baseWaste;

  // Add initiative bonuses from discrete campus measures
  let measureElecBonus = 0;
  let measureTransBonus = 0;
  let measureWasteBonus = 0;

  activeMeasures.forEach(measure => {
    if (measure.category === 'electricity') measureElecBonus += measure.reductionPct || 0;
    if (measure.category === 'transport') measureTransBonus += measure.reductionPct || 0;
    if (measure.category === 'waste') measureWasteBonus += measure.reductionPct || 0;
  });

  // Calculate combined reductions, capped at 100%
  const totalElecReductionPct = Math.min(100, Math.max(0, electricityReductionPct + measureElecBonus));
  const remainingElecPostEfficiency = baseElec * (1 - totalElecReductionPct / 100);
  // Solar share cleans remaining electricity emissions
  const safeSolarSharePct = Math.min(100, Math.max(0, solarSharePct));
  const projectedElec = remainingElecPostEfficiency * (1 - safeSolarSharePct / 100);

  const totalTransReductionPct = Math.min(100, Math.max(0, transportShiftPct + measureTransBonus));
  const projectedTrans = baseTrans * (1 - totalTransReductionPct / 100);

  const totalWasteReductionPct = Math.min(100, Math.max(0, wasteDiversionPct + measureWasteBonus));
  const projectedWaste = baseWaste * (1 - totalWasteReductionPct / 100);

  const projectedTotal = projectedElec + projectedTrans + projectedWaste;
  const avoidedTotal = Math.max(0, baseTotal - projectedTotal);
  const percentageReduction = baseTotal > 0 ? (avoidedTotal / baseTotal) * 100 : 0;

  return {
    baselineTotalKg: baseTotal,
    projectedTotalKg: projectedTotal,
    avoidedTotalKg: avoidedTotal,
    baselineTotalTonnes: baseTotal / 1000,
    projectedTotalTonnes: projectedTotal / 1000,
    avoidedTotalTonnes: avoidedTotal / 1000,
    percentageReduction,
    categories: {
      electricity: {
        baseline: baseElec,
        projected: projectedElec,
        avoided: Math.max(0, baseElec - projectedElec),
        reductionPct: baseElec > 0 ? ((baseElec - projectedElec) / baseElec) * 100 : 0
      },
      transport: {
        baseline: baseTrans,
        projected: projectedTrans,
        avoided: Math.max(0, baseTrans - projectedTrans),
        reductionPct: baseTrans > 0 ? ((baseTrans - projectedTrans) / baseTrans) * 100 : 0
      },
      waste: {
        baseline: baseWaste,
        projected: projectedWaste,
        avoided: Math.max(0, baseWaste - projectedWaste),
        reductionPct: baseWaste > 0 ? ((baseWaste - projectedWaste) / baseWaste) * 100 : 0
      }
    }
  };
}

/**
 * Calculates tangible real-world equivalents for avoided carbon.
 */
export function calculateEquivalents(kgAvoided = 0) {
  const safeKg = Math.max(0, Number(kgAvoided) || 0);

  return {
    treesPlantedOneYear: Math.round(safeKg / EQUIVALENCY_FACTORS.treeAbsorptionPerYearKg),
    kmDrivenAvoided: Math.round(safeKg / EQUIVALENCY_FACTORS.passengerCarKmKg),
    gasolineLitersSaved: Math.round(safeKg / EQUIVALENCY_FACTORS.gasolineLitersKg),
    smartphoneCharges: Math.round(safeKg / EQUIVALENCY_FACTORS.smartphoneChargesKg)
  };
}
