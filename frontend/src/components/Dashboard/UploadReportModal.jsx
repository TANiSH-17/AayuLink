import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, X, FileText } from 'lucide-react';

const API_URL = 'http://localhost:8000';

export default function UploadReportModal({ abhaId, onClose, onUploadSuccess }) {
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState('Blood Test');
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 10 * 1024 * 1024) { // 10MB size limit
        setError('File is too large. Maximum size is 10MB.');
        setSelectedFile(null);
    } else {
        setSelectedFile(file);
        setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }
    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('abhaId', abhaId);
    formData.append('reportDate', reportDate);
    formData.append('reportType', reportType);
    formData.append('reportFile', selectedFile);

    try {
      await axios.post(`${API_URL}/api/reports/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // --- DEBUGGING ---
      console.log("1. Upload Successful. Calling onUploadSuccess...");
      onUploadSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'File upload failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload New Report or Scan</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reportDate" className="block text-sm font-medium text-gray-600 mb-1">Report Date</label>
              <input type="date" name="reportDate" id="reportDate" value={reportDate} onChange={e => setReportDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"/>
            </div>
            <div>
              <label htmlFor="reportType" className="block text-sm font-medium text-gray-600 mb-1">Report Type</label>
              <select name="reportType" id="reportType" value={reportType} onChange={e => setReportType(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500">
                <option>Blood Test</option>
                <option>X-Ray</option>
                <option>MRI Scan</option>
                <option>CT Scan</option>
                <option>Ultrasound</option>
                <option>Discharge Summary</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Upload File</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none">
                    <span>Select a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF, PNG, JPG, DOCX up to 10MB</p>
              </div>
            </div>
            {selectedFile && (
                <div className="mt-2 flex items-center text-sm text-gray-700">
                    <FileText className="h-5 w-5 text-gray-500 mr-2" />
                    <span>{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
            )}
          </div>

          {error && <p className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-md">{error}</p>}

          <div className="flex justify-end pt-4 space-x-3">
            <button type="button" onClick={onClose} className="px-5 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={isLoading || !selectedFile} className="px-5 py-2 text-white bg-green-600 hover:bg-green-700 font-semibold rounded-lg disabled:bg-green-300 flex items-center transition-colors">
              <UploadCloud size={18} className="mr-2"/> {isLoading ? 'Uploading...' : 'Upload Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

