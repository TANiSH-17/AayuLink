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
  if (score === undefined || score === null || isNaN(score))
    return (
      <span className="px-2.5 py-1 text-sm font-semibold rounded-full border bg-gray-100 text-gray-600 border-gray-200">
        N/A
      </span>
    );

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

  const displayScore =
    score > 1 && score <= 100 ? score : (score * 100).toFixed(1);

  return (
    <span
      className={`px-2.5 py-1 text-sm font-semibold rounded-full border ${getColor()}`}
    >
      {displayScore}%
    </span>
  );
};

const Recommendation = ({ recommendation, onScheduleScreening }) => {
  if (!recommendation || Object.keys(recommendation).length === 0)
    return (
      <span className="text-xs text-gray-500">
        No specific action required.
      </span>
    );

  const colorMap = {
    CRITICAL: "bg-red-100 text-red-800",
    HIGH: "bg-orange-100 text-orange-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    LOW: "bg-green-100 text-green-800",
  };

  const { level = "LOW", action = "General Precaution", message = "" } =
    recommendation || {};

  return (
    <div className={`p-3 rounded-lg ${colorMap[level] || colorMap.LOW}`}>
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-5 w-5 mt-0.5" />
        <div>
          <p className="font-bold text-sm capitalize">
            {action.replace(/_/g, " ")}
          </p>
          {message && <p className="text-xs mt-1">{message}</p>}
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
  
      const cleaned = (res.data?.exposures || []).map((d) => ({
        ...d,
        otherAbhaId: d.abhaId,                   // map abhaId to otherAbhaId
        overlapHours: d.totalMinutes
          ? Math.floor(d.totalMinutes / 60)
          : 0,                                     // calculate overlap in hours
        riskScore: Number(d.riskScore) || 0,      // ensure riskScore is numeric
      }));
  
      cleaned.sort((a, b) => b.riskScore - a.riskScore);
      setExposures(cleaned);
  
      notify(
        cleaned.length === 0
          ? "No exposures found for selected window."
          : `Found ${cleaned.length} potential exposures.`
      );
    } catch {
      notify("Failed to compute exposures.");
    } finally {
      setIsLoadingExposures(false);
    }
  };
  

  const addScreening = async (otherAbhaId) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/mdr/${otherAbhaId}/screening`,
        { type: "swab", result: "pending" }
      );
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

      {/* MDR STATUS CARD */}
      <Card title="MDR Status" icon={CheckCircle}>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600">Status</label>
            <select
              className="w-full mt-1 border rounded-md px-3 py-2"
              value={mdrStatus}
              onChange={(e) => setMdrStatus(e.target.value)}
            >
              <option value="unknown">Unknown</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Pathogen</label>
            <input
              type="text"
              className="w-full mt-1 border rounded-md px-3 py-2"
              value={pathogen}
              onChange={(e) => setPathogen(e.target.value)}
              placeholder="e.g. MRSA"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Detected At</label>
            <input
              type="datetime-local"
              className="w-full mt-1 border rounded-md px-3 py-2"
              value={detectedAt}
              onChange={(e) => setDetectedAt(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={saveMdr}>Save MDR Status</Button>
        </div>
      </Card>

      {/* MOVEMENT LOGGING */}
      <Card title="Log Movement" icon={RefreshCcw}>
  <div className="grid md:grid-cols-4 gap-4">
    <input
      placeholder="Ward"
      value={move.ward}
      onChange={(e) => setMove({ ...move, ward: e.target.value })}
      className="border rounded-md px-3 py-2"
    />
    <input
      placeholder="Bed"
      value={move.bed}
      onChange={(e) => setMove({ ...move, bed: e.target.value })}
      className="border rounded-md px-3 py-2"
    />
    <input
      type="datetime-local"
      value={move.start}
      onChange={(e) => setMove({ ...move, start: e.target.value })}
      className="border rounded-md px-3 py-2"
    />
    <input
      type="datetime-local"
      value={move.end}
      onChange={(e) => setMove({ ...move, end: e.target.value })}
      className="border rounded-md px-3 py-2"
    />
  </div>

  <div className="mt-4">
    <Button onClick={saveMovement}>Save Movement</Button>
  </div>
</Card>


      {/* EXPOSURE RISK ANALYSIS */}
<Card title="Exposure Risk Analysis" icon={Search}>
  <div className="flex items-center gap-3 mb-4">
    <input
      type="number"
      value={windowDays}
      onChange={(e) => setWindowDays(Number(e.target.value))}
      className="border rounded-md px-3 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-teal-500"
    />
    <span className="text-sm text-gray-700">days window</span>
    <Button onClick={runExposures} disabled={isLoadingExposures}>
      {isLoadingExposures ? "Computing..." : "Run Analysis"}
    </Button>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full text-sm border-collapse border border-gray-200">
      <thead className="bg-teal-100 text-gray-800 uppercase text-xs">
        <tr>
          <th className="p-3 text-left">ABHA ID</th>
          <th className="p-3 text-left">Ward</th>
          <th className="p-3 text-left">Overlap</th>
          <th className="p-3 text-left">Risk</th>
          <th className="p-3 text-left">Recommendation</th>
        </tr>
      </thead>
      <tbody>
        {exposures.length === 0 ? (
          <tr>
            <td
              colSpan={5}
              className="text-center text-gray-500 py-6 italic"
            >
              No exposures yet.
            </td>
          </tr>
        ) : (
          exposures.map((e, i) => (
            <tr
              key={i}
              className={`border-t hover:bg-teal-50 transition-colors duration-200 ${
                i % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <td className="p-3 font-medium text-gray-700">{e.otherAbhaId}</td>
              <td className="p-3">{e.ward || "-"}</td>
              <td className="p-3">{e.overlapHours || 0} hrs</td>
              <td className="p-3">
                <RiskBadge
                  score={e.riskScore}
                  className="text-sm font-bold px-3 py-1 rounded-full"
                />
              </td>
              <td className="p-3">
                <div className="p-2 border-l-4 rounded-lg shadow-sm bg-white">
                  <Recommendation
                    recommendation={e.recommendation}
                    onScheduleScreening={() => addScreening(e.otherAbhaId)}
                  />
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</Card>


      {/* SCREENING HISTORY */}
      <Card title="Screening History" icon={CheckCircle}>
        <div className="flex justify-between mb-3">
          <Button onClick={refreshScreenings}>Refresh</Button>
          <Button
            variant="secondary"
            onClick={() => addScreening(abhaId)}
          >
            Add New Screening
          </Button>
        </div>

        {screenings.length === 0 ? (
          <p className="text-gray-500 text-sm italic">
            No screenings recorded yet.
          </p>
        ) : (
          <ul className="divide-y border rounded-md">
            {screenings.map((s, i) => (
              <li key={i} className="p-3 flex justify-between items-center">
                <span>
                  <span className="font-medium">{s.type}</span>{" "}
                  ({s.result})
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(s.date).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
