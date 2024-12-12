interface SafetyMetrics {
  marketCap: number;
  volume24h: number;
  liquidityScore: number;
  developerScore: number;
  communityScore: number;
  priceChangePercentage24h: number;
  // New metrics for rug pull risk
  circulatingSupply: number;
  totalSupply: number;
  tokenLockupPercentage?: number;
  vestingPeriodCompleted?: boolean;
  twitterFollowers?: number;
  developerData?: {
    forks: number;
    stars: number;
    subscribers: number;
    commit_count_4_weeks: number;
    pull_requests_merged: number;
    pull_request_contributors: number;
  };
}

export const calculateSafetyScore = (metrics: SafetyMetrics) => {
  // Market Cap Score (0-30)
  const marketCapScore = Math.min(30, (Math.log10(metrics.marketCap) / Math.log10(1000000000000)) * 30);

  // Community Score (0-15) based on Twitter followers
  const communityScore = metrics.twitterFollowers 
    ? Math.min(15, (Math.log10(metrics.twitterFollowers) / Math.log10(10000000)) * 15)
    : 0;

  // Developer Score (0-15) based on GitHub metrics
  const developerScore = metrics.developerData ? calculateDevScore(metrics.developerData) : 0;

  // Liquidity Score (0-20) based on volume/market cap ratio
  // Higher ratio = better liquidity
  const liquidityScore = Math.min(20, (metrics.volume24h / metrics.marketCap) * 100);

  // Price Stability (0-10)
  const priceStabilityScore = Math.min(10, (100 - Math.abs(metrics.priceChangePercentage24h)) / 10);

  // Rug Pull Risk (0-10)
  const rugPullScore = calculateRugPullScore(metrics);

  return {
    score: Math.round(
      marketCapScore +
      communityScore +
      developerScore +
      liquidityScore +
      priceStabilityScore +
      rugPullScore
    ),
    breakdown: {
      marketCapScore,
      communityScore,
      developerScore,
      liquidityScore,
      priceStabilityScore,
      rugPullScore
    }
  };
};

const calculateDevScore = (devData: SafetyMetrics['developerData']) => {
  if (!devData) return 0;
  
  // Normalize each metric and weight them
  const forkScore = Math.min(3, (Math.log10(devData.forks) / Math.log10(50000)) * 3);
  const starScore = Math.min(3, (Math.log10(devData.stars) / Math.log10(100000)) * 3);
  const commitScore = Math.min(3, (devData.commit_count_4_weeks / 200) * 3);
  const prScore = Math.min(3, (Math.log10(devData.pull_requests_merged) / Math.log10(15000)) * 3);
  const contributorScore = Math.min(3, (Math.log10(devData.pull_request_contributors) / Math.log10(1000)) * 3);

  return forkScore + starScore + commitScore + prScore + contributorScore;
};

const calculateRugPullScore = (metrics: SafetyMetrics): number => {
  let score = 10;
  
  // Check supply concentration
  const circulatingRatio = metrics.circulatingSupply / metrics.totalSupply;
  if (circulatingRatio < 0.2) score -= 5; // High concentration risk
  else if (circulatingRatio < 0.5) score -= 3;
  
  // Check token lockup
  if (metrics.tokenLockupPercentage) {
    if (metrics.tokenLockupPercentage > 80) score -= 4;
    else if (metrics.tokenLockupPercentage > 50) score -= 2;
  }
  
  // Check vesting period
  if (metrics.vestingPeriodCompleted === false) {
    score -= 3;
  }
  
  return Math.max(0, score);
}; 