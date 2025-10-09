import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getSeverityBadgeClass } from "../utils/colorScale";

dayjs.extend(relativeTime);

const AlertsPanel = ({ alerts }) => {
  if (!alerts?.length) return null;

  return (
    <section className="dashboard__panel">
      <h2>Alerts & Notifications</h2>
      <ul>
        {alerts.map((alert) => (
          <li key={alert.id}>
            <div>
              <strong>{alert.message}</strong>
              <p>{dayjs(alert.timestamp).fromNow()}</p>
            </div>
            <span className={getSeverityBadgeClass(alert.severity)}>{alert.severity}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default AlertsPanel;
