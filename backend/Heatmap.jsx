import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import Legend from './Legend';
import './Legend.css';

function percentile(sortedArr, p) {
  if (!sortedArr.length) return 0;
  const idx = Math.min(
    sortedArr.length - 1,
    Math.max(0, Math.floor((sortedArr.length - 1) * p))
  );
  return sortedArr[idx];
}

const Heatmap = () => {
  const [crimeData, setCrimeData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Derived stats
  const { maxIntensity, lowHi, medHi, gradientStops } = useMemo(() => {
    // Default fallback to avoid NaNs while loading
    if (!crimeData?.length) {
      return {
        maxIntensity: 1,
        lowHi: 0.33,
        medHi: 0.66,
        gradientStops: { tLow: 0.33, tMed: 0.66 }
      };
    }

    // Extract + sort intensities
    const intensities = crimeData
      .map(p => Number.parseFloat(p[2]) || 0)
      .filter(n => Number.isFinite(n))
      .sort((a, b) => a - b);

    // Robust cap (95th percentile)
    const p95 = percentile(intensities, 0.95);
    const robustMax = Math.max(1, p95 || 1);

    // Compute **data-driven** band thresholds
    // We compute P33 and P66 but clamp them to robustMax (for safety)
    const p33 = Math.min(percentile(intensities, 0.33), robustMax);
    const p66 = Math.min(percentile(intensities, 0.66), robustMax);

    // Convert to 0..1 positions for the gradient (relative to 'max' prop)
    const tLow = Math.max(0, Math.min(1, p33 / robustMax));
    const tMed = Math.max(0, Math.min(1, p66 / robustMax));

    return {
      maxIntensity: robustMax,
      lowHi: p33,
      medHi: p66,
      gradientStops: { tLow, tMed },
    };
  }, [crimeData]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data = [] } = await axios.get('http://localhost:5000/api/crime-data');
        setCrimeData(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Error fetching crime data:', e);
        setCrimeData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Layout ---
  const containerStyle = {
    display: 'flex',
    height: '100vh',
    width: '100%',
    backgroundColor: '#f4f4f4',
  };
  const mapStyle = { flex: 1, height: '100%' };
  const legendContainerStyle = {
    width: 300,
    padding: '20px',
    backgroundColor: 'white',
    boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    zIndex: 1000,
    pointerEvents: 'auto',
  };

  // Build a dynamic gradient from percentile stops
  const gradient = useMemo(() => {
    const { tLow, tMed } = gradientStops;
    // Ensure monotonic keys and visible bands
    const g = {
      0.0: '#22c55e',         // Green start
    };
    g[Math.max(0.0001, tLow)] = '#22c55e';   // still green up to tLow
    g[Math.max(tLow + 0.0001, 0.0002)] = '#fbbf24'; // Yellow kicks in
    g[Math.max(tMed, tLow + 0.0002)] = '#fbbf24';   // yellow up to tMed
    g[1.0] = '#ef4444';       // Red to the max
    return g;
  }, [gradientStops]);

  return (
    <div style={containerStyle}>
      <MapContainer center={[20.5937, 78.9629]} zoom={5} style={mapStyle}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {!loading && crimeData.length > 0 && (
          <HeatmapLayer
            // Key includes breakpoints & max to force re-render when they change
            key={`${maxIntensity}-${lowHi}-${medHi}`}
            points={crimeData}
            longitudeExtractor={p => p[1]}
            latitudeExtractor={p => p[0]}
            intensityExtractor={p => Number.parseFloat(p[2]) || 0}
            max={maxIntensity}   // critical: scales intensities to 0..1
            radius={22}
            blur={18}
            gradient={gradient}  // now truly data-driven
          />
        )}
      </MapContainer>

      {/* Legend/index OUTSIDE the map */}
      <aside style={legendContainerStyle} aria-label="Crime Heatmap Legend">
        <h3 style={{ margin: 0 }}>Crime Map</h3>
        <p style={{ margin: 0, color: '#555' }}>
          Scale capped at P95 to reduce outlier skew. Bands at P33 and P66.
        </p>

        <Legend
          lowHi={lowHi}
          medHi={medHi}
          max={maxIntensity}
          loading={loading}
        />

        {loading && <p>Loading data...</p>}
      </aside>
    </div>
  );
};

export default Heatmap;
