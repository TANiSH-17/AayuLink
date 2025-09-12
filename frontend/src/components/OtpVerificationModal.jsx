import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export default function OtpVerificationModal({ patientName, onVerify, onClose, error }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputsRef = useRef([]);

  // Focus the first input box when the modal opens
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Automatically move focus to the next input box
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Move focus to the previous input box on backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length === 6) {
      onVerify(fullOtp); // Send the completed OTP to the parent component
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 text-center relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X />
        </button>
        <ShieldCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Patient Consent Required</h2>
        <p className="text-gray-600 mt-2">
          Please ask <span className="font-semibold">{patientName}</span> for the 6-digit code to proceed.
        </p>
        
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => (inputsRef.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
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
      </div>
    </div>
  );
}

