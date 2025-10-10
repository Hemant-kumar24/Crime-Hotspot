import DashboardCharts from "../../components/DashboardCharts";
import useDashboardContext from "../../hooks/useDashboardContext";

const DashboardAnalytics = () => {
  const { data } = useDashboardContext();

  return (
    <div className="dashboard-section">
      <section className="dashboard-section__block">
        <h2 className="dashboard-section__title">Predictive Analytics</h2>
        <DashboardCharts predictionData={data.predictions?.nextWeek} incidentBreakdown={data.predictions?.byType} />
      </section>
    </div>
  );
};

export default DashboardAnalytics;
