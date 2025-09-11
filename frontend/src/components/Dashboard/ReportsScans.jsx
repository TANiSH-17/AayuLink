import React from 'react';

// Mock data for scans/reports. In a real app, this would come from the patient data.
const mockReports = [
    { id: 1, title: "Chest X-Ray", date: "2023-12-05", url: "https://i.ibb.co/6y4R0bW/x-ray.jpg", type: "Scan" },
    { id: 2, title: "MRI Brain Scan", date: "2022-02-25", url: "https://i.ibb.co/3s2d5d8/mri.jpg", type: "Scan" },
    { id: 3, title: "Blood Report", date: "2020-08-10", url: "https://i.ibb.co/VvZg1f6/blood-report.jpg", type: "Report" },
    { id: 4, title: "Dental X-Ray", date: "2019-09-05", url: "https://i.ibb.co/6y4R0bW/x-ray.jpg", type: "Scan" },
];

export default function ReportsScans() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Medical Reports & Scans</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {mockReports.map(report => (
                    <div key={report.id} className="bg-white rounded-lg border overflow-hidden shadow-sm hover:shadow-xl transition-shadow group">
                        <div className="relative">
                            <img src={report.url} alt={report.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"/>
                            <span className="absolute top-2 right-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full">{report.type}</span>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-gray-800">{report.title}</h3>
                            <p className="text-sm text-gray-500">{report.date}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
