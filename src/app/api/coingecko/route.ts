import { NextResponse } from 'next/server';

const BASE_URL = 'https://api.coingecko.com/api/v3';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

interface ErrorResponse {
  error: string;
}

const getDaysParameter = (timeframe: string): string => {
  switch (timeframe) {
    case '1D': return '1';
    case '1W': return '7';
    case '1M': return '30';
    case '1Y': return '365';
    case 'All': return 'max';
    default: return '7';
  }
};

async function fetchWithRetries(url: string, retryCount = 0): Promise<any> {
  const headers = {
    'x-cg-demo-api-key': process.env.COINGECKO_API_KEY || '',
  };

  try {
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      console.error('API Error Details:', errorData);

      // Handle rate limiting
      if (response.status === 429 && retryCount < MAX_RETRIES) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '1', 10);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return fetchWithRetries(url, retryCount + 1);
      }

      throw new Error(`API Error: ${errorData.error}`);
    }

    return await response.json();
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetries(url, retryCount + 1);
    }
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 });
    }

    // Extract coinId from endpoint if it's a coin-specific endpoint
    const coinMatch = endpoint.match(/\/coins\/([^\/]+)/);
    const coinId = coinMatch ? coinMatch[1] : null;

    let apiUrl: string;
    if (endpoint.includes('market_chart')) {
      const days = searchParams.get('days') || '7';
      apiUrl = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}days=${days}`;
    } else {
      apiUrl = `${BASE_URL}${endpoint}`;
    }

    console.log('Fetching from CoinGecko:', apiUrl);
    const data = await fetchWithRetries(apiUrl);
    
    // Debug log the specific fields we're interested in
    if (coinId && !endpoint.includes('market_chart')) {
      console.log('API Response Debug:', {
        coin: coinId,
        liquidity_score: data.liquidity_score,
        developer_score: data.developer_score,
        community_score: data.community_score,
        community_data: data.community_data,
        developer_data: data.developer_data
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('CoinGecko API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from CoinGecko' },
      { status: 500 }
    );
  }
} 