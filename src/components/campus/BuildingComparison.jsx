import React from 'react';
import { useCarbon } from '../../context/CarbonContext';
import { formatKg, formatKwh } from '../../utils/formatters';
import { Scale, Zap, Building2, Sun, Users, ArrowRightLeft } from 'lucide-react';

export default function BuildingComparison() {
  const {
    allBuildings,
    comparisonBuildingIds,
    setComparisonBuildingIds,
    currentGridFactor
  } = useCarbon();

  const bldgA = allBuildings.find(b => b.id === comparisonBuildingIds[0]) || allBuildings[0];
  const bldgB = allBuildings.find(b => b.id === comparisonBuildingIds[1]) || allBuildings[1];

  const calcBuildingStats = (b) => {
    const netKwh = Math.max(0, b.monthlyKwh - b.solarMonthlyKwh);
    const emissionsKg = netKwh * currentGridFactor;
    return { netKwh, emissionsKg };
  };

  const statsA = calcBuildingStats(bldgA);
  const statsB = calcBuildingStats(bldgB);

  return (
    <div className="glass-card" style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Scale size={20} color="#34d399" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
            Comparative Facility Carbon Intensity Analysis
          </h3>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Evaluate cross-facility efficiency & retrofit opportunities
        </span>
      </div>

      {/* Selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <label className="form-label">Facility A</label>
          <select
            value={bldgA.id}
            onChange={(e) => setComparisonBuildingIds([e.target.value, bldgB.id])}
            className="form-select"
          >
            {allBuildings.map(b => (
              <option key={b.id} value={b.id} disabled={b.id === bldgB.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ paddingTop: '22px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(52, 211, 153, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399'
            }}
          >
            <ArrowRightLeft size={16} />
          </div>
        </div>

        <div>
          <label className="form-label">Facility B</label>
          <select
            value={bldgB.id}
            onChange={(e) => setComparisonBuildingIds([bldgA.id, e.target.value])}
            className="form-select"
          >
            {allBuildings.map(b => (
              <option key={b.id} value={b.id} disabled={b.id === bldgA.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-dim)' }}>
              <th style={{ padding: '10px' }}>Metric</th>
              <th style={{ padding: '10px', color: '#34d399', width: '38%' }}>{bldgA.name.split(':')[0]}</th>
              <th style={{ padding: '10px', color: '#38bdf8', width: '38%' }}>{bldgB.name.split(':')[0]}</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>Building Type</td>
              <td style={{ padding: '10px', color: '#fff' }}>{bldgA.type}</td>
              <td style={{ padding: '10px', color: '#fff' }}>{bldgB.type}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>Gross Area (m²)</td>
              <td style={{ padding: '10px', color: '#fff', fontWeight: 600 }}>{bldgA.areaSqM.toLocaleString()} m²</td>
              <td style={{ padding: '10px', color: '#fff', fontWeight: 600 }}>{bldgB.areaSqM.toLocaleString()} m²</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>Daily Occupancy</td>
              <td style={{ padding: '10px', color: '#fff' }}>{bldgA.occupants.toLocaleString()} persons</td>
              <td style={{ padding: '10px', color: '#fff' }}>{bldgB.occupants.toLocaleString()} persons</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>Monthly Electricity</td>
              <td style={{ padding: '10px', color: '#34d399', fontWeight: 700 }}>{formatKwh(bldgA.monthlyKwh)}</td>
              <td style={{ padding: '10px', color: '#38bdf8', fontWeight: 700 }}>{formatKwh(bldgB.monthlyKwh)}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>Onsite Solar Capacity</td>
              <td style={{ padding: '10px', color: '#fff' }}>{bldgA.solarCapacityKwp} kWp ({formatKwh(bldgA.solarMonthlyKwh)})</td>
              <td style={{ padding: '10px', color: '#fff' }}>{bldgB.solarCapacityKwp} kWp ({formatKwh(bldgB.solarMonthlyKwh)})</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>Net Monthly Carbon</td>
              <td style={{ padding: '10px', color: '#10b981', fontWeight: 800 }}>{formatKg(statsA.emissionsKg)}</td>
              <td style={{ padding: '10px', color: '#0ea5e9', fontWeight: 800 }}>{formatKg(statsB.emissionsKg)}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>Energy Use Index (EUI)</td>
              <td style={{ padding: '10px', color: bldgA.euiKwhPerSqM > 30 ? '#fbbf24' : '#34d399', fontWeight: 700 }}>
                {bldgA.euiKwhPerSqM} kWh/m²
              </td>
              <td style={{ padding: '10px', color: bldgB.euiKwhPerSqM > 30 ? '#fbbf24' : '#34d399', fontWeight: 700 }}>
                {bldgB.euiKwhPerSqM} kWh/m²
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
