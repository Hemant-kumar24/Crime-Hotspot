const RoutePanel = ({ patrolRoutes, safeRoutes }) => {
  return (
    <section className="dashboard__panel">
      <h2>Route Intelligence</h2>
      <div className="route-grid">
        {patrolRoutes?.length ? (
          <article className="route-card">
            <header>
              <h3>Patrol Routes</h3>
              <p>Optimised paths covering priority hotspots</p>
            </header>
            <ul>
              {patrolRoutes.map((route) => (
                <li key={route.id}>
                  <div>
                    <strong>{route.name}</strong>
                    <p>Priority: {route.priority.toUpperCase()}</p>
                  </div>
                  <code>{route.coverage}% coverage</code>
                </li>
              ))}
            </ul>
          </article>
        ) : null}

        {safeRoutes?.length ? (
          <article className="route-card">
            <header>
              <h3>Safe Routes</h3>
              <p>Recommended corridors for civilian travel</p>
            </header>
            <ul>
              {safeRoutes.map((route) => (
                <li key={route.id}>
                  <div>
                    <strong>{route.name}</strong>
                    <p>Risk index derived from women safety layer</p>
                  </div>
                  <code>{Math.round(route.riskScore * 100)}% risk</code>
                </li>
              ))}
            </ul>
          </article>
        ) : null}
      </div>
    </section>
  );
};

export default RoutePanel;
