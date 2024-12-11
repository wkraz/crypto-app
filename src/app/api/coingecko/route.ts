import { NextResponse } from 'next/server';

const CACHE_TTL = 60 * 1000; // 1 minute
const cache = new Map();

async function fetchWithRetries(url: string, retries = 3, delay = 1000) {
  const headers = {
    'x-cg-demo-api-key': process.env.COINGECKO_API_KEY || '',
    'Content-Type': 'application/json',
  };

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        const errorDetails = await response.json(); // Get the error details
        console.error('API Error Details:', errorDetails); // Log the error details
        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After");
          const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : delay;
          console.log(`Rate limited, waiting ${waitTime}ms`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      if (attempt === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay * (attempt + 1)));
    }
  }
}

export async function GET(request: Request) {
  try {
    console.log('Request URL:', request.url); // Log the incoming request URL
    const url = new URL(request.url);
    
    // Get the endpoint directly from searchParams
    const endpoint = url.searchParams.get('endpoint');

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 });
    }

    // Log the endpoint to verify it includes 'days'
    console.log('Endpoint:', endpoint); // This should show the full endpoint including 'days'

    // Check if 'days' parameter is included in the endpoint
    if (!url.searchParams.has('days')) {
      return NextResponse.json({ error: 'Missing parameter days' }, { status: 400 });
    }

    // Construct the API URL correctly
    const apiUrl = `https://api.coingecko.com/api/v3${endpoint}`; // Use the endpoint directly
    console.log('Fetching from CoinGecko:', apiUrl); // Log the full URL
    
    const data = await fetchWithRetries(apiUrl);
    return NextResponse.json(data);
  } catch (error) {
    console.error('CoinGecko API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from CoinGecko', details: (error as Error).message },
      { status: 500 }
    );
  }
} 