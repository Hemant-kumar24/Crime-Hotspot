import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, Polyline, LayerGroup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getHeatColor, getSeverityColor } from "../utils/colorScale";

const DEFAULT_CENTER = [28.6139, 77.209];
const PATROL_BASE_STYLE = { color: "#fb923c", weight: 9, opacity: 0.18, lineCap: "round" };
const PATROL_LINE_STYLE = { color: "#fb923c", weight: 5, opacity: 0.9, dashArray: "14 10", lineCap: "round" };
const SAFE_BASE_STYLE = { color: "#22c55e", weight: 8, opacity: 0.15, lineCap: "round" };
const SAFE_LINE_STYLE = { color: "#22c55e", weight: 5, opacity: 0.92, dashArray: "2 8", lineCap: "round" };
const WOMEN_MARKER_STYLE = { color: "#db2777", weight: 2, fillColor: "#f472b6", fillOpacity: 0.45 };

const DashboardMap = ({
  incidents,
  clusters,
  patrolRoutes,
  safeRoutes,
  layerVisibility,
  heatmapPoints = [],
  heatmapLoading,
  heatmapError,
  heatmapInfo,
}) => {
  const heatmapMarkers = useMemo(() => {
    if (!layerVisibility.heatmap || !heatmapPoints.length) return null;
    return heatmapPoints.map((point, index) => {
      const radius = 8 + point.count * 1.1;
      const color = getHeatColor(point.normalized_count ?? 0.4);
      const intensityLabel =
        point.normalized_count >= 0.75 ? "High" : point.normalized_count >= 0.4 ? "Medium" : "Low";
      return (
        <CircleMarker
          key={`heat-${index.toString()}`}
          center={[point.lat, point.lon]}
          radius={radius}
          pathOptions={{
            color,
            weight: 1.2,
            fillColor: color,
            fillOpacity: 0.75,
          }}
        >
          <Tooltip>
            <strong>{point.crime_type}</strong>
            <br />
            Total incidents: {point.count}
            <br />
            Intensity level: {intensityLabel}
            <br />
            Latest report: {point.date}
          </Tooltip>
        </CircleMarker>
      );
    });
  }, [heatmapPoints, layerVisibility.heatmap]);

  const clusterCircles = useMemo(() => {
    if (!layerVisibility.clusters) return null;
    return clusters.map((cluster) => (
      <CircleMarker
        key={cluster.id}
        center={cluster.center}
        radius={34 * cluster.radius}
        pathOptions={{
          color: "#1d4ed8",
          fillColor: "#1d4ed8",
          fillOpacity: 0.1,
          weight: 2,
          dashArray: "4 6",
        }}
      >
        <Tooltip direction="right" offset={[10, 0]}>
          <strong>{cluster.label}</strong>
          <br />
          Dominant: {cluster.primaryType}
          <br />
          Risk Score: {(cluster.score * 100).toFixed(0)}%
        </Tooltip>
      </CircleMarker>
    ));
  }, [clusters, layerVisibility.clusters]);

  const patrolPolylines = useMemo(() => {
    if (!layerVisibility.patrol) return null;
    return patrolRoutes.map((route) => (
      <LayerGroup key={route.id}>
        <Polyline positions={route.waypoints} pathOptions={PATROL_BASE_STYLE} />
        <Polyline positions={route.waypoints} pathOptions={PATROL_LINE_STYLE}>
          <Tooltip sticky>
            <strong>{route.name}</strong>
            <br />
            Priority: {route.priority.toUpperCase()} · Coverage: {route.coverage}%
          </Tooltip>
        </Polyline>
      </LayerGroup>
    ));
  }, [patrolRoutes, layerVisibility.patrol]);

  const safePolylines = useMemo(() => {
    if (!layerVisibility.safe) return null;
    return safeRoutes.map((route) => (
      <LayerGroup key={route.id}>
        <Polyline positions={route.waypoints} pathOptions={SAFE_BASE_STYLE} />
        <Polyline positions={route.waypoints} pathOptions={SAFE_LINE_STYLE}>
          <Tooltip sticky>
            <strong>{route.name}</strong>
            <br />
            Residual Risk: {(route.riskScore * 100).toFixed(0)}%
          </Tooltip>
        </Polyline>
      </LayerGroup>
    ));
  }, [safeRoutes, layerVisibility.safe]);

  const womenSafetyMarkers = useMemo(() => {
    if (!layerVisibility.womenSafety) return null;
    return incidents
      .filter((incident) => incident.isWomenSafety)
      .map((incident) => (
        <CircleMarker key={`${incident.id}-women`} center={incident.coordinates} radius={12} pathOptions={WOMEN_MARKER_STYLE}>
          <Tooltip>
            <strong>{incident.location}</strong>
            <br />
            Women Safety Alert · {incident.type}
          </Tooltip>
        </CircleMarker>
      ));
  }, [incidents, layerVisibility.womenSafety]);

  return (
    <section className="dashboard__map">
      <div className="dashboard__map-canvas">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={12.5}
          minZoom={11}
          maxZoom={18}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LayerGroup>{heatmapMarkers}</LayerGroup>
          <LayerGroup>{clusterCircles}</LayerGroup>
          <LayerGroup>{patrolPolylines}</LayerGroup>
          <LayerGroup>{safePolylines}</LayerGroup>
          <LayerGroup>{womenSafetyMarkers}</LayerGroup>
          <LayerGroup>
            {incidents.map((incident) => (
              <CircleMarker
                key={`${incident.id}-incident`}
                center={incident.coordinates}
                radius={6}
                pathOptions={{
                  color: getSeverityColor(incident.severity),
                  weight: 1.2,
                  fillColor: "#ffffff",
                  fillOpacity: 0.85,
                }}
              >
                <Tooltip>
                  <strong>{incident.type}</strong>
                  <br />
                  {incident.location}
                  <br />
                  {incident.description}
                </Tooltip>
              </CircleMarker>
            ))}
          </LayerGroup>
        </MapContainer>

        {heatmapLoading ? <div className="map-status">Loading crime heatmap...</div> : null}
        {heatmapInfo && !heatmapError ? <div className="map-status map-status--info">{heatmapInfo}</div> : null}
        {heatmapError ? <div className="map-status map-status--error">{heatmapError}</div> : null}
      </div>

      <div className="map-legend">
        <p>Legend</p>
        <ul>
          <li>
            <span className="legend-dot legend-dot--heat-low" />
            Low crime intensity
          </li>
          <li>
            <span className="legend-dot legend-dot--heat-medium" />
            Medium crime intensity
          </li>
          <li>
            <span className="legend-dot legend-dot--heat-high" />
            High crime intensity
          </li>
          <li>
            <span className="legend-dot legend-dot--cluster" />
            Hotspot Cluster
          </li>
          <li>
            <span className="legend-line legend-line--patrol" />
            Patrol Route
          </li>
          <li>
            <span className="legend-line legend-line--safe" />
            Safe Route
          </li>
          <li>
            <span className="legend-dot legend-dot--women" />
            Women Safety Incident
          </li>
        </ul>
      </div>
    </section>
  );
};

export default DashboardMap;
