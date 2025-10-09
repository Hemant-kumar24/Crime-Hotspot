const dashboardOverview = async (_req, res) => {
  // Placeholder data while the predictive models are under development.
  const response = {
    metrics: {
      totalIncidents: 1280,
      weeklyTrend: 8.5,
      hotspotsTracked: 12,
      patrolRoutesSuggested: 5,
    },
    hotspots: [
      { id: 1, name: "Sector 12 Market", confidence: 0.82 },
      { id: 2, name: "Bus Stand Central", confidence: 0.76 },
      { id: 3, name: "Old Town Square", confidence: 0.71 },
    ],
    upcomingAlerts: [
      { id: 101, message: "Increase patrol during festival weekend", severity: "high" },
      { id: 102, message: "Monitor theft cases in residential blocks", severity: "medium" },
    ],
  };

  res.json(response);
};

module.exports = {
  dashboardOverview,
};
