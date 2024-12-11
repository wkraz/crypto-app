'use client';

import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

interface CryptoGraphProps {
  coinId: string;
  timeframe: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
  }[];
}

const CryptoGraph = ({ coinId, timeframe }: CryptoGraphProps) => {
  const [chartData, setChartData] = useState<ChartData>({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCoinData = async () => {
      try {
        const days = timeframe === '1D' ? '1' : timeframe === '1W' ? '7' : timeframe === '1M' ? '30' : timeframe === '1Y' ? '365' : 'max';
        const response = await fetch(`/api/coingecko?endpoint=/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`);
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        // Prepare data for the chart
        const prices = data.prices.map((price: [number, number]) => price[1]); // Get the price values
        const timestamps = data.prices.map((price: [number, number]) => {
          const date = new Date(price[0]);
          if (timeframe === '1D') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          if (timeframe === '1W' || timeframe === '1M') return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        });

        setChartData({
          labels: timestamps,
          datasets: [
            {
              label: 'Price in USD',
              data: prices,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true,
            },
          ],
        });
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCoinData();
  }, [coinId, timeframe]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">{coinId} Price Chart</h2>
      <Line data={chartData} />
    </div>
  );
};

export default CryptoGraph; 