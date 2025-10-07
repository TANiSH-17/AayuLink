import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function PredictionChart({ forecastData }) {
  const data = {
    labels: forecastData.map(d => `Day ${d.day}`),
    datasets: [
      {
        label: 'Projected Infectious Patients',
        data: forecastData.map(d => d.infectious),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.2,
      },
      {
        label: 'Projected Exposed Patients',
        data: forecastData.map(d => d.exposed),
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
        tension: 0.2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '14-Day Infection Forecast',
        font: { size: 16 }
      },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                stepSize: 1
            }
        }
    }
  };

  return <Line options={options} data={data} />;
}