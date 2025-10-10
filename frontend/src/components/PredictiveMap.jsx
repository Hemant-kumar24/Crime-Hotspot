import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import { getHeatColor } from "../utils/colorScale";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [28.6139, 77.209];

const PredictiveMap = ({ areas = [] }) => {
  const points = useMemo(() => {
    const withCoordinates = areas
      .map((area) => {
        const lat = Number.parseFloat(area.lat);
        const lon = Number.parseFloat(area.lon);
        const total = Number.parseFloat(area.next_week_total ?? 0);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
        return { ...area, lat, lon, total };
      })
      .filter(Boolean);

    const maxTotal = withCoordinates.reduce((acc, area) => Math.max(acc, area.total || 0), 0) || 1;
    return withCoordinates.map((area) => ({
      ...area,
      normalized: Math.min(1, Math.max(0, area.total / maxTotal)),
    }));
  }, [areas]);

  const center = points.length ? [points[0].lat, points[0].lon] : DEFAULT_CENTER;

  if (!points.length) {
    return (
      <div className="predictive-map predictive-map--empty">
        <p>No geospatial forecasts available. Ensure areas have latitude and longitude data.</p>
      </div>
    );
  }

  return (
    <div className="predictive-map">
      <div className="predictive-map__canvas">
        <MapContainer
          center={center}
          zoom={11.5}
          minZoom={9}
          maxZoom={16}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map((point) => {
            const color = getHeatColor(point.normalized);
            const radius = 12 + point.normalized * 16;
            return (
              <CircleMarker
                key={point.key}
                center={[point.lat, point.lon]}
                radius={radius}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.65,
                  weight: 2,
                }}
              >
                <Tooltip direction="top" offset={[0, -6]}>
                  <strong>{point.area}</strong>
                  <br />
                  {point.city}
                  <br />
                  Projected incidents (7d): {Math.round(point.total || 0)}
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
      <div className="map-legend">
        <p>Intensity Scale</p>
        <ul>
          <li>
            <span className="legend-dot legend-dot--heat-low" />
            Low risk
          </li>
          <li>
            <span className="legend-dot legend-dot--heat-medium" />
            Medium risk
          </li>
          <li>
            <span className="legend-dot legend-dot--heat-high" />
            High risk
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PredictiveMap;
