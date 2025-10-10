import { NavLink } from "react-router-dom";

const DashboardSidebar = ({ links }) => {
  return (
    <aside className="dashboard-sidebar">
      <h2 className="dashboard-sidebar__title">Dashboard Features</h2>
      <nav className="dashboard-sidebar__nav" aria-label="Dashboard navigation">
        {links.map((link) => (
          <NavLink
            key={link.label}
            to={link.to}
            end={link.to === "."}
            className={({ isActive }) =>
              isActive ? "dashboard-sidebar__link dashboard-sidebar__link--active" : "dashboard-sidebar__link"
            }
          >
            <span className="dashboard-sidebar__link-text">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
