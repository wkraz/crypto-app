import React, { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  market_cap_rank: number;
  thumb: string;  // thumbnail URL
}

interface SearchBarProps {
  defaultCoin: string;
  onCoinSelect: (coinId: string) => void;
}

const SearchBar = ({ defaultCoin, onCoinSelect }: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState(defaultCoin);
  const [suggestions, setSuggestions] = useState<Coin[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!isSearching || debouncedSearch.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`/api/coingecko?endpoint=/search?query=${encodeURIComponent(debouncedSearch)}`);
        const data = await response.json();
        
        // Sort by market cap rank and take top 10
        const sortedCoins = data.coins
          .filter((coin: Coin) => coin.market_cap_rank)
          .sort((a: Coin, b: Coin) => (a.market_cap_rank || Infinity) - (b.market_cap_rank || Infinity))
          .slice(0, 10);
        
        setSuggestions(sortedCoins);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [debouncedSearch, isSearching]);

  const handleFocus = () => {
    setIsSearching(true);
    setSearchTerm('');
  };

  const handleBlur = () => {
    // Small delay to allow click events on suggestions to fire
    setTimeout(() => {
      setIsSearching(false);
    }, 200);
  };

  const handleCoinSelect = (coin: Coin) => {
    setSearchTerm(coin.name);
    setSuggestions([]);
    setIsSearching(false);
    onCoinSelect(coin.id);
  };

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Search for a cryptocurrency..."
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {suggestions.length > 0 && isSearching && (
        <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
          {suggestions.map((coin) => (
            <div
              key={coin.id}
              onClick={() => handleCoinSelect(coin)}
              className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
            >
              <img 
                src={coin.thumb} 
                alt={coin.name} 
                className="w-6 h-6 mr-2"
              />
              <div>
                <div className="font-medium">{coin.name}</div>
                <div className="text-sm text-gray-500">
                  {coin.symbol.toUpperCase()} • Rank #{coin.market_cap_rank}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar; 