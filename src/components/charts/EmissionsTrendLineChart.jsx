import React, { useState } from 'react';
import { MONTHLY_EMISSIONS_HISTORY } from '../../data/timeSeriesData';

export default function EmissionsTrendLineChart() {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const data = MONTHLY_EMISSIONS_HISTORY;
  const maxVal = 145000;
  const minVal = 80000;

  const width = 600;
  const height = 220;
  const paddingX = 40;
  const paddingY = 25;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const getX = (index) => paddingX + (index / (data.length - 1)) * chartW;
  const getY = (val) => height - paddingY - ((val - minVal) / (maxVal - minVal)) * chartH;

  // Build SVG path for Total Emissions
  const totalPoints = data.map((d, i) => `${getX(i)},${getY(d.total)}`);
  const totalPath = `M ${totalPoints.join(' L ')}`;
  const areaPath = `${totalPath} L ${getX(data.length - 1)},${height - paddingY} L ${getX(0)},${height - paddingY} Z`;

  // Build SVG path for Target Line
  const targetPoints = data.map((d, i) => `${getX(i)},${getY(d.target)}`);
  const targetPath = `M ${targetPoints.join(' L ')}`;

  return (
    <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines */}
        {[90000, 110000, 130000].map((val) => (
          <g key={val}>
            <line
              x1={paddingX}
              y1={getY(val)}
              x2={width - paddingX}
              y2={getY(val)}
              stroke="rgba(255, 255, 255, 0.07)"
              strokeDasharray="4 4"
            />
            <text
              x={paddingX - 8}
              y={getY(val) + 4}
              fill="var(--text-dim)"
              fontSize="9"
              textAnchor="end"
              fontFamily="var(--font-mono)"
            >
              {val / 1000}k
            </text>
          </g>
        ))}

        {/* Gradient Area Fill */}
        <path d={areaPath} fill="url(#trendGradient)" />

        {/* Target trajectory dashed line */}
        <path
          d={targetPath}
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        {/* Total emissions line */}
        <path
          d={totalPath}
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Month labels & interactive points */}
        {data.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.total);
          const isHovered = hoveredPoint?.month === d.month;

          return (
            <g key={d.month}>
              <text
                x={cx}
                y={height - 6}
                fill="var(--text-dim)"
                fontSize="10"
                textAnchor="middle"
                fontWeight={isHovered ? '700' : '400'}
              >
                {d.month}
              </text>

              {/* Data Point Dot */}
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 6 : 4}
                fill={isHovered ? '#34d399' : '#10b981'}
                stroke="#0c1512"
                strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={() => setHoveredPoint(d)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          );
        })}
      </svg>

      {/* Floating tooltip */}
      {hoveredPoint && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '16px',
            background: 'rgba(18, 33, 28, 0.95)',
            border: '1px solid var(--border-bright)',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            boxShadow: 'var(--shadow-md)',
            pointerEvents: 'none'
          }}
        >
          <div style={{ fontWeight: 700, color: '#34d399', marginBottom: '4px' }}>
            {hoveredPoint.month} Carbon Footprint
          </div>
          <div style={{ color: '#fff' }}>
            Total: <strong>{hoveredPoint.total.toLocaleString()} kg CO₂e</strong>
          </div>
          <div style={{ color: '#0ea5e9', fontSize: '0.72rem' }}>
            Target: {hoveredPoint.target.toLocaleString()} kg CO₂e
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.78rem', marginTop: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '3px', background: '#10b981' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Monthly Measured Emissions</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '2px', background: '#0ea5e9', borderBottom: '1px dashed #0ea5e9' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Campus 2030 Target Path</span>
        </div>
      </div>
    </div>
  );
}
