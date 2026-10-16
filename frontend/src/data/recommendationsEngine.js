const CATEGORY_RECOMMENDATIONS = {
  electricity: {
    title: 'Review electricity use',
    action: 'Compare meter readings over the reporting period, identify high-use equipment or operating hours, and evaluate any change using later meter data.'
  },
  transport: {
    title: 'Review recorded travel activity',
    action: 'Review the recorded travel modes and distances, then compare any travel changes against updated activity records.'
  },
  waste: {
    title: 'Review measured waste streams',
    action: 'Use weighed stream records to identify material for which a locally available reuse, recycling, or composting route can be verified.'
  }
};

export function generateRecommendations(totalFootprint) {
  const breakdown = totalFootprint?.breakdown;
  if (!breakdown) return [];

  return Object.entries(CATEGORY_RECOMMENDATIONS)
    .filter(([category]) => breakdown[category]?.kg > 0)
    .sort(([left], [right]) => breakdown[right].kg - breakdown[left].kg)
    .map(([category, recommendation], index) => ({
      id: category,
      category,
      title: recommendation.title,
      action: recommendation.action,
      reason: `${breakdown[category].share.toFixed(1)}% of the entered footprint (${breakdown[category].kg.toFixed(1)} kg CO2e for the selected period) comes from this category.`,
      priority: index === 0 ? 'High Priority' : 'Medium Priority'
    }));
}
