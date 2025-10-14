import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, X, Send, Clock } from 'lucide-react';

export default function OtpVerificationModal({
  patientName,
  onVerify,
  onClose,
  error,
  onSendOtpRequest
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [consentDuration, setConsentDuration] = useState('24');
  const [otpSent, setOtpSent] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (otpSent) {
      inputsRef.current[0]?.focus();
    }
  }, [otpSent]);

  const handleSendOtp = () => {
    onSendOtpRequest(consentDuration);
    setOtpSent(true);
  };

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (value.length > 1) {
      const newOtp = value.split('').slice(0, 6);
      while (newOtp.length < 6) newOtp.push('');
      setOtp(newOtp);
      inputsRef.current[Math.min(5, value.length - 1)]?.focus();
      return;
    }
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmitOtp = (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length === 6) onVerify(fullOtp);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 border border-emerald-100 rounded-2xl shadow-xl w-full max-w-md p-8 text-center relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-emerald-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-full shadow-md">
            <ShieldCheck className="h-10 w-10 text-white" />
          </div>
        </div>

        {!otpSent ? (
          <>
            <h2 className="text-2xl font-bold text-gray-800">
              Set Consent Duration
            </h2>
            <p className="text-gray-600 mt-2">
              Select how long you want <span className="font-semibold text-emerald-700">{patientName}</span>, to grant
              access to their medical records.
            </p>

            <div className="mt-8 text-left">
              <label
                htmlFor="consent-duration"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Consent Validity
              </label>
              <div className="relative">
                <select
                  id="consent-duration"
                  value={consentDuration}
                  onChange={(e) => setConsentDuration(e.target.value)}
                  className="w-full p-3 pl-10 text-lg border rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                >
                  <option value="1">1 Hour</option>
                  <option value="24">24 Hours</option>
                  <option value="168">7 Days</option>
                  <option value="720">30 Days</option>
                </select>
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
              </div>
            </div>

            <button
              onClick={handleSendOtp}
              className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Send size={18} />
              Send OTP
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800">
              Patient Consent Verification
            </h2>
            <p className="text-gray-600 mt-2">
              Enter <span className="font-semibold text-emerald-700">081106 </span> as 6-digit code to proceed{" "}
              
            </p>

            <form onSubmit={handleSubmitOtp} className="mt-8">
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputsRef.current[index] = el)}
                    type="tel"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    aria-label={`OTP digit ${index + 1}`}
                    className="w-12 h-14 text-2xl text-center border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition font-semibold text-gray-700"
                  />
                ))}
              </div>

              {error && (
                <p className="text-sm text-red-600 mt-4 font-medium">{error}</p>
              )}

              <button
                type="submit"
                className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                Verify & Access Records
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
