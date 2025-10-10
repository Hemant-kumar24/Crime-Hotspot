import MetricCards from "../../components/MetricCards";
import useDashboardContext from "../../hooks/useDashboardContext";

const DashboardOverview = () => {
  const { data } = useDashboardContext();
  const clusters = data.clusters ?? [];

  return (
    <div className="dashboard-section">
      <section className="dashboard-section__block">
        <h2 className="dashboard-section__title">Key Metrics</h2>
        <MetricCards metrics={data.metrics} />
      </section>

      <section className="dashboard-section__block">
        <h2 className="dashboard-section__title">Hotspot Intelligence</h2>
        <div className="dashboard__panel hotspot-panel">
          <ul className="hotspot-list">
            {clusters.map((cluster) => (
              <li key={cluster.id}>
                <div>
                  <strong>{cluster.label}</strong>
                  <p>Dominant pattern: {cluster.primaryType}</p>
                </div>
                <code>{Math.round(cluster.score * 100)}% risk</code>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default DashboardOverview;
