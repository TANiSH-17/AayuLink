import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, Search, RefreshCcw, AlertTriangle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ----------------------------
// Reusable components
// ----------------------------
const RiskBadge = ({ score }) => {
  const getColor = () => {
    if (score > 75) return 'bg-red-100 text-red-800 border-red-300';
    if (score > 50) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (score > 25) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  return (
    <span className={`px-2.5 py-1 text-sm font-semibold rounded-full border ${getColor()}`}>
      {score}%
    </span>
  );
};

const Recommendation = ({ recommendation, onScheduleScreening }) => {
  if (!recommendation) {
    return <span className="text-xs text-gray-500">No specific action required.</span>;
  }

  const getColors = () => {
    switch (recommendation.level) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`p-2 rounded-lg ${getColors()}`}>
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-sm">{recommendation.action.replace('_', ' ')}</p>
          <p className="text-xs">{recommendation.message}</p>
          <button
            onClick={onScheduleScreening}
            className="mt-2 px-2 py-1 rounded-md bg-green-600 text-white text-xs font-semibold hover:bg-green-700"
          >
            Schedule Screening
          </button>
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

  // ---- MDR Status ----
  const [mdrStatus, setMdrStatus] = useState(patientData?.mdr?.status || 'unknown');
  const [pathogen, setPathogen] = useState(patientData?.mdr?.pathogen || '');
  const [detectedAt, setDetectedAt] = useState(
    patientData?.mdr?.detectedAt ? new Date(patientData.mdr.detectedAt).toISOString().slice(0, 16) : ''
  );

  // ---- Movement ----
  const [move, setMove] = useState({
    hospitalId: currentUser?.hospitalName || '',
    ward: '',
    bed: '',
    start: '',
    end: ''
  });

  // ---- Exposures ----
  const [windowDays, setWindowDays] = useState(7);
  const [exposures, setExposures] = useState([]);
  const [isLoadingExposures, setIsLoadingExposures] = useState(false);

  // ---- Screenings ----
  const [screenings, setScreenings] = useState(patientData?.screenings || []);

  // ---- Message Banner ----
  const [message, setMessage] = useState('');
  const notify = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3500);
  };

  // ---- Sync when patient changes ----
  useEffect(() => {
    setScreenings(patientData?.screenings || []);
    setMdrStatus(patientData?.mdr?.status || 'unknown');
    setPathogen(patientData?.mdr?.pathogen || '');
    setDetectedAt(
      patientData?.mdr?.detectedAt ? new Date(patientData.mdr.detectedAt).toISOString().slice(0, 16) : ''
    );
    setExposures([]);
  }, [patientData]);

  // ---- API Calls ----
  const refreshScreenings = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/mdr/${abhaId}/screenings`);
      setScreenings(res.data?.screenings || []);
      notify('Screenings refreshed.');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to refresh screenings.');
    }
  };

  const saveMdr = async () => {
    try {
      await axios.post(`${API_URL}/api/mdr/${abhaId}/mark`, {
        status: mdrStatus,
        pathogen,
        detectedAt: detectedAt || new Date().toISOString()
      });
      notify('MDR status saved.');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to save MDR status.');
    }
  };

  const saveMovement = async () => {
    try {
      if (!move.hospitalId || !move.ward || !move.start) {
        notify('hospitalId, ward, and start are required.');
        return;
      }
      await axios.post(`${API_URL}/api/mdr/${abhaId}/movement`, move);
      notify('Movement saved.');
      setMove((m) => ({ ...m, ward: '', bed: '', start: '', end: '' }));
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to save movement.');
    }
  };

  const runExposures = async () => {
    setIsLoadingExposures(true);
    setExposures([]);
    try {
      const res = await axios.get(`${API_URL}/api/mdr/${abhaId}/exposures`, { params: { windowDays } });
      const exposureData = res.data?.exposures || [];
      exposureData.sort((a, b) => b.riskScore - a.riskScore);
      setExposures(exposureData);

      notify(
        exposureData.length === 0
          ? 'No exposures found for selected window.'
          : `Found ${exposureData.length} potential exposures.`
      );
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to compute exposures.');
    } finally {
      setIsLoadingExposures(false);
    }
  };

  const addScreening = async (otherAbhaId) => {
    try {
      const res = await axios.post(`${API_URL}/api/mdr/${otherAbhaId}/screening`, {
        type: 'swab',
        result: 'pending'
      });
      notify('Screening scheduled (pending).');
      if (otherAbhaId === abhaId) setScreenings(res.data?.screenings || []);
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to add screening.');
    }
  };

  // ----------------------------
  // UI Rendering
  // ----------------------------
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">MDR Tracing</h2>

      {message && (
        <div
          className={`rounded-md p-3 border ${
            /fail|forbidden|error|not authorized|insufficient/i.test(message)
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-green-50 text-green-700 border-green-200'
          }`}
        >
          {message}
        </div>
      )}

      {/* A) MDR Status */}
      <section className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">MDR Status</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Status</label>
            <select
              className="w-full border rounded-md p-2"
              value={mdrStatus}
              onChange={(e) => setMdrStatus(e.target.value)}
            >
              <option value="unknown">Unknown</option>
              <option value="suspected">Suspected</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
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
            <label className="block text-sm text-gray-600 mb-1">Detected At</label>
            <input
              type="datetime-local"
              className="w-full border rounded-md p-2"
              value={detectedAt}
              onChange={(e) => setDetectedAt(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={saveMdr}
          className="mt-4 inline-flex items-center px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
        >
          <CheckCircle className="h-5 w-5 mr-2" /> Save MDR Status
        </button>
      </section>

      {/* B) Movement Logging */}
      <section className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Log Ward Movement</h3>
        <div className="grid sm:grid-cols-5 gap-4">
          {['hospitalId', 'ward', 'bed', 'start', 'end'].map((field, i) => (
            <div key={field}>
              <label className="block text-sm text-gray-600 mb-1 capitalize">
                {field === 'hospitalId' ? 'Hospital ID' : field === 'start' ? 'Start' : field === 'end' ? 'End (optional)' : field}
              </label>
              <input
                type={field.includes('start') || field.includes('end') ? 'datetime-local' : 'text'}
                className="w-full border rounded-md p-2"
                value={move[field]}
                onChange={(e) => setMove({ ...move, [field]: e.target.value })}
              />
            </div>
          ))}
        </div>

        <button
          onClick={saveMovement}
          className="mt-4 inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Save Movement
        </button>
      </section>

      {/* C) Exposures */}
      <section className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Find Exposures</h3>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Window (days)</label>
          <input
            type="number"
            min={1}
            className="w-24 border rounded-md p-2"
            value={windowDays}
            onChange={(e) => setWindowDays(parseInt(e.target.value || '7', 10))}
          />
          <button
            onClick={runExposures}
            disabled={isLoadingExposures}
            className="inline-flex items-center px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-black disabled:bg-gray-400"
          >
            <Search className="h-5 w-5 mr-2" />
            {isLoadingExposures ? 'Calculating...' : 'Run Trace'}
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
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
                  <tr key={e.abhaId} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-4 align-top">
                      <p className="font-semibold text-gray-800">{e.name || '-'}</p>
                      <p className="font-mono text-gray-600 text-xs">{e.abhaId}</p>
                    </td>
                    <td className="px-3 py-4 align-top">
                      <RiskBadge score={e.riskScore} />
                      <p className="text-xs text-gray-500 mt-2">{e.totalMinutes} min total exposure</p>
                    </td>
                    <td className="px-3 py-4 align-top w-1/3">
                      <Recommendation
                        recommendation={e.recommendation}
                        onScheduleScreening={() => addScreening(e.abhaId)}
                      />
                    </td>
                  </tr>
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
      </section>

      {/* D) Screenings */}
      <section className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Screenings (this patient)</h3>
          <button
            onClick={refreshScreenings}
            className="inline-flex items-center px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800"
            title="Refresh screenings"
          >
            <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Result</th>
              </tr>
            </thead>
            <tbody>
              {screenings.length > 0 ? (
                screenings.map((s) => (
                  <tr key={s._id || `${s.date}-${s.type}`} className="border-t">
                    <td className="px-3 py-2">{new Date(s.date).toLocaleString()}</td>
                    <td className="px-3 py-2">{s.type}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          s.result === 'positive'
                            ? 'bg-red-100 text-red-700'
                            : s.result === 'negative'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {s.result}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-gray-500">
                    No screenings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          Tip: “Schedule Screening” in the Exposures table creates a pending screening on the exposed patient’s record.
          To see it here, switch to that patient and click Refresh.
        </p>
      </section>
    </div>
  );
}
