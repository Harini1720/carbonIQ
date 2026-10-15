/**
 * Formatting helpers for CarbonIQ
 */

export function formatKg(val, decimals = 0) {
  if (val === undefined || val === null || isNaN(val)) return '0 kg CO₂e';
  return `${Number(val).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })} kg CO₂e`;
}

export function formatTonnes(val, decimals = 2) {
  if (val === undefined || val === null || isNaN(val)) return '0.00 tCO₂e';
  return `${Number(val).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })} tCO₂e`;
}

export function formatKwh(val, decimals = 0) {
  if (val === undefined || val === null || isNaN(val)) return '0 kWh';
  return `${Number(val).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })} kWh`;
}

export function formatPercent(val, decimals = 1) {
  if (val === undefined || val === null || isNaN(val)) return '0.0%';
  return `${Number(val).toFixed(decimals)}%`;
}

export function formatNumber(val, decimals = 0) {
  if (val === undefined || val === null || isNaN(val)) return '0';
  return Number(val).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}
