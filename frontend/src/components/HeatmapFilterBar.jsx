const HeatmapFilterBar = ({ filters, meta, onChange, onReset, isLoading }) => {
  const handleSelect = (event) => {
    const { name, value } = event.target;
    onChange(name, value);
  };

  return (
    <section className="heatmap-filters">
      <div className="filter-group">
        <label htmlFor="heatmap-date">Date</label>
        <select
          id="heatmap-date"
          name="date"
          value={filters.date}
          onChange={handleSelect}
          disabled={!meta.dates.length}
        >
          <option value="">All Dates</option>
          {meta.dates.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="heatmap-crime-type">Crime Type</label>
        <select
          id="heatmap-crime-type"
          name="crimeType"
          value={filters.crimeType}
          onChange={handleSelect}
          disabled={!meta.crime_types.length}
        >
          <option value="">All Types</option>
          {meta.crime_types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <button type="button" className="btn btn--secondary heatmap-reset" onClick={onReset} disabled={isLoading}>
        Reset Filters
      </button>
    </section>
  );
};

export default HeatmapFilterBar;
