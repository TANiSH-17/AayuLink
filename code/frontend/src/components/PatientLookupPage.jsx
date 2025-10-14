import React, { useState } from "react";
import axios from "axios";
import {
  User,
  Shield,
  History,
  Search,
  LogOut,
  PlusCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import EmergencyDetailModal from "./EmergencyDetailModal";
import PatientRegistrationModal from "./PatientRegistrationModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function PatientLookupPage({
  onPatientSelect,
  onLogout,
  showNotification,
  currentUser,
}) {
  const [abhaId, setAbhaId] = useState("");
  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyData, setEmergencyData] = useState(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!abhaId.trim()) return;
    setIsLoading(true);
    setError("");
    setPatient(null);
    try {
      const response = await axios.post(`${API_URL}/api/patient-lookup`, {
        abhaId,
      });
      setPatient({ abhaId, name: response.data.name });
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Could not find a patient with that ABHA ID."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyLookup = async (id) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.post(`${API_URL}/api/fetch-records`, {
        abhaId: id,
      });
      setEmergencyData(response.data);
      setShowEmergencyModal(true);
    } catch (err) {
      setError("Could not fetch the patient's emergency details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-white p-6">
      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md text-gray-700 font-semibold rounded-full shadow-md hover:shadow-lg hover:bg-white transition-all duration-300"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-lg bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-emerald-100 p-8 space-y-6"
      >
        {!patient ? (
          <>
            <div className="text-center">
            <h1 className="text-4xl md:text-4xl font-extrabold text-gray-900 drop-shadow-sm">
              Patient Lookup
            </h1>

              <p className="text-gray-600 mt-3 text-sm">
                Enter an ABHA number to find a patient’s record
              </p>
            </div>

            <form onSubmit={handleLookup} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="abhaId"
                  className="text-sm font-semibold text-gray-700"
                >
                  ABHA Number
                </label>
                <div className="relative">
                  <input
                    id="abhaId"
                    type="text"
                    value={abhaId}
                    onChange={(e) => setAbhaId(e.target.value)}
                    className="w-full mt-1 p-3 pl-10 border rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none bg-white/70 backdrop-blur-sm"
                    placeholder="e.g., 12-3456-7890-0001"
                    required
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                {isLoading ? (
                  "Searching..."
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Find Patient
                  </>
                )}
              </button>
            </form>

            {currentUser?.role === "admin" && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
                >
                  <PlusCircle size={18} />
                  Create new ABHA ID for patient
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center space-y-6">
            <p className="text-gray-600">Patient Found</p>
            <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-600">
              {patient.name}
            </h2>
            <p className="text-gray-500 text-sm">ABHA ID: {patient.abhaId}</p>

            <div className="space-y-4 mt-6">
              <button
                onClick={() =>
                  onPatientSelect(patient.abhaId, "history", patient.name)
                }
                className="w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                <History className="h-5 w-5 mr-2" />
                Get Complete Medical History
              </button>

              <button
                onClick={() => handleEmergencyLookup(patient.abhaId)}
                disabled={isLoading}
                className="w-full flex items-center justify-center bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 transition-all duration-300"
              >
                {isLoading ? (
                  "Loading Details..."
                ) : (
                  <>
                    <Shield className="h-5 w-5 mr-2" />
                    Quick Details (Emergency Mode)
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => {
                setPatient(null);
                setError("");
                setAbhaId("");
              }}
              className="text-sm text-gray-500 hover:text-gray-700 hover:underline transition-colors mt-4"
            >
              Look up another patient
            </button>
          </div>
        )}
      </motion.div>

      {showEmergencyModal && (
        <EmergencyDetailModal
          patientData={emergencyData}
          onClose={() => setShowEmergencyModal(false)}
        />
      )}

      <PatientRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegistrationSuccess={showNotification}
      />
    </div>
  );
}
