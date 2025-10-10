import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import DashboardHeatmap from "./pages/dashboard/DashboardHeatmap";
import DashboardAnalytics from "./pages/dashboard/DashboardAnalytics";
import DashboardRoutes from "./pages/dashboard/DashboardRoutes";
import DashboardAlerts from "./pages/dashboard/DashboardAlerts";
import DashboardIncidents from "./pages/dashboard/DashboardIncidents";
import DashboardPredictive from "./pages/dashboard/DashboardPredictive";
import DashboardReport from "./pages/dashboard/DashboardReport";
import "./styles/theme.css";
import "./styles/layout.css";

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className={isAuthenticated ? "app app--authed" : "app"}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverview />} />
          <Route path="heatmap" element={<DashboardHeatmap />} />
          <Route path="analytics" element={<DashboardAnalytics />} />
          <Route path="routes" element={<DashboardRoutes />} />
          <Route path="alerts" element={<DashboardAlerts />} />
          <Route path="incidents" element={<DashboardIncidents />} />
          <Route path="predictive" element={<DashboardPredictive />} />
          <Route path="report" element={<DashboardReport />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
