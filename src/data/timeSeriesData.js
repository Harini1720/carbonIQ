/**
 * Time-series monthly emissions dataset (12 months)
 * Used in Dashboard trend charts and target trajectories.
 */

export const MONTHLY_EMISSIONS_HISTORY = [
  { month: 'Jan', electricity: 94500, transport: 24200, waste: 2980, total: 121680, target: 110000 },
  { month: 'Feb', electricity: 92800, transport: 24100, waste: 2910, total: 119810, target: 108000 },
  { month: 'Mar', electricity: 98400, transport: 25400, waste: 3100, total: 126900, target: 106000 },
  { month: 'Apr', electricity: 106200, transport: 23800, waste: 3150, total: 133150, target: 104000 }, // Summer peak AC
  { month: 'May', electricity: 112500, transport: 18900, waste: 2600, total: 134000, target: 102000 }, // Exams / early break
  { month: 'Jun', electricity: 88400, transport: 12500, waste: 1950, total: 102850, target: 100000 }, // Summer recess
  { month: 'Jul', electricity: 86500, transport: 13100, waste: 2050, total: 101650, target: 98000 },
  { month: 'Aug', electricity: 99800, transport: 26200, waste: 3250, total: 129250, target: 96000 }, // Fall semester start
  { month: 'Sep', electricity: 101200, transport: 26800, waste: 3300, total: 131300, target: 94000 },
  { month: 'Oct', electricity: 97600, transport: 25900, waste: 3220, total: 126720, target: 92000 },
  { month: 'Nov', electricity: 93400, transport: 25100, waste: 3080, total: 121580, target: 90000 },
  { month: 'Dec', electricity: 89900, transport: 20400, waste: 2750, total: 113050, target: 88000 }
];
