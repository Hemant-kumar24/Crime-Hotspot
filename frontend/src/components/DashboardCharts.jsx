import dayjs from "dayjs";
import {
  Area, LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  ReferenceLine,
} from "recharts";

const DashboardCharts = ({ predictionData, incidentBreakdown }) => {
  if (!predictionData || !incidentBreakdown) return null;

  const forecastTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="chart-tooltip">
        <p>{dayjs(label).format("ddd, MMM DD")}</p>
        <p>
          <span className="chart-tooltip__dot chart-tooltip__dot--primary" />
          {payload[0].value} projected incidents
        </p>
      </div>
    );
  };

  const breakdownTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const item = payload[0];
    return (
      <div className="chart-tooltip">
        <p>{item.payload.type}</p>
        <p>
          <span className="chart-tooltip__dot chart-tooltip__dot--secondary" />
          {item.value} incidents
        </p>
      </div>
    );
  };

  return (
    <section className="dashboard__analytics">
      <article className="analytics-card">
        <header>
          <h3>7-Day Incident Forecast</h3>
          <p>Time-series projection based on ARIMA prototype</p>
        </header>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={predictionData} margin={{ top: 12, left: 0, right: 20, bottom: 0 }}>
            <defs>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 8" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => dayjs(value).format("MMM DD")}
              tick={{ fill: "#475467", fontSize: 12 }}
              axisLine={{ stroke: "#cbd5f5" }}
            />
            <YAxis
              tick={{ fill: "#475467", fontSize: 12 }}
              width={50}
              allowDecimals={false}
              axisLine={{ stroke: "#cbd5f5" }}
            />
            <Tooltip content={forecastTooltip} />
            <ReferenceLine y={predictionData[0]?.incidents ?? 0} stroke="#94a3b8" strokeDasharray="4 6" />
            <Line
              type="monotone"
              dataKey="incidents"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 5, fill: "#2563eb", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              fill="url(#forecastGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      </article>

      <article className="analytics-card">
        <header>
          <h3>Hotspot Crime Composition</h3>
          <p>Incidents clustered by crime type for the current sprint</p>
        </header>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={incidentBreakdown} margin={{ top: 12, left: 0, right: 12, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 8" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="type" tick={{ fill: "#475467", fontSize: 12 }} axisLine={{ stroke: "#cbd5f5" }} />
            <YAxis tick={{ fill: "#475467", fontSize: 12 }} width={50} allowDecimals={false} axisLine={{ stroke: "#cbd5f5" }} />
            <Tooltip content={breakdownTooltip} />
            <Legend />
            <Bar
              dataKey="value"
              fill="#9333ea"
              radius={[10, 10, 0, 0]}
              label={{ position: "top", fill: "#1e1b4b", fontSize: 12 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </article>
    </section>
  );
};

export default DashboardCharts;



