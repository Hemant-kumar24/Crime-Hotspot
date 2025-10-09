import dayjs from "dayjs";
import classNames from "classnames";

const DashboardFilters = ({ filters, onChange, layerVisibility, onToggleLayer, availableTypes }) => {
  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    onChange(name, type === "checkbox" ? checked : value);
  };

  return (
    <section className="dashboard__filters">
      <div className="filter-group">
        <label htmlFor="type">Crime Type</label>
        <select id="type" name="type" value={filters.type} onChange={handleInputChange}>
          <option value="all">All categories</option>
          {availableTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group filter-group--date">
        <label htmlFor="startDate">From</label>
        <input
          id="startDate"
          name="startDate"
          type="date"
          max={filters.endDate}
          value={filters.startDate}
          onChange={handleInputChange}
        />
      </div>

      <div className="filter-group filter-group--date">
        <label htmlFor="endDate">To</label>
        <input
          id="endDate"
          name="endDate"
          type="date"
          min={filters.startDate}
          max={dayjs().format("YYYY-MM-DD")}
          value={filters.endDate}
          onChange={handleInputChange}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="severity">Severity</label>
        <select id="severity" name="severity" value={filters.severity} onChange={handleInputChange}>
          <option value="all">All levels</option>
          <option value="high">High priority</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="filter-group filter-group--checkbox">
        <label htmlFor="onlyWomenSafety">Women Safety Layer</label>
        <input
          id="onlyWomenSafety"
          name="onlyWomenSafety"
          type="checkbox"
          checked={filters.onlyWomenSafety}
          onChange={handleInputChange}
        />
      </div>

      <div className="filter-group filter-group--layers">
        {Object.entries(layerVisibility).map(([layerKey, isActive]) => (
          <button
            key={layerKey}
            type="button"
            className={classNames("layer-toggle", { "layer-toggle--active": isActive })}
            onClick={() => onToggleLayer(layerKey)}
          >
            {layerKey === "heatmap" && "Heatmap"}
            {layerKey === "clusters" && "Hotspot Clusters"}
            {layerKey === "patrol" && "Patrol Routes"}
            {layerKey === "safe" && "Safe Routes"}
            {layerKey === "womenSafety" && "Women Safety"}
          </button>
        ))}
      </div>
    </section>
  );
};

export default DashboardFilters;
