'use client';

import React, { useState, useEffect } from 'react';
import CryptoGraph from '../components/CryptoGraph';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('bitcoin'); // Default to Bitcoin
  const [timeframe, setTimeframe] = useState('1W'); // Default timeframe
  const [metrics, setMetrics] = useState({
    marketCap: '',
    currentPrice: '',
    sevenDayTrend: '',
    liquidity: '',
  });
  const commonCoins = ['Bitcoin', 'Ethereum', 'Solana', 'Cardano', 'Ripple'];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCoinClick = (coin: string) => {
    setSearchTerm(coin);
  };

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
  };

  useEffect(() => {
    const fetchCoinMetrics = async () => {
      try {
        const response = await fetch(`/api/coingecko?endpoint=/coins/${searchTerm.toLowerCase()}`);
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setMetrics({
          marketCap: data.market_data.market_cap.usd,
          currentPrice: data.market_data.current_price.usd,
          sevenDayTrend: data.market_data.price_change_percentage_7d,
          liquidity: data.market_data.total_liquidity,
        });
      } catch (error) {
        console.error('Error fetching coin metrics:', error);
      }
    };

    fetchCoinMetrics();
  }, [searchTerm]);

  return (
    <div className="flex flex-col h-screen bg-white text-black">
      {/* Top Half: Search Bar and Common Coins */}
      <div className="flex flex-col items-center justify-center flex-1">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search for a cryptocurrency..."
          className="border border-gray-300 rounded-lg p-2 mb-4 w-1/2"
        />
        
        <div className="flex space-x-4 mb-4">
          {commonCoins.map((coin) => (
            <button
              key={coin}
              onClick={() => handleCoinClick(coin)}
              className="bg-gray-200 hover:bg-gray-300 text-black font-semibold py-2 px-4 rounded"
            >
              {coin}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Half: Graph and Metrics */}
      <div className="flex flex-1">
        {/* Left Side: Key Metrics and Safety Score */}
        <div className="flex flex-col w-1/3 p-4 border-r border-gray-300">
          <h2 className="text-lg font-semibold mb-2">Key Metrics</h2>
          <div className="flex-grow">
            <p>Market Cap: ${metrics.marketCap}</p>
            <p>Current Price: ${metrics.currentPrice}</p>
            <p>7 Day Price Trend: {metrics.sevenDayTrend}%</p>
            <p>Liquidity: ${metrics.liquidity}</p>
          </div>
          <h2 className="text-lg font-semibold mb-2">Safety Score</h2>
          <div>
            <p>Safety Score: B</p>
          </div>
        </div>

        {/* Right Side: Graph */}
        <div className="flex flex-col w-2/3 p-4">
          <div className="flex justify-center mb-4">
            {['1D', '1W', '1M', '1Y', 'All'].map((timeframeOption) => (
              <button
                key={timeframeOption}
                onClick={() => handleTimeframeChange(timeframeOption)}
                className={`bg-gray-200 hover:bg-gray-300 text-black font-semibold py-2 px-4 rounded mx-2 ${timeframe === timeframeOption ? 'bg-gray-300' : ''}`}
              >
                {timeframeOption}
              </button>
            ))}
          </div>
          <CryptoGraph coinId={searchTerm.toLowerCase()} timeframe={timeframe} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;