import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import api from "../services/api";
import DashboardFilters from "../components/DashboardFilters";
import MetricCards from "../components/MetricCards";
import DashboardMap from "../components/DashboardMap";
import DashboardCharts from "../components/DashboardCharts";
import AlertsPanel from "../components/AlertsPanel";
import RoutePanel from "../components/RoutePanel";
import IncidentList from "../components/IncidentList";
import HeatmapFilterBar from "../components/HeatmapFilterBar";
import { mockDashboardData } from "../data/mockDashboardData";

dayjs.extend(isBetween);

const DATASET_LATEST_DATE = mockDashboardData.incidents
  .map((incident) => dayjs(incident.date))
  .reduce((latest, current) => (current.isAfter(latest) ? current : latest), dayjs(mockDashboardData.incidents[0].date));

const Dashboard = () => {
  const [data, setData] = useState(mockDashboardData);
  const [error, setError] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [heatmapMeta, setHeatmapMeta] = useState({ dates: [], crime_types: [] });
  const [heatmapFilters, setHeatmapFilters] = useState({ date: "", crimeType: "" });
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [heatmapFallback, setHeatmapFallback] = useState(false);
  const [heatmapInfo, setHeatmapInfo] = useState("");
  const [heatmapError, setHeatmapError] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    startDate: DATASET_LATEST_DATE.subtract(6, "day").format("YYYY-MM-DD"),
    endDate: DATASET_LATEST_DATE.format("YYYY-MM-DD"),
    severity: "all",
    onlyWomenSafety: false,
  });
  const [layerVisibility, setLayerVisibility] = useState({
    heatmap: true,
    clusters: true,
    patrol: true,
    safe: true,
    womenSafety: false,
  });

  const hydrateDashboard = useCallback(async () => {
    setIsSyncing(true);
    try {
      const response = await api.get("/dashboard");
      setData((prev) => ({
        ...prev,
        metrics: response.data?.metrics ?? prev.metrics,
        alerts: response.data?.upcomingAlerts
          ? response.data.upcomingAlerts.map((alert, index) => ({
              id: alert.id ?? `api-alert-${index}`,
              message: alert.message,
              severity: alert.severity ?? "medium",
              timestamp: alert.timestamp ?? new Date().toISOString(),
            }))
          : prev.alerts,
        clusters: response.data?.hotspots
          ? prev.clusters.map((cluster, index) => {
              const apiHotspot = response.data.hotspots[index];
              if (!apiHotspot) return cluster;
              return {
                ...cluster,
                label: apiHotspot.name ?? cluster.label,
                score: apiHotspot.confidence ?? cluster.score,
              };
            })
          : prev.clusters,
      }));
      setError("");
    } catch (err) {
      const message = err.response?.data?.message || "Using cached data; live updates failed to load.";
      setError(message);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const localHeatmapMeta = useMemo(() => {
    const dates = Array.from(new Set(data.incidents.map((incident) => incident.date))).sort();
    const crimeTypes = Array.from(new Set(data.incidents.map((incident) => incident.type))).sort();
    return { dates, crime_types: crimeTypes };
  }, [data.incidents]);

  const computeLocalHeatmap = useCallback(
    (filterValues) => {
      const grouped = new Map();
      const filtered = data.incidents.filter((incident) => {
        const matchesDate = !filterValues.date || incident.date === filterValues.date;
        const matchesType =
          !filterValues.crimeType || incident.type.toLowerCase() === filterValues.crimeType.toLowerCase();
        return matchesDate && matchesType;
      });

      filtered.forEach((incident) => {
        const key = `${incident.coordinates[0]}|${incident.coordinates[1]}`;
        const existing = grouped.get(key);
        if (!existing) {
          grouped.set(key, {
            lat: incident.coordinates[0],
            lon: incident.coordinates[1],
            count: 1,
            totalIntensity: incident.density || 1,
            latestDate: incident.date,
            typeCounts: new Map([[incident.type, 1]]),
          });
        } else {
          existing.count += 1;
          existing.totalIntensity += incident.density || 1;
          if (!existing.latestDate || incident.date > existing.latestDate) {
            existing.latestDate = incident.date;
          }
          existing.typeCounts.set(incident.type, (existing.typeCounts.get(incident.type) || 0) + 1);
        }
      });

      const points = Array.from(grouped.values()).map((entry) => {
        const dominantType =
          Array.from(entry.typeCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Unknown";
        return {
          lat: entry.lat,
          lon: entry.lon,
          count: entry.count,
          avg_intensity: Number((entry.totalIntensity / entry.count).toFixed(3)),
          date: entry.latestDate,
          crime_type: dominantType,
        };
      });

      const maxCount = points.reduce((acc, point) => Math.max(acc, point.count), 0) || 1;
      const normalized = points.map((point) => ({
        ...point,
        normalized_count: Number((point.count / maxCount).toFixed(3)),
      }));

      return {
        points: normalized,
        meta: localHeatmapMeta,
      };
    },
    [data.incidents, localHeatmapMeta]
  );

  const fetchHeatmapData = useCallback(
    async (filterValues) => {
      setHeatmapLoading(true);
      try {
        const params = {};
        if (filterValues.date) params.date = filterValues.date;
        if (filterValues.crimeType) params.crime_type = filterValues.crimeType;
        const response = await api.get("/crime-data", { params });
        const points = response.data?.points ?? [];
        setHeatmapPoints(points);
        if (response.data?.meta) {
          setHeatmapMeta(response.data.meta);
        }
        if (response.data?.fallback) {
          setHeatmapFallback(true);
          setHeatmapInfo(response.data.message || "Serving cached Delhi dataset.");
          setHeatmapError("");
        } else {
          setHeatmapFallback(false);
          setHeatmapInfo("");
          setHeatmapError("");
        }
      } catch (fetchError) {
        const fallback = computeLocalHeatmap(filterValues);
        setHeatmapPoints(fallback.points);
        setHeatmapMeta(fallback.meta);
        setHeatmapFallback(true);
        setHeatmapInfo("Analytics service unavailable. Displaying Delhi snapshot data.");
        setHeatmapError("");
      } finally {
        setHeatmapLoading(false);
      }
    },
    [computeLocalHeatmap]
  );

  useEffect(() => {
    hydrateDashboard();
  }, [hydrateDashboard]);

  useEffect(() => {
    setHeatmapMeta(localHeatmapMeta);
  }, [localHeatmapMeta]);

  useEffect(() => {
    fetchHeatmapData(heatmapFilters);
  }, [fetchHeatmapData, heatmapFilters.date, heatmapFilters.crimeType]);

  useEffect(() => {
    if (filters.onlyWomenSafety) {
      setLayerVisibility((prev) => (prev.womenSafety ? prev : { ...prev, womenSafety: true }));
    }
  }, [filters.onlyWomenSafety]);

  const availableTypes = useMemo(() => {
    const types = new Set(data.incidents.map((incident) => incident.type));
    return Array.from(types).sort();
  }, [data.incidents]);

  const filteredIncidents = useMemo(() => {
    const start = dayjs(filters.startDate);
    const end = dayjs(filters.endDate).endOf("day");
    return data.incidents.filter((incident) => {
      const incidentDate = dayjs(incident.date);
      const matchesDate = incidentDate.isBetween(start, end, null, "[]");
      const matchesType = filters.type === "all" || incident.type === filters.type;
      const matchesSeverity = filters.severity === "all" || incident.severity === filters.severity;
      const matchesWomen = !filters.onlyWomenSafety || incident.isWomenSafety;
      return matchesDate && matchesType && matchesSeverity && matchesWomen;
    });
  }, [data.incidents, filters]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLayerToggle = (layerKey) => {
    setLayerVisibility((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
  };

  const handleHeatmapFilterChange = (name, value) => {
    setHeatmapFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleHeatmapReset = () => {
    setHeatmapFilters({ date: "", crimeType: "" });
  };

    return (
    <main className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1>Operational Dashboard</h1>
          <p>Track crime hotspots, predictions, and patrol readiness across Delhi jurisdiction.</p>
        </div>
        {isSyncing ? <span className="dashboard__sync">Syncing latest intelligence...</span> : null}
        {error ? <span className="dashboard__error">{error}</span> : null}
      </header>

      <MetricCards metrics={data.metrics} />

      <DashboardFilters
        filters={filters}
        onChange={handleFilterChange}
        layerVisibility={layerVisibility}
        onToggleLayer={handleLayerToggle}
        availableTypes={availableTypes}
      />

      <HeatmapFilterBar
        filters={heatmapFilters}
        meta={heatmapMeta}
        onChange={handleHeatmapFilterChange}
        onReset={handleHeatmapReset}
        isLoading={heatmapLoading}
      />

      <section className="dashboard__content">
        <DashboardMap
          incidents={filteredIncidents}
          clusters={data.clusters}
          patrolRoutes={data.patrolRoutes}
          safeRoutes={data.safeRoutes}
          layerVisibility={layerVisibility}
          heatmapPoints={heatmapPoints}
          heatmapLoading={heatmapLoading}
          heatmapError={heatmapError}
          heatmapInfo={heatmapInfo}
        />

        <section className="dashboard__panel hotspot-panel">
          <h2>Hotspot Intelligence</h2>
          <ul className="hotspot-list">
            {data.clusters.map((cluster) => (
              <li key={cluster.id}>
                <div>
                  <strong>{cluster.label}</strong>
                  <p>Dominant pattern: {cluster.primaryType}</p>
                </div>
                <code>{Math.round(cluster.score * 100)}% risk</code>
              </li>
            ))}
          </ul>
        </section>
      </section>

      <DashboardCharts predictionData={data.predictions?.nextWeek} incidentBreakdown={data.predictions?.byType} />

      <RoutePanel patrolRoutes={data.patrolRoutes} safeRoutes={data.safeRoutes} />

      <AlertsPanel alerts={data.alerts} />

      <IncidentList incidents={filteredIncidents.slice(0, 8)} />
    </main>
  );
};

export default Dashboard;






