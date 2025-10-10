import dayjs from "dayjs";
import { getSeverityBadgeClass } from "../utils/colorScale";

const IncidentList = ({ incidents, title = "Incident Feed", headingLevel = "h2" }) => {
  const HeadingTag = headingLevel;

  if (!incidents?.length) {
    return (
      <section className="dashboard__panel">
        <HeadingTag>{title}</HeadingTag>
        <p>No incidents match the selected filters.</p>
      </section>
    );
  }

  return (
    <section className="dashboard__panel">
      <HeadingTag>{title}</HeadingTag>
      <ul className="incident-list">
        {incidents.map((incident) => (
          <li key={incident.id}>
            <div className="incident-list__meta">
              <strong>{incident.location}</strong>
              <p>{incident.description}</p>
              <span>{dayjs(incident.date).format("MMM DD, YYYY HH:mm")}</span>
            </div>
            <div className="incident-list__tags">
              <span className="incident-tag">{incident.type}</span>
              <span className={getSeverityBadgeClass(incident.severity)}>{incident.severity}</span>
              {incident.isWomenSafety ? <span className="incident-tag incident-tag--accent">Women safety</span> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default IncidentList;
