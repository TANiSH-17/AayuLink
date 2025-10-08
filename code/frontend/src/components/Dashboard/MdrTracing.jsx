import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  CheckCircle,
  Search,
  RefreshCcw,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ----------------------------
// Reusable components
// ----------------------------
const Card = ({ title, icon: Icon, children }) => (
  <motion.section
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
  >
    <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-blue-50 rounded-t-2xl">
      {Icon && <Icon className="w-5 h-5 text-teal-700" />}
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </motion.section>
);

const Button = ({ icon: Icon, children, variant = "primary", ...props }) => {
  const styles = {
    primary:
      "bg-gradient-to-r from-teal-600 to-blue-600 text-white hover:from-teal-700 hover:to-blue-700",
    secondary:
      "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200",
  };
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      {...props}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${styles[variant]}`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </motion.button>
  );
};

const RiskBadge = ({ score }) => {
  const colorMap = {
    high: "bg-red-100 text-red-800 border-red-300",
    medium: "bg-orange-100 text-orange-800 border-orange-300",
    low: "bg-yellow-100 text-yellow-800 border-yellow-300",
    safe: "bg-green-100 text-green-800 border-green-300",
  };
  const getColor = () =>
    score > 75
      ? colorMap.high
      : score > 50
      ? colorMap.medium
      : score > 25
      ? colorMap.low
      : colorMap.safe;
  return (
    <span
      className={`px-2.5 py-1 text-sm font-semibold rounded-full border ${getColor()}`}
    >
      {score}%
    </span>
  );
};

const Recommendation = ({ recommendation, onScheduleScreening }) => {
  if (!recommendation)
    return (
      <span className="text-xs text-gray-500">
        No specific action required.
      </span>
    );

  const colorMap = {
    CRITICAL: "bg-red-100 text-red-800",
    HIGH: "bg-orange-100 text-orange-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    LOW: "bg-gray-100 text-gray-800",
  };

  return (
    <div className={`p-3 rounded-lg ${colorMap[recommendation.level]}`}>
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-5 w-5 mt-0.5" />
        <div>
          <p className="font-bold text-sm capitalize">
            {recommendation.action.replace("_", " ")}
          </p>
          <p className="text-xs">{recommendation.message}</p>
          <Button
            variant="primary"
            className="mt-2 text-xs px-3 py-1"
            onClick={onScheduleScreening}
          >
            Schedule Screening
          </Button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------
// Main Component
// ----------------------------
export default function MdrTracing({ patientData, currentUser }) {
  const abhaId = patientData?.abhaId;

  const [mdrStatus, setMdrStatus] = useState(
    patientData?.mdr?.status || "unknown"
  );
  const [pathogen, setPathogen] = useState(patientData?.mdr?.pathogen || "");
  const [detectedAt, setDetectedAt] = useState(
    patientData?.mdr?.detectedAt
      ? new Date(patientData.mdr.detectedAt).toISOString().slice(0, 16)
      : ""
  );
  const [move, setMove] = useState({
    hospitalId: currentUser?.hospitalName || "",
    ward: "",
    bed: "",
    start: "",
    end: "",
  });
  const [windowDays, setWindowDays] = useState(7);
  const [exposures, setExposures] = useState([]);
  const [screenings, setScreenings] = useState(patientData?.screenings || []);
  const [isLoadingExposures, setIsLoadingExposures] = useState(false);
  const [message, setMessage] = useState("");

  const notify = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3500);
  };

  useEffect(() => {
    setScreenings(patientData?.screenings || []);
    setMdrStatus(patientData?.mdr?.status || "unknown");
    setPathogen(patientData?.mdr?.pathogen || "");
    setDetectedAt(
      patientData?.mdr?.detectedAt
        ? new Date(patientData.mdr.detectedAt).toISOString().slice(0, 16)
        : ""
    );
    setExposures([]);
  }, [patientData]);

  const refreshScreenings = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/mdr/${abhaId}/screenings`);
      setScreenings(res.data?.screenings || []);
      notify("Screenings refreshed.");
    } catch (err) {
      notify("Failed to refresh screenings.");
    }
  };

  const saveMdr = async () => {
    try {
      await axios.post(`${API_URL}/api/mdr/${abhaId}/mark`, {
        status: mdrStatus,
        pathogen,
        detectedAt: detectedAt || new Date().toISOString(),
      });
      notify("MDR status saved.");
    } catch {
      notify("Failed to save MDR status.");
    }
  };

  const saveMovement = async () => {
    if (!move.hospitalId || !move.ward || !move.start)
      return notify("hospitalId, ward, and start are required.");
    try {
      await axios.post(`${API_URL}/api/mdr/${abhaId}/movement`, move);
      notify("Movement saved.");
      setMove({ ...move, ward: "", bed: "", start: "", end: "" });
    } catch {
      notify("Failed to save movement.");
    }
  };

  const runExposures = async () => {
    setIsLoadingExposures(true);
    setExposures([]);
    try {
      const res = await axios.get(`${API_URL}/api/mdr/${abhaId}/exposures`, {
        params: { windowDays },
      });
      const data = res.data?.exposures || [];
      data.sort((a, b) => b.riskScore - a.riskScore);
      setExposures(data);
      notify(
        data.length === 0
          ? "No exposures found for selected window."
          : `Found ${data.length} potential exposures.`
      );
    } catch {
      notify("Failed to compute exposures.");
    } finally {
      setIsLoadingExposures(false);
    }
  };

  const addScreening = async (otherAbhaId) => {
    try {
      const res = await axios.post(`${API_URL}/api/mdr/${otherAbhaId}/screening`, {
        type: "swab",
        result: "pending",
      });
      notify("Screening scheduled (pending).");
      if (otherAbhaId === abhaId) setScreenings(res.data?.screenings || []);
    } catch {
      notify("Failed to add screening.");
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex items-center gap-3">
        <Activity className="h-6 w-6 text-teal-700" />
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
          MDR Tracing Dashboard
        </h2>
      </header>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-md p-3 border text-sm ${
            /fail|error|forbidden/i.test(message)
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-green-50 text-green-700 border-green-200"
          }`}
        >
          {message}
        </motion.div>
      )}

      <Card title="MDR Status" icon={CheckCircle}>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Status</label>
            <select
              className="w-full border rounded-md p-2"
              value={mdrStatus}
              onChange={(e) => setMdrStatus(e.target.value)}
            >
              {["unknown", "suspected", "positive", "negative"].map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Pathogen</label>
            <input
              className="w-full border rounded-md p-2"
              placeholder="MRSA / CRE / ESBL"
              value={pathogen}
              onChange={(e) => setPathogen(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Detected At
            </label>
            <input
              type="datetime-local"
              className="w-full border rounded-md p-2"
              value={detectedAt}
              onChange={(e) => setDetectedAt(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={saveMdr} icon={CheckCircle} className="mt-4">
          Save MDR Status
        </Button>
      </Card>

      <Card title="Log Ward Movement" icon={Activity}>
        <div className="grid sm:grid-cols-5 gap-4">
          {["hospitalId", "ward", "bed", "start", "end"].map((f) => (
            <div key={f}>
              <label className="block text-sm text-gray-600 mb-1 capitalize">
                {f}
              </label>
              <input
                type={f.includes("start") || f.includes("end") ? "datetime-local" : "text"}
                className="w-full border rounded-md p-2"
                value={move[f]}
                onChange={(e) => setMove({ ...move, [f]: e.target.value })}
              />
            </div>
          ))}
        </div>
        <Button onClick={saveMovement} className="mt-4">
          Save Movement
        </Button>
      </Card>

      <Card title="Exposure Risk Analysis" icon={Search}>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Window (days)</label>
          <input
            type="number"
            min={1}
            className="w-24 border rounded-md p-2"
            value={windowDays}
            onChange={(e) => setWindowDays(parseInt(e.target.value || "7", 10))}
          />
          <Button
            onClick={runExposures}
            disabled={isLoadingExposures}
            icon={Search}
          >
            {isLoadingExposures ? "Calculating..." : "Run Trace"}
          </Button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="px-3 py-2">Patient Details</th>
                <th className="px-3 py-2">Risk Analysis</th>
                <th className="px-3 py-2">Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingExposures ? (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-center text-gray-500">
                    Calculating risk scores...
                  </td>
                </tr>
              ) : exposures.length > 0 ? (
                exposures.map((e) => (
                  <motion.tr
                    key={e.abhaId}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-3 py-4">
                      <p className="font-semibold text-gray-800">
                        {e.name || "-"}
                      </p>
                      <p className="font-mono text-gray-500 text-xs">
                        {e.abhaId}
                      </p>
                    </td>
                    <td className="px-3 py-4">
                      <RiskBadge score={e.riskScore} />
                      <p className="text-xs text-gray-500 mt-1">
                        {e.totalMinutes} min total exposure
                      </p>
                    </td>
                    <td className="px-3 py-4 w-1/3">
                      <Recommendation
                        recommendation={e.recommendation}
                        onScheduleScreening={() => addScreening(e.abhaId)}
                      />
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-center text-gray-500">
                    No exposures computed yet. Run a trace to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Screenings (this patient)" icon={RefreshCcw}>
        <div className="flex justify-end">
          <Button
            icon={RefreshCcw}
            variant="secondary"
            onClick={refreshScreenings}
          >
            Refresh
          </Button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Result</th>
              </tr>
            </thead>
            <tbody>
              {screenings.length > 0 ? (
                screenings.map((s) => (
                  <tr key={s._id || s.date} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2">
                      {new Date(s.date).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">{s.type}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          s.result === "positive"
                            ? "bg-red-100 text-red-700"
                            : s.result === "negative"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {s.result}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-gray-500 text-center">
                    No screenings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Tip: “Schedule Screening” in the Exposures table creates a pending
          screening on the exposed patient’s record.
        </p>
      </Card>
    </div>
  );
}
