'use client';

import React, { useState, useEffect } from 'react';
import CryptoGraph from '../components/CryptoGraph';
import SearchBar from '../components/SearchBar';
import SafetyScore from '@/components/SafetyScore';
import { formatNumber, formatPercentage } from '@/utils/formatters';
import Image from 'next/image';

const HomePage = () => {
  const [selectedCoin, setSelectedCoin] = useState('bitcoin'); // Default to Bitcoin
  const [timeframe, setTimeframe] = useState('1W'); // Default timeframe
  const [coinData, setCoinData] = useState<any>(null);
  const commonCoins = ['Bitcoin', 'Ethereum', 'Solana', 'Cardano', 'Ripple'];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCoin(e.target.value);
  };

  const handleCoinClick = (coin: string) => {
    setSelectedCoin(coin);
  };

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
  };

  useEffect(() => {
    const fetchCoinMetrics = async () => {
      try {
        const response = await fetch(`/api/coingecko?endpoint=/coins/${selectedCoin.toLowerCase()}`);
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setCoinData(data);
      } catch (error) {
        console.error('Error fetching coin metrics:', error);
      }
    };

    fetchCoinMetrics();
  }, [selectedCoin]);

  useEffect(() => {
    if (coinData) {
      console.log('Debug Scores:', {
        liquidityScore: coinData.liquidity_score,
        developerScore: coinData.developer_score,
        communityScore: coinData.community_score,
        rawData: coinData // Log full response
      });
    }
  }, [coinData]);

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      {/* Logo, Search, and Common Coins Section */}
      <div className="flex items-center justify-between p-8">
        <div className="flex items-center">
          <Image
            src="/CryptoGuardian.png"
            alt="Crypto Guardian Logo"
            width={80}
            height={80}
            className="rounded-lg"
          />
          <h1 className="ml-4 text-4xl font-bold text-gray-800">
            Crypto Guardian
          </h1>
        </div>
        
        <div className="flex items-center space-x-8">
          <div className="w-96">
            <SearchBar 
              defaultCoin={selectedCoin} 
              onCoinSelect={(coinId) => setSelectedCoin(coinId)} 
            />
          </div>
          
          <div className="flex space-x-2">
            {commonCoins.map((coin) => (
              <button
                key={coin}
                onClick={() => handleCoinClick(coin)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-1.5 px-3 rounded-md transition-colors"
              >
                {coin}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 p-8">
        {/* Left Panel - Metrics and Safety Score */}
        <div className="w-1/3 pr-8 space-y-8">
          {/* Key Metrics Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Key Metrics</h2>
            <div className="space-y-2">
              <MetricRow 
                label="Market Cap" 
                value={`${formatNumber(coinData?.market_data?.market_cap?.usd || 0)}`}
              />
              <MetricRow 
                label="Current Price" 
                value={`${formatNumber(coinData?.market_data?.current_price?.usd || 0)}`}
              />
              <MetricRow 
                label="24h Volume" 
                value={`${formatNumber(coinData?.market_data?.total_volume?.usd || 0)}`}
              />
              <MetricRow 
                label="Circulating Supply" 
                value={formatNumber(coinData?.market_data?.circulating_supply || 0)}
              />
              <MetricRow 
                label="Total Supply" 
                value={formatNumber(coinData?.market_data?.total_supply || 0)}
              />
              <MetricRow 
                label="Max Supply" 
                value={formatNumber(coinData?.market_data?.max_supply || 0)}
              />
              <MetricRow 
                label="7d Price Change" 
                value={formatPercentage(coinData?.market_data?.price_change_percentage_7d || 0)}
                isPercentage={true}
              />
            </div>
          </div>

          {/* Safety Score Component */}
          {coinData && (
            <SafetyScore
              metrics={{
                marketCap: coinData?.market_data?.market_cap?.usd || 0,
                volume24h: coinData?.market_data?.total_volume?.usd || 0,
                twitterFollowers: coinData?.community_data?.twitter_followers || 0,
                developerData: coinData?.developer_data,
                priceChangePercentage24h: coinData?.market_data?.price_change_percentage_24h || 0,
                circulatingSupply: coinData?.market_data?.circulating_supply || 0,
                totalSupply: coinData?.market_data?.total_supply || 0
              }}
            />
          )}
        </div>

        {/* Right Panel - Price Chart */}
        <div className="w-2/3">
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
          <CryptoGraph coinId={selectedCoin.toLowerCase()} timeframe={timeframe} />
        </div>
      </div>
    </div>
  );
};

interface MetricRowProps {
  label: string;
  value: string | number;
  isPercentage?: boolean;
}

const MetricRow: React.FC<MetricRowProps> = ({ label, value, isPercentage }) => {
  let displayValue = value.toString();
  if (label === "Market Cap" || label === "Current Price" || label === "24h Volume") {
    displayValue = `${value}`;
  } else if (displayValue.startsWith('$')) {
    displayValue = displayValue.substring(1);
  }

  const valueClass = isPercentage
    ? `font-medium ${parseFloat(value.toString()) >= 0 ? 'text-green-600' : 'text-red-600'}`
    : 'font-medium';

  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-gray-600">{label}</span>
      <span className={valueClass}>{displayValue}</span>
    </div>
  );
};

export default HomePage;