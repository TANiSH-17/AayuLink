import React, { useState } from 'react';
import { FileText, Download, Upload } from 'lucide-react';
import UploadReportModal from './UploadReportModal.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function ReportCard({ report }) {
  const reportUrl = `${API_URL}/${report.filePath}`;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between transition-shadow hover:shadow-md">
      <div className="flex items-center gap-4 overflow-hidden">
        <div className="bg-green-100 p-3 rounded-full flex-shrink-0">
          <FileText className="h-6 w-6 text-green-700" />
        </div>
        <div className="overflow-hidden">
          <p className="font-semibold text-gray-800 truncate">{report.type}</p>
          <p className="text-sm text-gray-500">
            {new Date(report.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
      <a
        href={reportUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg text-sm hover:bg-gray-200 transition-colors"
      >
        <Download size={16} />
        View
      </a>
    </div>
  );
}

export default function ReportsScans({ patientData, currentUser, onDataRefresh }) {
  const { reportsAndScans = [], abhaId } = patientData;
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const isAdmin = currentUser?.role === 'admin';

  const handleUploadSuccess = () => {
    // --- DEBUGGING ---
    console.log("2. handleUploadSuccess in ReportsScans triggered. Calling onDataRefresh...");
    setIsModalOpen(false);
    onDataRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Reports & Scans</h1>
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 transition-all duration-200"
          >
            <Upload size={18} />
            Upload New Report
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportsAndScans.length > 0 ? (
          reportsAndScans.map((report, index) => (
            <ReportCard key={index} report={report} />
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 px-4 bg-white rounded-lg border border-gray-200">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No Reports Found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {isAdmin ? "Click 'Upload New Report' to add the first one." : "This patient does not have any uploaded reports or scans yet."}
            </p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <UploadReportModal 
          abhaId={abhaId}
          onClose={() => setIsModalOpen(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}

