import AlertsPanel from "../../components/AlertsPanel";
import useDashboardContext from "../../hooks/useDashboardContext";

const DashboardAlerts = () => {
  const { data } = useDashboardContext();

  return (
    <div className="dashboard-section">
      <section className="dashboard-section__block">
        <h2 className="dashboard-section__title">Active Alerts</h2>
        <AlertsPanel alerts={data.alerts} />
      </section>
    </div>
  );
};

export default DashboardAlerts;
