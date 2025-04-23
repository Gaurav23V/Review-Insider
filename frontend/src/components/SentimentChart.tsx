// src/components/SentimentChart.tsx
"use client"; // Mark as a Client Component

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
  TimeScale, // Import TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns'; // Import the date adapter

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale // Register TimeScale
);

type SentimentDataPoint = {
  review_date: string;
  score: number | null;
};

interface SentimentChartProps {
  data: SentimentDataPoint[];
}

export default function SentimentChart({ data }: SentimentChartProps) {
  const chartData = {
    // Use dates directly for the time scale
    labels: data.map(d => new Date(d.review_date)),
    datasets: [
      {
        label: 'Sentiment Score (1-5)',
        data: data.map(d => d.score),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow chart to fill container height
    scales: {
      x: {
        type: 'time' as const, // Specify 'time' scale
        time: {
          unit: 'day' as const, // Display unit (day, week, month)
          tooltipFormat: 'PPpp', // Format for tooltips (e.g., Apr 23, 2025, 1:00:00 PM)
          displayFormats: {
             day: 'MMM d' // Format for axis labels (e.g., Apr 23)
          }
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        beginAtZero: false, // Don't force start at 0
        min: 1, // Set min/max for sentiment score
        max: 5,
        title: {
          display: true,
          text: 'Sentiment Score',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false, // Hide default chart title (we have our own heading)
        // text: 'Sentiment Score Over Time',
      },
    },
  };

  // Add a container with a defined height for the chart
  return (
    <div style={{ height: '300px', position: 'relative' }}>
      <Line options={options} data={chartData} />
    </div>
  );
}
