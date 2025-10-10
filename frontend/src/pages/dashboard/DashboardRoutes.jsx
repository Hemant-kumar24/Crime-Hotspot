import RoutePanel from "../../components/RoutePanel";
import useDashboardContext from "../../hooks/useDashboardContext";

const DashboardRoutes = () => {
  const { data } = useDashboardContext();

  return (
    <div className="dashboard-section">
      <section className="dashboard-section__block">
        <h2 className="dashboard-section__title">Patrol &amp; Safe Routes</h2>
        <RoutePanel patrolRoutes={data.patrolRoutes} safeRoutes={data.safeRoutes} />
      </section>
    </div>
  );
};

export default DashboardRoutes;
