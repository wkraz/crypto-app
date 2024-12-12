interface CoinMetrics {
  // Price Data
  current_price: {
    usd: number;
  };
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  price_change_percentage_14d: number;
  price_change_percentage_30d: number;
  price_change_percentage_60d: number;
  price_change_percentage_200d: number;
  price_change_percentage_1y: number;

  // Market Data
  market_cap: {
    usd: number;
  };
  fully_diluted_valuation: {
    usd: number;
  };
  total_volume: {
    usd: number;
  };
  high_24h: {
    usd: number;
  };
  low_24h: {
    usd: number;
  };

  // Supply Data
  circulating_supply: number;
  total_supply: number;
  max_supply: number;

  // Market Position
  market_cap_rank: number;
  market_cap_fdv_ratio: number;

  // Trading Data
  total_value_locked: number;
  mcap_to_tvl_ratio: number;
  fdv_to_tvl_ratio: number;

  // Developer Data
  developer_score: number;
  community_score: number;
  liquidity_score: number;
  public_interest_score: number;

  // Additional Data
  coingecko_score: number;
  coingecko_rank: number;
  alexa_rank: number;
}

export interface SafetyMetrics {
  marketCap: number;
  volume24h: number;
  priceChangePercentage24h: number;
  circulatingSupply: number;
  totalSupply: number;
  twitterFollowers?: number;
  developerData?: {
    forks: number;
    stars: number;
    commit_count_4_weeks: number;
    pull_requests_merged: number;
    pull_request_contributors: number;
  };
  // Optional properties for rug pull assessment
  tokenLockupPercentage?: number;
  vestingPeriodCompleted?: boolean;
} 