import DashboardFilters from "../../components/DashboardFilters";
import HeatmapFilterBar from "../../components/HeatmapFilterBar";
import DashboardMap from "../../components/DashboardMap";
import useDashboardContext from "../../hooks/useDashboardContext";

const DashboardHeatmap = () => {
  const {
    data,
    filters,
    handleFilterChange,
    layerVisibility,
    handleLayerToggle,
    availableTypes,
    filteredIncidents,
    heatmapFilters,
    heatmapMeta,
    handleHeatmapFilterChange,
    handleHeatmapReset,
    heatmapLoading,
    heatmapPoints,
    heatmapInfo,
    heatmapError,
    heatmapFallback,
  } = useDashboardContext();

  return (
    <div className="dashboard-section">
      <div className="dashboard-section__block">
        <h2 className="dashboard-section__title">Incident Filters</h2>
        <DashboardFilters
          filters={filters}
          onChange={handleFilterChange}
          layerVisibility={layerVisibility}
          onToggleLayer={handleLayerToggle}
          availableTypes={availableTypes}
        />
      </div>

      <div className="dashboard-section__block">
        <h2 className="dashboard-section__title">Heatmap Controls</h2>
        <HeatmapFilterBar
          filters={heatmapFilters}
          meta={heatmapMeta}
          onChange={handleHeatmapFilterChange}
          onReset={handleHeatmapReset}
          isLoading={heatmapLoading}
        />
      </div>

      <div className="dashboard-section__block">
        <div className="dashboard-map-heading">
          <h2 className="dashboard-section__title">Delhi Crime Heatmap</h2>
          {heatmapFallback ? <span className="dashboard-map-heading__badge">Offline Dataset</span> : null}
        </div>
        <p className="dashboard-map-heading__note">Explore spatial crime intensity across the city.</p>
        <div className="dashboard__content">
          <DashboardMap
            incidents={filteredIncidents}
            clusters={data.clusters}
            patrolRoutes={data.patrolRoutes}
            safeRoutes={data.safeRoutes}
            layerVisibility={layerVisibility}
            heatmapPoints={heatmapPoints}
            heatmapLoading={heatmapLoading}
            heatmapError={heatmapError}
            heatmapInfo={heatmapInfo}
          />

          <section className="dashboard__panel hotspot-panel">
            <h3>Hotspot Intelligence</h3>
            <ul className="hotspot-list">
              {data.clusters.map((cluster) => (
                <li key={cluster.id}>
                  <div>
                    <strong>{cluster.label}</strong>
                    <p>Dominant pattern: {cluster.primaryType}</p>
                  </div>
                  <code>{Math.round(cluster.score * 100)}% risk</code>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeatmap;
