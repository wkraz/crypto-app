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
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="flex-1">
      <span className="font-medium text-gray-800">{label}</span>
      <span className="text-sm text-gray-500 ml-2">({detail})</span>
    </div>
    <div className="flex items-center">
      <div className="w-16 h-2 bg-gray-200 rounded-full mr-3">
        <div 
          className={`h-full rounded-full ${
            (score/maxScore) >= 0.7 ? 'bg-green-500' : 
            (score/maxScore) >= 0.5 ? 'bg-yellow-500' : 
            'bg-red-500'
          }`}
          style={{ width: `${(score/maxScore) * 100}%` }}
        />
      </div>
      <span className="font-medium text-gray-800 w-16 text-right">
        {score.toFixed(1)}/{maxScore}
      </span>
    </div>
  </div>
);

const SafetyScore: React.FC<SafetyScoreProps> = ({ metrics }) => {
  const { score, breakdown } = calculateSafetyScore(metrics);

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Safety Score</h2>
        <div className="flex items-center">
          <div className="text-3xl font-bold text-gray-800">{score}</div>
          <div className="text-lg text-gray-500 ml-1">/100</div>
          <span className="ml-3 px-3 py-1 text-sm font-semibold rounded-full bg-opacity-10 
            ${score >= 70 ? 'bg-green-100 text-green-800' : 
              score >= 50 ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'}">
            {getLetterGrade(score)}
          </span>
        </div>
      </div>

      <div className="space-y-4 mb-8">
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
          label="Developer Activity" 
          score={breakdown.developerScore} 
          maxScore={20}
          detail={`${metrics.developerData?.commit_count_4_weeks || 0} commits (4w)`}
        />
        <ScoreComponent 
          label="Community Score" 
          score={breakdown.communityScore} 
          maxScore={15}
          detail={`${formatNumber(metrics.twitterFollowers || 0)} followers`}
        />
        <ScoreComponent 
          label="Price Stability" 
          score={breakdown.priceStabilityScore} 
          maxScore={15}
          detail={`${formatPercentage(metrics.priceChangePercentage24h)} (24h)`}
        />
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="font-medium text-gray-800 mb-3">Score Breakdown:</p>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>Market Cap (25%):</strong> Higher market capitalization indicates greater adoption and reduced manipulation risk</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>Supply Distribution (25%):</strong> Well-distributed token supply reduces centralization and rug pull risks</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>Developer Activity (20%):</strong> Active development indicates project maintenance and growth</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>Community (15%):</strong> Strong community engagement suggests legitimate project with long-term support</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>Price Stability (15%):</strong> Lower price volatility suggests market maturity and reduced speculation</span>
          </li>
        </ul>
        <div className="mt-4 p-3 bg-red-50 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Rug Pull Risk:</strong> A safety score below 50 indicates higher risk of a rug pull. 
            Low supply distribution, minimal developer activity, and weak community engagement are common 
            red flags for potential scams.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SafetyScore; 