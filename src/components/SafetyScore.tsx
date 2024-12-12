import React from 'react';
import { formatNumber, formatPercentage } from '../utils/formatters';
import { SafetyMetrics } from '@/types/metrics';

interface SafetyScoreProps {
  metrics: SafetyMetrics;
}

interface ScoreBreakdown {
  marketCapScore: number;
  supplyScore: number;
  communityScore: number;
  developerScore: number;
  priceStabilityScore: number;
}

interface ScoreComponentProps {
  label: string;
  score: number;
  maxScore: number;
  detail: string;
}

const calculateDevScore = (devData: any) => {
    const forkScore = Math.min(3, (Math.log10(devData.forks) / Math.log10(50000)) * 3);
    const starScore = Math.min(3, (Math.log10(devData.stars) / Math.log10(100000)) * 3);
    const commitScore = Math.min(3, (devData.commit_count_4_weeks / 200) * 3);
    const prScore = Math.min(3, (Math.log10(devData.pull_requests_merged) / Math.log10(15000)) * 3);
    const contributorScore = Math.min(3, (Math.log10(devData.pull_request_contributors) / Math.log10(1000)) * 3);
  
    return forkScore + starScore + commitScore + prScore + contributorScore;
  };

const calculateSafetyScore = (metrics: SafetyScoreProps['metrics']): {
  score: number;
  breakdown: ScoreBreakdown;
} => {
  // Market Cap Score (0-25)
  const marketCapScore = Math.min(25, (Math.log10(metrics.marketCap) / Math.log10(1000000000000)) * 25);

  // Supply Distribution Score (0-25)
  const supplyRatio = metrics.circulatingSupply / metrics.totalSupply;
  const supplyScore = Math.min(25, supplyRatio * 25);

  // Community Score (0-15)
  const twitterScore = metrics.twitterFollowers 
    ? (Math.log10(metrics.twitterFollowers) / Math.log10(10000000))
    : 0;
  const communityScore = Math.min(15, Math.min(1, twitterScore) * 15);

  // Developer Score (0-20)
  const rawDevScore = metrics.developerData ? calculateDevScore(metrics.developerData) : 0;
  const developerScore = Math.min(20, (Math.min(1, rawDevScore / 15)) * 20);

  // Price Stability Score (0-15)
  const priceStabilityScore = Math.min(15, (100 - Math.abs(metrics.priceChangePercentage24h)) / 100 * 15);

  const totalScore = Math.round(
    marketCapScore +
    supplyScore +
    communityScore +
    developerScore +
    priceStabilityScore
  );

  return {
    score: totalScore,
    breakdown: {
      marketCapScore,
      supplyScore,
      communityScore,
      developerScore,
      priceStabilityScore
    }
  };
};

const calculateRugPullScore = (metrics: SafetyScoreProps['metrics']): number => {
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

const getLetterGrade = (score: number): string => {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 75) return 'A-';
  if (score >= 70) return 'B+';
  if (score >= 65) return 'B';
  if (score >= 60) return 'B-';
  if (score >= 55) return 'C+';
  if (score >= 50) return 'C';
  if (score >= 45) return 'C-';
  if (score >= 40) return 'D+';
  if (score >= 35) return 'D';
  if (score >= 30) return 'D-';
  return 'F';
};

const ScoreComponent: React.FC<ScoreComponentProps> = ({ label, score, maxScore, detail }) => (
  <div className="flex items-center justify-between">
    <div>
      <span className="font-medium">{label}</span>
      <span className="text-sm text-gray-500 ml-2">({detail})</span>
    </div>
    <div className="font-medium">
      {score.toFixed(1)}/{maxScore}
    </div>
  </div>
);

const SafetyScore: React.FC<SafetyScoreProps> = ({ metrics }) => {
  const {
    score,
    breakdown
  } = calculateSafetyScore(metrics);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Safety Score</h2>
        <div className="text-2xl font-bold">
          {score}/100
          <span className="ml-2 text-sm text-gray-500">
            ({getLetterGrade(score)})
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <ScoreComponent 
          label="Market Cap" 
          score={breakdown.marketCapScore} 
          maxScore={25}
          detail={`${formatNumber(metrics.marketCap)}`}
        />
        <ScoreComponent 
          label="Supply Distribution" 
          score={breakdown.supplyScore} 
          maxScore={25}
          detail={`${(metrics.circulatingSupply / metrics.totalSupply * 100).toFixed(1)}% circulating`}
        />
        <ScoreComponent 
          label="Community Score" 
          score={breakdown.communityScore} 
          maxScore={15}
          detail={`Score: ${breakdown.communityScore.toFixed(2)}/1`}
        />
        <ScoreComponent 
          label="Developer Activity" 
          score={breakdown.developerScore} 
          maxScore={20}
          detail={`Score: ${breakdown.developerScore.toFixed(2)}/1`}
        />
        <ScoreComponent 
          label="Price Stability" 
          score={breakdown.priceStabilityScore} 
          maxScore={15}
          detail={`${formatPercentage(metrics.priceChangePercentage24h)} (24h)`}
        />
        <div className="mt-4">
          <h3 className="font-semibold">Rug Pull Risk Assessment</h3>
          <div className="mt-2 text-sm">
            <ScoreComponent 
              label="Supply Distribution" 
              score={breakdown.supplyScore} 
              maxScore={25}
              detail={`${(metrics.circulatingSupply / metrics.totalSupply * 100).toFixed(1)}% circulating`}
            />
            {metrics.tokenLockupPercentage && (
              <div className="mt-1">
                Token Lockup: {metrics.tokenLockupPercentage}%
                {metrics.vestingPeriodCompleted ? ' (Completed)' : ' (In Progress)'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>Score Breakdown:</p>
        <ul className="list-disc list-inside mt-2">
          <li>Market Cap (25%): Higher market capitalization indicates greater adoption and reduced manipulation risk</li>
          <li>Supply Distribution (25%): Well-distributed token supply reduces centralization and whale manipulation risks</li>
          <li>Community (15%): Strong community engagement suggests legitimate project with long-term support</li>
          <li>Developer Activity (20%): Active development indicates project maintenance and growth</li>
          <li>Price Stability (15%): Lower price volatility suggests market maturity and reduced speculation</li>
        </ul>
      </div>
    </div>
  );
};

export default SafetyScore; 