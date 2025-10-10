import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import api from "../../services/api";
import PredictiveMap from "../../components/PredictiveMap";

const DashboardPredictive = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [selectedAreaKey, setSelectedAreaKey] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const response = await api.get("/dashboard/predictive");
        if (!isMounted) return;
        const payload = response.data;
        setAnalysis(payload);
        const firstArea = payload?.areas?.[0];
        setSelectedAreaKey(firstArea?.key || "");
        setError("");
      } catch (fetchError) {
        console.error("Failed to load predictive analysis", fetchError);
        if (!isMounted) return;
        setError(fetchError.response?.data?.message || "Unable to load predictive analysis");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAnalysis();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedArea = useMemo(() => {
    if (!analysis?.areas?.length) return null;
    return analysis.areas.find((area) => area.key === selectedAreaKey) ?? analysis.areas[0];
  }, [analysis, selectedAreaKey]);

  const lineChartData = useMemo(() => {
    if (!selectedArea) return [];
    const historyPoints = (selectedArea.history || []).map((point) => ({
      date: point.date,
      actual: point.count,
      forecast: null,
      isFuture: false,
    }));
    const forecastPoints = (selectedArea.forecast || []).map((point) => ({
      date: point.date,
      actual: null,
      forecast: point.prediction,
      isFuture: true,
    }));
    return [...historyPoints, ...forecastPoints].slice(-28);
  }, [selectedArea]);

  const barChartData = useMemo(() => {
    if (!analysis?.areas?.length) return [];
    return analysis.areas
      .map((area) => ({
        key: area.key,
        label: area.area,
        total: Number(area.next_week_total ?? 0),
      }))
      .sort((a, b) => b.total - a.total);
  }, [analysis]);

  const headline = selectedArea
    ? `${selectedArea.area}, ${selectedArea.city}`
    : "Forecast unavailable";

  return (
    <div className="dashboard-section">
      <section className="dashboard-section__block">
        <div className="dashboard-section__title-row">
          <h2 className="dashboard-section__title">Predictive Crime Outlook</h2>
          {analysis?.fallback ? <span className="dashboard-map-heading__badge">Model fallback</span> : null}
        </div>
        <p className="dashboard-section__note">
          Machine learning forecasts using Prophet highlight the next seven days of crime frequency for each major area.
        </p>
        {error ? <div className="alert alert--error">{error}</div> : null}
      </section>

      <section className="dashboard-section__block">
        <h3 className="dashboard-section__title">Forecast Map</h3>
        {loading ? <p>Loading predictive hotspots...</p> : <PredictiveMap areas={analysis?.areas || []} />}
      </section>

      <section className="dashboard-section__block">
        <div className="predictive-toolbar">
          <div>
            <h3 className="dashboard-section__title">{headline}</h3>
            <p className="dashboard-section__note">
              Historical trend versus Prophet forecast for the upcoming week. Hover for exact projections.
            </p>
          </div>
          <div className="predictive-toolbar__controls">
            <label htmlFor="predictive-area">Focus area</label>
            <select
              id="predictive-area"
              value={selectedArea?.key || ""}
              onChange={(event) => setSelectedAreaKey(event.target.value)}
              disabled={loading || !analysis?.areas?.length}
            >
              {!analysis?.areas?.length ? <option value="">No areas available</option> : null}
              {analysis?.areas?.map((area) => (
                <option key={area.key} value={area.key}>
                  {area.area} ({Math.round(area.next_week_total || 0)} forecast incidents)
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="predictive-charts">
          <div className="predictive-chart predictive-chart--line">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(value) => dayjs(value).format("MMM DD")} />
                <YAxis allowDecimals={false} />
                <Tooltip
                  labelFormatter={(value) => dayjs(value).format("dddd, MMM DD")}
                  formatter={(value, key) => [
                    Math.round(value || 0),
                    key === "actual" ? "Recorded" : "Forecast",
                  ]}
                />
                <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={2} dot={false} name="Recorded" />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#ef4444"
                  strokeDasharray="5 6"
                  strokeWidth={2}
                  dot={false}
                  name="Forecast"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="predictive-chart predictive-chart--bar">
            <h4>Next 7 days by area</h4>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" interval={0} angle={-20} textAnchor="end" height={80} />
                <YAxis allowDecimals={false} />
                <Tooltip
                  formatter={(value) => [Math.round(value || 0), "Projected incidents"]}
                  labelFormatter={(value) => value}
                />
                <Bar dataKey="total" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPredictive;
