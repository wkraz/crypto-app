interface CoinData {
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  // Add more metrics as needed
}

export function calculateSafetyScore(coinData: CoinData): number {
  // This is a basic example - you'll want to expand this with your actual logic
  const {
    market_cap,
    total_volume,
    price_change_percentage_24h,
  } = coinData;

  // Example factors to consider:
  // 1. Market cap (higher is safer)
  // 2. Volume (higher relative to market cap is safer)
  // 3. Price stability (lower volatility is safer)
  
  let score = 0;
  
  // Market cap score (0-40 points)
  const marketCapScore = Math.min(40, Math.log10(market_cap) * 4);
  
  // Volume/Market cap ratio score (0-30 points)
  const volumeRatio = total_volume / market_cap;
  const volumeScore = Math.min(30, volumeRatio * 100);
  
  // Price stability score (0-30 points)
  const volatilityScore = Math.max(0, 30 - Math.abs(price_change_percentage_24h));
  
  score = marketCapScore + volumeScore + volatilityScore;
  
  // Normalize to 0-100
  return Math.min(100, Math.max(0, score));
} 