import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Search, CheckCircle, ArrowLeft, Camera } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/* -------------------------------------------------
   One-time script loader for html5-qrcode
------------------------------------------------- */
function loadHtml5QrScriptOnce() {
  if (window.__html5qrcodeScriptLoaded) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://unpkg.com/html5-qrcode"]');
    if (existing) {
      existing.addEventListener('load', () => {
        window.__html5qrcodeScriptLoaded = true;
        resolve();
      }, { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/html5-qrcode';
    script.async = true;
    script.onload = () => {
      window.__html5qrcodeScriptLoaded = true;
      resolve();
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

/* -------------------------------------------------
   QRScanner — robust against permission denial
------------------------------------------------- */
function QRScanner({ onScanSuccess, onClose }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    // Load html5-qrcode only once
    if (!window.Html5Qrcode) {
      const script = document.createElement('script');
      script.src = "https://unpkg.com/html5-qrcode";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => startScanner();
      return () => {
        document.body.removeChild(script);
      };
    } else {
      startScanner();
    }

    function startScanner() {
      if (!scannerRef.current && window.Html5Qrcode) {
        const html5QrCode = new window.Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;

        const qrCodeSuccessCallback = (decodedText) => {
          onScanSuccess(decodedText);
          html5QrCode.stop().catch(err => console.error("Stop failed:", err));
        };

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        html5QrCode
          .start({ facingMode: "environment" }, config, qrCodeSuccessCallback)
          .catch(err => {
            console.error("Camera permission denied or failed:", err);
            onClose(); // fallback to ValidatorPage
          });
      }
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(err => console.warn("Cleanup stop error:", err));
        scannerRef.current = null;
      }
    };
  }, [onScanSuccess, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl relative w-full max-w-sm">
        <h3 className="text-lg font-bold mb-4 text-center">Scan QR Code</h3>
        <div id="qr-reader" className="w-full"></div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}


/* -------------------------------------------------
   Aarogya Express Validator page
------------------------------------------------- */
export default function ValidatorPage({ onBack }) {
  const [token, setToken] = useState('');
  const [prescription, setPrescription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFulfilled, setIsFulfilled] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!token.trim()) return;
    setIsLoading(true);
    setError('');
    setPrescription(null);
    setIsFulfilled(false);
    try {
      const response = await axios.get(`${API_URL}/api/prescription/verify/${token}`);
      setPrescription(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFulfill = async () => {
    setIsLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/api/prescription/fulfill/${token}`);
      setIsFulfilled(true);
      setPrescription(prev => ({ ...prev, status: 'Fulfilled' }));
    } catch (err) {
      setError(err.response?.data?.error || 'Could not fulfill prescription.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanSuccess = (decodedText) => {
    setToken(decodedText);
    setShowScanner(false);
  };

  const handleScannerError = (msg) => {
    // show friendly message and ensure the validator view is visible
    setError(msg || 'Camera unavailable.');
    setShowScanner(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-100 z-50 flex items-center justify-center p-4">
      {showScanner && (
        <QRScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
          onError={handleScannerError}
        />
      )}

      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8 relative">
        <button onClick={onBack} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Close">
          <X className="h-6 w-6" />
        </button>

        <h1 className="text-3xl font-bold text-center">Aarogya Express Validator</h1>
        <p className="text-center text-gray-500 mt-1">
          Verify and fulfill digital e-prescriptions securely.
        </p>

        <form onSubmit={handleVerify} className="mt-8 flex items-center gap-2">
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter prescription token..."
            className="flex-1 p-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-300"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setError('');
              setShowScanner(true);
            }}
            className="bg-gray-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-black"
            aria-label="Open camera"
          >
            <Camera className="h-5 w-5" />
          </button>
        </form>

        {error && <p className="text-center text-red-500 mt-4">{error}</p>}

        {prescription && (
          <div className="mt-6 border-t pt-6">
            <h2 className="text-xl font-semibold">Prescription Details</h2>
            <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-3">
              <p><strong>Patient:</strong> {prescription.patientName}</p>
              <p><strong>Doctor:</strong> {prescription.doctorName}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`font-bold ${prescription.status === 'Fulfilled' ? 'text-green-600' : 'text-red-600'}`}>
                  {prescription.status}
                </span>
              </p>
              <div>
                <strong>Medications:</strong>
                <ul className="list-disc list-inside ml-4">
                  {prescription.medications.map((med, i) => (
                    <li key={i}>{med.name} ({med.dosage})</li>
                  ))}
                </ul>
              </div>
            </div>

            {prescription.status === 'Pending' && !isFulfilled && (
              <button
                onClick={handleFulfill}
                disabled={isLoading}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
              >
                Mark as Fulfilled
              </button>
            )}

            {isFulfilled && (
              <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 mr-2" /> Prescription Fulfilled Successfully!
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-8">
          <button onClick={onBack} className="text-sm text-gray-500 hover:underline flex items-center mx-auto">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
