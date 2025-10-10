import React from 'react';

const formatNumber = (n) => {
  if (!Number.isFinite(n)) return '-';
  return Math.abs(n) >= 100 ? Math.round(n).toString() : n.toFixed(1);
};

const Legend = ({ lowHi = 0, medHi = 0, max = 1, loading = false }) => {
  if (loading) {
    return (
      <div className="legend">
        <div className="legend-title">Legend</div>
        <div className="legend-note">Preparing scale…</div>
      </div>
    );
  }

  return (
    <div className="legend">
      <div className="legend-title">Legend</div>

      {/* Gradient Bar */}
      <div className="legend-gradient" aria-hidden>
        <div className="legend-gradient-bar" />
        <div className="legend-gradient-scale">
          <span>0</span>
          <span>{formatNumber(lowHi)}</span>
          <span>{formatNumber(medHi)}</span>
          <span>{formatNumber(max)}</span>
        </div>
      </div>

      {/* Discrete band labels */}
      <ul className="legend-bands">
        <li>
          <span className="chip chip-green" />
          <span className="label">
            Low (Green): 0 – {formatNumber(lowHi)} (≈ P33)
          </span>
        </li>
        <li>
          <span className="chip chip-yellow" />
          <span className="label">
            Medium (Yellow): {formatNumber(lowHi)} – {formatNumber(medHi)} (≈ P66)
          </span>
        </li>
        <li>
          <span className="chip chip-red" />
          <span className="label">
            High (Red): {formatNumber(medHi)} – {formatNumber(max)}* (P95 cap)
          </span>
        </li>
      </ul>

      <div className="legend-footnote">
        * Values above P95 are clamped for visualization.
      </div>
    </div>
  );
};

export default Legend;
