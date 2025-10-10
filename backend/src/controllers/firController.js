const path = require("path");
const fs = require("fs/promises");
const Papa = require("papaparse");

const DATASET_PATH = path.join(__dirname, "..", "..", "python", "crime_dataset.csv");

const CSV_HEADERS = ["City", "Area", "lat", "lon", "crime_type", "date", "time", "intensity"];

const normaliseNumber = (value) => {
  if (value === undefined || value === null || value === "") return "";
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : "";
};

const buildRowArray = (entry) =>
  CSV_HEADERS.map((key) => {
    if (key === "lat" || key === "lon") {
      const value = entry[key] ?? "";
      return value === "" ? "" : Number.parseFloat(value);
    }
    if (key === "intensity") {
      const value = Number.parseFloat(entry[key]);
      return Number.isFinite(value) ? Number(value.toFixed(3)) : 0.6;
    }
    return entry[key] ?? "";
  });

const appendRowsToDataset = async (rows) => {
  if (!rows.length) return;
  const arrays = rows.map(buildRowArray);
  const csvChunk = Papa.unparse(arrays, { header: false });
  const prefix = "\n";
  await fs.appendFile(DATASET_PATH, `${prefix}${csvChunk}`);
};

const createFirEntry = async (req, res) => {
  const {
    victimAge,
    gender,
    district,
    zone,
    street,
    colony,
    crimeType,
    incidentDate,
    incidentTime,
    intensity,
    latitude,
    longitude,
  } = req.body ?? {};

  const requiredFields = { victimAge, gender, district, zone, street, colony, crimeType };
  const missing = Object.entries(requiredFields)
    .filter(([, value]) => value === undefined || value === null || value === "")
    .map(([key]) => key);

  if (missing.length) {
    res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
    return;
  }

  const city = district || "Delhi";
  const areaParts = [colony, street].filter(Boolean);
  const area = areaParts.length ? areaParts.join(", ") : zone || "Unknown Area";
  const date = incidentDate || new Date().toISOString().slice(0, 10);
  const time = incidentTime || new Date().toISOString().slice(11, 16);
  const normalizedIntensity = intensity ? Number.parseFloat(intensity) : 0.6;

  const csvRow = {
    City: city,
    Area: area,
    lat: normaliseNumber(latitude),
    lon: normaliseNumber(longitude),
    crime_type: crimeType,
    date,
    time,
    intensity: Number.isFinite(normalizedIntensity) ? normalizedIntensity : 0.6,
  };

  try {
    const csvLine = Papa.unparse([buildRowArray(csvRow)], { header: false });
    await fs.appendFile(DATASET_PATH, `\n${csvLine}`);

    res.status(201).json({
      message: "FIR recorded and dataset updated",
      entry: {
        ...csvRow,
        victimAge,
        gender,
        zone,
      },
    });
  } catch (error) {
    console.error("Failed to append FIR to dataset:", error);
    res.status(500).json({ message: "Failed to record FIR", error: error.message });
  }
};

const uploadFirDataset = async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: "CSV file is required" });
    return;
  }

  try {
    const CSVText = req.file.buffer.toString("utf-8");
    const parsed = Papa.parse(CSVText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
    });

    if (parsed.errors?.length) {
      res.status(400).json({ message: "Failed to parse CSV file", errors: parsed.errors });
      return;
    }

    const rows = parsed.data
      .map((row) => ({
        City: row.city || row.district || "Unknown",
        Area: row.area || row.colony || row.street || "Unknown Area",
        lat: normaliseNumber(row.lat ?? row.latitude),
        lon: normaliseNumber(row.lon ?? row.longitude),
        crime_type: row.crime_type || row.offence || "General",
        date: row.date || new Date().toISOString().slice(0, 10),
        time: row.time || "00:00",
        intensity: row.intensity || row.severity || 0.6,
      }))
      .filter((row) => row.City && row.Area && row.date);

    if (!rows.length) {
      res.status(400).json({ message: "No valid rows detected in uploaded CSV" });
      return;
    }

    await appendRowsToDataset(rows);

    res.status(201).json({
      message: `${rows.length} records ingested into dataset`,
      totalRows: rows.length,
    });
  } catch (error) {
    console.error("CSV ingest failed:", error);
    res.status(500).json({ message: "Failed to process dataset", error: error.message });
  }
};

module.exports = {
  createFirEntry,
  uploadFirDataset,
};
