import { useState } from "react";
import api from "../../services/api";
import useDashboardContext from "../../hooks/useDashboardContext";

const initialForm = {
  victimAge: "",
  gender: "",
  district: "",
  zone: "",
  street: "",
  colony: "",
  crimeType: "",
  incidentDate: "",
  incidentTime: "",
  intensity: "",
  latitude: "",
  longitude: "",
};

const DashboardReport = () => {
  const { hydrateDashboard, refreshHeatmap } = useDashboardContext();
  const [formState, setFormState] = useState(initialForm);
  const [formStatus, setFormStatus] = useState({ type: "", message: "" });
  const [formLoading, setFormLoading] = useState(false);

  const [csvStatus, setCsvStatus] = useState({ type: "", message: "" });
  const [csvLoading, setCsvLoading] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormLoading(true);
    setFormStatus({ type: "", message: "" });

    try {
      await api.post("/fir", formState);
      setFormStatus({ type: "success", message: "FIR recorded and datasets updated." });
      setFormState(initialForm);
      hydrateDashboard?.();
      refreshHeatmap?.();
    } catch (error) {
      setFormStatus({
        type: "error",
        message: error.response?.data?.message || "Failed to submit FIR.",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleCsvUpload = async (event) => {
    event.preventDefault();
    const file = event.target.elements.csvFile?.files?.[0];
    if (!file) {
      setCsvStatus({ type: "error", message: "Please choose a CSV file to upload." });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setCsvLoading(true);
    setCsvStatus({ type: "", message: "" });

    try {
      const response = await api.post("/fir/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCsvStatus({
        type: "success",
        message: response.data?.message || "Dataset ingested successfully.",
      });
      event.target.reset();
      hydrateDashboard?.();
      refreshHeatmap?.();
    } catch (error) {
      setCsvStatus({
        type: "error",
        message: error.response?.data?.message || "Failed to process CSV upload.",
      });
    } finally {
      setCsvLoading(false);
    }
  };

  return (
    <div className="dashboard-section">
      <section className="dashboard-section__block">
        <h2 className="dashboard-section__title">File a Report</h2>
        <p className="dashboard-section__note">
          Submit a single FIR or ingest bulk incident records to immediately refresh predictive models and heatmaps.
        </p>
      </section>

      <section className="dashboard-section__block">
        <h3 className="dashboard-section__title">Single FIR Entry</h3>
        <p className="dashboard-section__note">Provide victim and location details. Latitude/longitude are optional but improve map accuracy.</p>
        <form className="fir-form" onSubmit={handleSubmit}>
          <div className="fir-form__grid">
            <label>
              Victim Age
              <input name="victimAge" type="number" min="0" value={formState.victimAge} onChange={handleInputChange} required />
            </label>
            <label>
              Gender
              <select name="gender" value={formState.gender} onChange={handleInputChange} required>
                <option value="">Select</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              District
              <input name="district" value={formState.district} onChange={handleInputChange} required />
            </label>
            <label>
              Zone
              <input name="zone" value={formState.zone} onChange={handleInputChange} required />
            </label>
            <label>
              Street
              <input name="street" value={formState.street} onChange={handleInputChange} required />
            </label>
            <label>
              Colony
              <input name="colony" value={formState.colony} onChange={handleInputChange} required />
            </label>
            <label>
              Crime Type
              <input name="crimeType" value={formState.crimeType} onChange={handleInputChange} placeholder="e.g., Theft" required />
            </label>
            <label>
              Incident Date
              <input name="incidentDate" type="date" value={formState.incidentDate} onChange={handleInputChange} />
            </label>
            <label>
              Incident Time
              <input name="incidentTime" type="time" value={formState.incidentTime} onChange={handleInputChange} />
            </label>
            <label>
              Intensity (0 - 1)
              <input
                name="intensity"
                type="number"
                min="0"
                max="1"
                step="0.05"
                value={formState.intensity}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Latitude
              <input name="latitude" type="number" step="0.0001" value={formState.latitude} onChange={handleInputChange} />
            </label>
            <label>
              Longitude
              <input name="longitude" type="number" step="0.0001" value={formState.longitude} onChange={handleInputChange} />
            </label>
          </div>

          <button className="fir-form__submit" type="submit" disabled={formLoading}>
            {formLoading ? "Submitting..." : "Submit FIR"}
          </button>
          {formStatus.message ? (
            <p className={formStatus.type === "error" ? "form-feedback form-feedback--error" : "form-feedback form-feedback--success"}>
              {formStatus.message}
            </p>
          ) : null}
        </form>
      </section>

      <section className="dashboard-section__block">
        <h3 className="dashboard-section__title">Bulk Dataset Upload</h3>
        <p className="dashboard-section__note">
          Upload a CSV file containing columns such as city, area, lat, lon, crime_type, date, time, intensity. Incoming rows append to the master dataset.
        </p>
        <form className="fir-form fir-form--upload" onSubmit={handleCsvUpload}>
          <label className="fir-form__file">
            <span>CSV File</span>
            <input type="file" name="csvFile" accept=".csv" />
          </label>
          <button className="fir-form__submit" type="submit" disabled={csvLoading}>
            {csvLoading ? "Uploading..." : "Upload Dataset"}
          </button>
          {csvStatus.message ? (
            <p className={csvStatus.type === "error" ? "form-feedback form-feedback--error" : "form-feedback form-feedback--success"}>
              {csvStatus.message}
            </p>
          ) : null}
        </form>
      </section>
    </div>
  );
};

export default DashboardReport;
