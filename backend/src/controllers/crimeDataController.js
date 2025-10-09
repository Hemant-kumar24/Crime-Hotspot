const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs/promises");
const Papa = require("papaparse");

const PYTHON_DIR = path.join(__dirname, "..", "..", "python");
const SCRIPT_PATH = path.join(PYTHON_DIR, "process_crime_data.py");
const DATASET_PATH = path.join(PYTHON_DIR, "crime_dataset.csv");

const pythonCandidates = [
  process.env.PYTHON_PATH,
  process.platform === "win32" ? "python" : "python3",
  process.platform === "win32" ? "py" : null,
].filter(Boolean);

const runPythonProcess = (query) =>
  new Promise((resolve, reject) => {
    const args = [SCRIPT_PATH];
    if (query.date) {
      args.push("--date", query.date);
    }
    if (query.crime_type) {
      args.push("--crime_type", query.crime_type);
    }

    const attempt = (index = 0) => {
      if (index >= pythonCandidates.length) {
        reject(new Error("No python executable available"));
        return;
      }

      const command = pythonCandidates[index];
      const child = spawn(command, args, {
        cwd: PYTHON_DIR,
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
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
          reject(new Error(stderr || `Python script exited with code ${code}`));
        } else {
          resolve(stdout);
        }
      });
    };

    attempt();
  });

const normaliseRow = (row) => {
  const lat = Number.parseFloat(row.lat ?? row.latitude);
  const lon = Number.parseFloat(row.lon ?? row.longitude);
  const intensity = Number.parseFloat(row.intensity ?? row.density ?? 1);
  const date = row.date?.trim();
  const crimeType = row.crime_type?.trim() || row.crimeType || "Unknown";

  if (!Number.isFinite(lat) || !Number.isFinite(lon) || !date) {
    return null;
  }

  return {
    lat,
    lon,
    intensity: Number.isFinite(intensity) ? intensity : 1,
    date,
    crimeType,
  };
};

const buildMetaFromRows = (rows) => ({
  dates: Array.from(new Set(rows.map((row) => row.date))).sort(),
  crime_types: Array.from(new Set(rows.map((row) => row.crimeType))).sort(),
});

const aggregateRows = (rows) => {
  const grouped = new Map();

  rows.forEach((row) => {
    const key = `${row.lat}|${row.lon}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        lat: row.lat,
        lon: row.lon,
        count: 0,
        totalIntensity: 0,
        latestDate: row.date,
        typeCounts: new Map(),
      });
    }

    const entry = grouped.get(key);
    entry.count += 1;
    entry.totalIntensity += row.intensity;

    if (!entry.latestDate || row.date > entry.latestDate) {
      entry.latestDate = row.date;
    }

    entry.typeCounts.set(row.crimeType, (entry.typeCounts.get(row.crimeType) || 0) + 1);
  });

  const maxCount = Array.from(grouped.values()).reduce(
    (acc, item) => Math.max(acc, item.count),
    0
  ) || 1;

  return Array.from(grouped.values()).map((entry) => {
    const dominant = Array.from(entry.typeCounts.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0];

    return {
      lat: entry.lat,
      lon: entry.lon,
      count: entry.count,
      avg_intensity: Number((entry.totalIntensity / entry.count).toFixed(3)),
      normalized_count: Number((entry.count / maxCount).toFixed(3)),
      date: entry.latestDate,
      crime_type: dominant ? dominant[0] : "Unknown",
    };
  });
};

const fallbackAggregate = async (query) => {
  const csvRaw = await fs.readFile(DATASET_PATH, "utf-8");
  const parsed = Papa.parse(csvRaw, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  const allRows = parsed.data.map(normaliseRow).filter(Boolean);
  const meta = buildMetaFromRows(allRows);
  let workingRows = allRows;

  if (query.date) {
    workingRows = workingRows.filter((row) => row.date === query.date);
  }
  if (query.crime_type) {
    workingRows = workingRows.filter(
      (row) => row.crimeType.toLowerCase() === query.crime_type.toLowerCase()
    );
  }

    if (!workingRows.length) {
    workingRows = [];
  }

  return {
    points: aggregateRows(workingRows),
    meta,
    fallback: true,
  };
};

const getCrimeData = async (req, res) => {
  try {
    const output = await runPythonProcess(req.query);
    const payload = JSON.parse(output || "{}");
    res.json(payload);
  } catch (error) {
    console.warn("Crime data aggregation error (Python path issue?):", error.message);
    try {
      const fallback = await fallbackAggregate(req.query);
      res.json({
        ...fallback,
        message:
          "Python aggregation unavailable. Served cached dataset from Delhi snapshot.",
      });
    } catch (fallbackError) {
      console.error("Crime data fallback error:", fallbackError.message);
      res.status(500).json({
        message: "Failed to aggregate crime data",
        error: fallbackError.message,
        hint: "Ensure Python dependencies are installed or install papaparse fallback.",
      });
    }
  }
};

module.exports = {
  getCrimeData,
};
