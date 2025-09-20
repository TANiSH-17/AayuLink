import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, Bot, XCircle, ChevronDown, ChevronUp, Download } from 'lucide-react'; // ✅ Import new icons

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function PatientReports({ abhaId, reports, setPatientData }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [reportType, setReportType] = useState('Medical Report');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [expandedReport, setExpandedReport] = useState(null); // State for expanding AI analysis

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }
    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('reportFile', selectedFile);
    formData.append('reportType', reportType);

    try {
      const response = await axios.post(`${API_URL}/api/patient/report/${abhaId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update the patient data in the parent DashboardWrapper
      // This is a simplified update. In a real app, you might re-fetch patientData or update more carefully.
      setPatientData(prevData => ({
        ...prevData,
        medicalHistory: [...prevData.medicalHistory, response.data.newReport] // Assuming backend returns new report
      }));
      
      setSelectedFile(null);
      setReportType('Medical Report');
      alert('Report uploaded and analyzed successfully!');
    } catch (error) {
      console.error('Error uploading report:', error);
      setUploadError(error.response?.data?.message || 'Failed to upload report.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadFile = (fileData, fileName, mimeType) => {
    const link = document.createElement('a');
    link.href = `data:${mimeType};base64,${fileData}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Upload New Medical Report</h3>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <input 
            type="file" 
            onChange={handleFileChange} 
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)} 
            className="p-2 border rounded-md text-gray-700 md:w-auto w-full"
          >
            <option value="Medical Report">Medical Report</option>
            <option value="Lab Report">Lab Report</option>
            <option value="X-Ray">X-Ray / Scan</option>
            <option value="Prescription">Prescription</option>
            <option value="Other">Other</option>
          </select>
          <button 
            onClick={handleUpload} 
            disabled={uploading || !selectedFile}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 disabled:bg-green-400 md:w-auto w-full justify-center"
          >
            {uploading ? 'Uploading...' : <><Upload size={20} /> Upload & Analyze</>}
          </button>
        </div>
        {uploadError && <p className="text-red-600 text-sm mt-2">{uploadError}</p>}
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Patient Reports & AI Analysis</h3>
        {reports && reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report, index) => (
              <div key={index} className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <FileText size={24} className="text-blue-600" />
                    <div>
                      <p className="font-semibold text-lg text-gray-800">{report.type}: {report.fileName}</p>
                      <p className="text-sm text-gray-500">Uploaded on: {new Date(report.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {report.fileData && (
                        <button 
                            onClick={() => handleDownloadFile(report.fileData, report.fileName, report.fileMimeType)}
                            className="p-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                            title="Download File"
                        >
                            <Download size={18} />
                        </button>
                    )}
                    <button 
                      onClick={() => setExpandedReport(expandedReport === index ? null : index)}
                      className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                      title="Toggle AI Analysis"
                    >
                      {expandedReport === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {expandedReport === index && report.aiAnalysis && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-md border border-purple-200 animate-fadeIn">
                    <div className="flex items-center gap-2 text-purple-800 font-bold mb-3">
                      <Bot size={20} /> AI Analysis
                    </div>
                    {report.aiAnalysis.summary && <p className="text-gray-700 mb-2"><strong>Summary:</strong> {report.aiAnalysis.summary}</p>}
                    
                    {report.aiAnalysis.findings && report.aiAnalysis.findings.length > 0 && (
                      <div className="mb-2">
                        <p className="font-semibold text-gray-700">Key Findings:</p>
                        <ul className="list-disc list-inside text-gray-600 ml-2">
                          {report.aiAnalysis.findings.map((finding, i) => (
                            <li key={i}>{finding}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {report.aiAnalysis.recommendations && report.aiAnalysis.recommendations.length > 0 && (
                      <div className="mb-2">
                        <p className="font-semibold text-gray-700">Recommendations:</p>
                        <ul className="list-disc list-inside text-gray-600 ml-2">
                          {report.aiAnalysis.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {report.aiAnalysis.medications && report.aiAnalysis.medications.length > 0 && (
                      <div className="mb-2">
                        <p className="font-semibold text-gray-700">Medications:</p>
                        <ul className="list-disc list-inside text-gray-600 ml-2">
                          {report.aiAnalysis.medications.map((med, i) => (
                            <li key={i}>{med.name} {med.dosage && `(${med.dosage})`}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {report.aiAnalysis.rawAnalysis && !report.aiAnalysis.summary && (
                       <p className="text-gray-700 text-sm mt-2">
                           **Raw AI Output (parsing failed):** <pre className="bg-gray-100 p-2 rounded-md text-xs whitespace-pre-wrap">{report.aiAnalysis.rawAnalysis}</pre>
                       </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No medical reports uploaded yet.</p>
        )}
      </div>
    </div>
  );
}