import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, X, Send, Clock } from 'lucide-react';

export default function OtpVerificationModal({ patientName, onVerify, onClose, error, onSendOtpRequest }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [consentDuration, setConsentDuration] = useState('24'); // Default to 24 hours
  const [otpSent, setOtpSent] = useState(false); // This controls which view is shown
  const inputsRef = useRef([]);

  // Focus the first input box when the OTP view appears
  useEffect(() => {
    if (otpSent) {
      inputsRef.current[0]?.focus();
    }
  }, [otpSent]);

  const handleSendOtp = () => {
    // This function is called when the user clicks "Send OTP"
    onSendOtpRequest(consentDuration); // Notify parent to show the notification
    setOtpSent(true); // Switch to the OTP input view
  };

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (value.length > 1) {
      const newOtp = value.split('').slice(0, 6);
      while (newOtp.length < 6) { newOtp.push(''); }
      setOtp(newOtp);
      inputsRef.current[Math.min(5, value.length - 1)]?.focus();
      return;
    }
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmitOtp = (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length === 6) {
      onVerify(fullOtp);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 text-center relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X />
        </button>
        <ShieldCheck className="h-16 w-16 text-primary mx-auto mb-4" />
        
        {!otpSent ? (
          /* ===================================
              VIEW 1: CONSENT DURATION
             =================================== */
          <>
            <h2 className="text-2xl font-bold">Set Consent Duration</h2>
            <p className="text-gray-600 mt-2">
              Select the duration for which <span className="font-semibold">{patientName}</span> grants access to their records.
            </p>
            <div className="mt-8">
              <label htmlFor="consent-duration" className="block text-sm font-medium text-gray-700 text-left mb-1">Consent Validity</label>
              <div className="relative">
                <select 
                  id="consent-duration"
                  value={consentDuration}
                  onChange={(e) => setConsentDuration(e.target.value)}
                  className="w-full p-3 pl-10 text-lg border-2 rounded-lg appearance-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="1">1 Hour</option>
                  <option value="24">24 Hours</option>
                  <option value="168">7 Days</option>
                  <option value="720">30 Days</option>
                </select>
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <button
              onClick={handleSendOtp}
              className="w-full mt-6 bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
            >
              <Send size={18} />
              Send OTP
            </button>
          </>
        ) : (
          /* ===================================
              VIEW 2: OTP VERIFICATION
             =================================== */
          <>
            <h2 className="text-2xl font-bold">Patient Consent Required</h2>
            <p className="text-gray-600 mt-2">
              Please enter <span className="font-semibold">081106</span> as 6-digit code to proceed.
            </p>
            <form onSubmit={handleSubmitOtp} className="mt-8">
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => (inputsRef.current[index] = el)}
                    type="tel" 
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    aria-label={`OTP digit ${index + 1}`}
                    className="w-12 h-14 text-3xl text-center border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                ))}
              </div>
              {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
              <button
                type="submit"
                className="w-full mt-6 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700"
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