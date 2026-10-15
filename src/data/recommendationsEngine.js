/**
 * CarbonIQ Rule-Based Intelligent Recommendation Engine
 * Analyzes campus carbon breakdown, ranks recommendations by impact,
 * and computes mathematically traceable expected savings.
 */

export function generateRecommendations(totalFootprint, inputs, currentGridFactor) {
  const { breakdown, totalKg } = totalFootprint;
  const elecKg = breakdown.electricity.kg;
  const transKg = breakdown.transport.kg;
  const wasteKg = breakdown.waste.kg;

  // Determine ranking order of emissions
  const categories = [
    { name: 'electricity', kg: elecKg, share: breakdown.electricity.share },
    { name: 'transport', kg: transKg, share: breakdown.transport.share },
    { name: 'waste', kg: wasteKg, share: breakdown.waste.share }
  ].sort((a, b) => b.kg - a.kg);

  const largestSource = categories[0].name;
  const recommendations = [];

  // 1. Electricity Levers
  if (elecKg > 0) {
    const isPrimary = largestSource === 'electricity';
    const estimatedLedSavingsKg = elecKg * 0.12;
    const estimatedHvacSavingsKg = elecKg * 0.18;
    const solarBoostKwh = inputs.electricityKwh * 0.25;
    const solarSavingsKg = solarBoostKwh * currentGridFactor;

    recommendations.push({
      id: 'rec-elec-hvac',
      title: 'Implement AI-Driven HVAC Scheduling & Temperature Setback',
      category: 'electricity',
      priority: isPrimary ? 'High Priority' : 'Medium Priority',
      difficulty: 'Medium',
      roiMonths: '8-14 months',
      reason: `Electricity is ${isPrimary ? 'your largest emission driver (' + breakdown.electricity.share.toFixed(1) + '%)' : 'a significant contributor (' + breakdown.electricity.share.toFixed(1) + '%)'}. HVAC accounts for ~45% of academic building power.`,
      action: 'Set thermostat deadband to 24°C in summer, automate overnight shutoff, and link airflow to class schedules.',
      expectedSavingsKg: Math.round(estimatedHvacSavingsKg),
      expectedSavingsPct: 18,
      recommendedLeverVal: 20,
      associatedMeasure: {
        id: 'm-hvac',
        name: 'Smart HVAC Optimization',
        category: 'electricity',
        reductionPct: 18
      }
    });

    recommendations.push({
      id: 'rec-solar-rooftop',
      title: 'Expand Campus Rooftop Solar PV Coverage',
      category: 'solar',
      priority: inputs.solarOffsetPercent < 25 ? 'High Priority' : 'Medium Priority',
      difficulty: 'Medium',
      roiMonths: '3-4 years',
      reason: `Current solar offset is only ${inputs.solarOffsetPercent.toFixed(1)}%. Clean on-site generation eliminates Scope 2 emissions directly at the source.`,
      action: 'Install additional bifacial solar canopies over existing campus parking lots and academic building terraces.',
      expectedSavingsKg: Math.round(solarSavingsKg),
      expectedSavingsPct: 25,
      recommendedLeverVal: 40,
      associatedMeasure: {
        id: 'm-solar-expand',
        name: '250 kWp Rooftop & Carport Solar PV',
        category: 'electricity',
        reductionPct: 25
      }
    });

    recommendations.push({
      id: 'rec-elec-led',
      title: 'Complete Campus-Wide LED & Smart Occupancy Retrofit',
      category: 'electricity',
      priority: 'Quick Win',
      difficulty: 'Low',
      roiMonths: '6-9 months',
      reason: 'Lighting retrofit yields immediate baseline reduction with minimal installation downtime.',
      action: 'Replace remaining fluorescent T8/T5 ballasts with dimmable smart LED fixtures integrated with PIR occupancy sensors.',
      expectedSavingsKg: Math.round(estimatedLedSavingsKg),
      expectedSavingsPct: 12,
      recommendedLeverVal: 15,
      associatedMeasure: {
        id: 'm-led',
        name: 'Smart LED & Occupancy Sensors',
        category: 'electricity',
        reductionPct: 12
      }
    });
  }

  // 2. Transportation Levers
  if (transKg > 0) {
    const isPrimary = largestSource === 'transport';
    const isSoloCar = inputs.selectedTransportMode === 'car_petrol' || inputs.selectedTransportMode === 'car_diesel';
    const carpoolSavingsKg = transKg * 0.28;
    const evTransitSavingsKg = transKg * 0.45;

    recommendations.push({
      id: 'rec-trans-shuttle',
      title: 'Electrify Campus Shuttle & Expand Feeder Transit',
      category: 'transport',
      priority: isPrimary ? 'High Priority' : 'Medium Priority',
      difficulty: 'High',
      roiMonths: '2-3 years',
      reason: `Commuting contributes ${breakdown.transport.share.toFixed(1)}% (${(transKg / 1000).toFixed(1)} tCO₂e) of your carbon footprint across ${inputs.commutersCount.toLocaleString()} commuters.`,
      action: 'Deploy electric shuttle buses connecting the campus directly with the nearest metro and train terminals.',
      expectedSavingsKg: Math.round(evTransitSavingsKg),
      expectedSavingsPct: 45,
      recommendedLeverVal: 40,
      associatedMeasure: {
        id: 'm-ev-shuttle',
        name: 'Campus Electric Shuttle Fleet',
        category: 'transport',
        reductionPct: 20
      }
    });

    if (isSoloCar || inputs.carpoolingOccupancy < 2) {
      recommendations.push({
        id: 'rec-trans-carpool',
        title: 'Launch Smart Campus Carpooling & Preferential EV Parking',
        category: 'transport',
        priority: 'Quick Win',
        difficulty: 'Low',
        roiMonths: 'Immediate',
        reason: 'Current vehicle occupancy is low. Increasing occupancy from 1 to 2+ passengers cuts private vehicle emissions in half.',
        action: 'Implement a verified campus rideshare app and reserve prime shaded parking slots exclusively for high-occupancy vehicles.',
        expectedSavingsKg: Math.round(carpoolSavingsKg),
        expectedSavingsPct: 28,
        recommendedLeverVal: 30,
        associatedMeasure: {
          id: 'm-carpool',
          name: 'Campus Carpooling & Active Mobility Program',
          category: 'transport',
          reductionPct: 15
        }
      });
    }
  }

  // 3. Waste Levers
  if (wasteKg > 0) {
    const isPrimary = largestSource === 'waste';
    const landfillKg = inputs.wasteBreakdown.landfill || 0;
    const compostingDiversionSavingsKg = landfillKg * 0.587 * 0.65; // Diverting 65% of landfill waste to composting

    recommendations.push({
      id: 'rec-waste-compost',
      title: 'Deploy On-Campus Organic Waste Biodigester / Composter',
      category: 'waste',
      priority: isPrimary ? 'High Priority' : 'Medium Priority',
      difficulty: 'Medium',
      roiMonths: '18-24 months',
      reason: `Landfill disposal generates potent anaerobic methane (0.587 kg CO₂e/kg). Organic dining waste can be eliminated on-campus.`,
      action: 'Install a dual-stage aerobic composter beside dining commons to process 100% of cafeteria and horticulture clippings into rich campus landscape mulch.',
      expectedSavingsKg: Math.round(compostingDiversionSavingsKg),
      expectedSavingsPct: 55,
      recommendedLeverVal: 50,
      associatedMeasure: {
        id: 'm-compost',
        name: 'Zero-Waste Dining & Composting Hub',
        category: 'waste',
        reductionPct: 35
      }
    });

    recommendations.push({
      id: 'rec-waste-audit',
      title: 'Source Segregation & E-Waste Recovery Drive',
      category: 'waste',
      priority: 'Quick Win',
      difficulty: 'Low',
      roiMonths: 'Immediate',
      reason: 'Recycling mixed paper, aluminum, and plastics avoids resource-intensive virgin extraction.',
      action: 'Standardize 4-stream color-coded collection bins across all academic hallways and conduct bi-annual e-waste recovery drives.',
      expectedSavingsKg: Math.round(wasteKg * 0.25),
      expectedSavingsPct: 25,
      recommendedLeverVal: 35,
      associatedMeasure: {
        id: 'm-waste-segregation',
        name: 'Campus Multi-Stream Waste Segregation',
        category: 'waste',
        reductionPct: 15
      }
    });
  }

  // Rank recommendations: First by priority (High Priority first, then Quick Win, then Medium), then by potential savings
  const priorityWeight = { 'High Priority': 3, 'Quick Win': 2, 'Medium Priority': 1 };
  recommendations.sort((a, b) => {
    const pDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    if (pDiff !== 0) return pDiff;
    return b.expectedSavingsKg - a.expectedSavingsKg;
  });

  return recommendations;
}
