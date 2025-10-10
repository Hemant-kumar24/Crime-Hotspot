const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs/promises");
const Papa = require("papaparse");

const dashboardOverview = async (_req, res) => {
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

const PYTHON_DIR = path.join(__dirname, "..", "..", "python");
const FORECAST_SCRIPT = path.join(PYTHON_DIR, "forecast_crime.py");
const DATASET_PATH = path.join(PYTHON_DIR, "crime_dataset.csv");

const pythonCandidates = [
  process.env.PYTHON_PATH,
  process.platform === "win32" ? "python" : "python3",
  process.platform === "win32" ? "py" : null,
].filter(Boolean);

const runForecastProcess = () =>
  new Promise((resolve, reject) => {
    const args = [FORECAST_SCRIPT];

    const attempt = (index = 0) => {
      if (index >= pythonCandidates.length) {
        reject(new Error("No python executable available for Prophet forecast"));
        return;
      }

      const command = pythonCandidates[index];
      const child = spawn(command, args, {
        cwd: PYTHON_DIR,
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
      });

      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });

      child.on("error", (error) => {
        if (error.code === "ENOENT") {
          attempt(index + 1);
        } else {
          reject(error);
        }
      });

      child.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(stderr || `Prophet script exited with code ${code}`));
        } else {
          resolve(stdout);
        }
      });
    };

    attempt();
  });

const parseCsvDataset = async () => {
  const raw = await fs.readFile(DATASET_PATH, "utf-8");
  const parsed = Papa.parse(raw, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data
    .map((row) => {
      const date = row.date ? new Date(row.date) : null;
      const lat = Number.parseFloat(row.lat ?? row.latitude);
      const lon = Number.parseFloat(row.lon ?? row.longitude);
      if (!date || Number.isNaN(date.getTime()) || !row.Area) return null;
      return {
        city: row.City || "Unknown",
        area: row.Area,
        date,
        lat: Number.isFinite(lat) ? lat : null,
        lon: Number.isFinite(lon) ? lon : null,
      };
    })
    .filter(Boolean);
};

const buildFallbackForecast = async () => {
  const entries = await parseCsvDataset();
  const byArea = new Map();

  entries.forEach(({ city, area, date, lat, lon }) => {
    const key = `${city}::${area}`;
    if (!byArea.has(key)) {
      byArea.set(key, {
        key,
        city,
        area,
        latitudes: lat != null ? [lat] : [],
        longitudes: lon != null ? [lon] : [],
        historyMap: new Map(),
      });
    }

    const record = byArea.get(key);
    const dayKey = date.toISOString().slice(0, 10);
    record.historyMap.set(dayKey, (record.historyMap.get(dayKey) || 0) + 1);
    if (lat != null) record.latitudes.push(lat);
    if (lon != null) record.longitudes.push(lon);
  });

  const horizonDays = 7;
  const areas = Array.from(byArea.values())
    .map((record) => {
      const history = Array.from(record.historyMap.entries())
        .map(([day, count]) => ({ date: day, count }))
        .sort((a, b) => (a.date > b.date ? 1 : -1));

      const lastDate = history.length ? new Date(history[history.length - 1].date) : new Date();
      const recentCounts = history.slice(-14).map((item) => item.count);
      const average = recentCounts.length
        ? recentCounts.reduce((acc, value) => acc + value, 0) / recentCounts.length
        : 0;

      const forecast = Array.from({ length: horizonDays }).map((_, index) => {
        const day = new Date(lastDate);
        day.setDate(day.getDate() + index + 1);
        const isoDate = day.toISOString().slice(0, 10);
        return {
          date: isoDate,
          prediction: Number(average.toFixed(3)),
          lower: Number(Math.max(0, average * 0.85).toFixed(3)),
          upper: Number((average * 1.15).toFixed(3)),
        };
      });

      const latitudes = record.latitudes.filter((value) => Number.isFinite(value));
      const longitudes = record.longitudes.filter((value) => Number.isFinite(value));

      return {
        key: record.key,
        city: record.city,
        area: record.area,
        lat: latitudes.length ? latitudes.reduce((acc, value) => acc + value, 0) / latitudes.length : null,
        lon: longitudes.length ? longitudes.reduce((acc, value) => acc + value, 0) / longitudes.length : null,
        history,
        forecast,
        next_week_total: Number(forecast.reduce((acc, item) => acc + item.prediction, 0).toFixed(3)),
      };
    })
    .sort((a, b) => b.next_week_total - a.next_week_total)
    .slice(0, 6);

  return {
    generated_at: new Date().toISOString(),
    fallback: true,
    areas,
    summary: {
      total_areas: areas.length,
      horizon_days: horizonDays,
      message: "Prophet forecast unavailable; returned averaged projections.",
    },
  };
};

const predictiveAnalysis = async (_req, res) => {
  try {
    const output = await runForecastProcess();
    const payload = JSON.parse(output || "{}");
    res.json(payload);
  } catch (error) {
    console.warn("Prophet forecast generation failed:", error.message);
    try {
      const fallback = await buildFallbackForecast();
      res.json(fallback);
    } catch (fallbackError) {
      console.error("Predictive fallback failed:", fallbackError.message);
      res.status(500).json({
        message: "Unable to compute predictive analysis",
        error: fallbackError.message,
      });
    }
  }
};

module.exports = {
  dashboardOverview,
  predictiveAnalysis,
};
