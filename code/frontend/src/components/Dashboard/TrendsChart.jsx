import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function TrendsChart() {
  const [chartData, setChartData] = useState({ datasets: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/analytics/prescription-trends`);
        const apiData = res.data;
        const labels = apiData.map(d => d.month);
        const antibioticClasses = Object.keys(apiData[0] || {}).filter(key => key !== 'month');

        setChartData({
          labels,
          datasets: antibioticClasses.map((cls, index) => {
            const colors = ['rgba(239, 68, 68, 0.7)', 'rgba(249, 115, 22, 0.7)', 'rgba(234, 179, 8, 0.7)'];
            return {
              label: cls,
              data: apiData.map(d => d[cls]),
              backgroundColor: colors[index % colors.length],
            };
          }),
        });

      } catch (error) {
        console.error("Failed to fetch trend data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const options = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true },
    },
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading Prescription Trends...</div>;
  }

  return <Bar options={options} data={chartData} />;
}