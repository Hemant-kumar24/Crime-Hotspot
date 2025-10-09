const SEVERITY_COLORS = {
  high: "#ef4444",
  medium: "#f97316",
  low: "#22c55e",
};

export const getSeverityColor = (severity = "low") => {
  const key = severity.toLowerCase();
  return SEVERITY_COLORS[key] || SEVERITY_COLORS.low;
};

export const getHeatColor = (density = 0) => {
  if (density >= 0.85) return "#b91c1c";
  if (density >= 0.7) return "#f97316";
  if (density >= 0.5) return "#fbbf24";
  return "#22c55e";
};

export const getSeverityBadgeClass = (severity = "low") => {
  switch (severity.toLowerCase()) {
    case "high":
      return "badge badge--high";
    case "medium":
      return "badge badge--medium";
    default:
      return "badge badge--low";
  }
};
