const MetricCards = ({ metrics }) => {
  if (!metrics) return null;

  const { totalIncidents, weeklyTrend, hotspotsTracked, patrolRoutesSuggested, responseTimeImprovement } = metrics;

  return (
    <section className="dashboard__metrics">
      <div className="metric-card">
        <span>Total Incidents (YTD)</span>
        <strong>{totalIncidents}</strong>
      </div>
      <div className="metric-card">
        <span>Weekly Trend</span>
        <strong>{weeklyTrend}%</strong>
      </div>
      <div className="metric-card">
        <span>Hotspots Tracked</span>
        <strong>{hotspotsTracked}</strong>
      </div>
      <div className="metric-card">
        <span>Patrol Routes Suggested</span>
        <strong>{patrolRoutesSuggested}</strong>
      </div>
      <div className="metric-card">
        <span>Response Time Improvement</span>
        <strong>{responseTimeImprovement}%</strong>
      </div>
    </section>
  );
};

export default MetricCards;
