import IncidentList from "../../components/IncidentList";
import useDashboardContext from "../../hooks/useDashboardContext";

const DashboardIncidents = () => {
  const { filteredIncidents } = useDashboardContext();
  const totalIncidents = filteredIncidents.length;

  return (
    <div className="dashboard-section">
      <section className="dashboard-section__block">
        <h2 className="dashboard-section__title">Incident Reports</h2>
        <p className="dashboard-section__note">
          {totalIncidents > 0
            ? `Showing ${totalIncidents} incident${totalIncidents === 1 ? "" : "s"} based on the current filters.`
            : "No incidents match the selected filters."}
        </p>
        <IncidentList incidents={filteredIncidents} headingLevel="h3" />
      </section>
    </div>
  );
};

export default DashboardIncidents;
