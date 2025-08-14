import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    
    const response = await fetch(`${BACKEND_URL}/api/ai-trades/report/performance?range=${range}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching AI trade performance report:', error);
    
    // Return mock data for development/testing
    return NextResponse.json({
      totalTrades: 0,
      profitableTrades: 0,
      lossMakingTrades: 0,
      totalPnL: 0,
      avgPnL: 0,
      successRate: 0,
      avgConfidence: 0,
      bestTrade: {
        symbol: 'N/A',
        pnl: 0,
        percentPnL: 0,
        date: new Date(),
      },
      worstTrade: {
        symbol: 'N/A',
        pnl: 0,
        percentPnL: 0,
        date: new Date(),
      },
      monthlyPerformance: [],
      sentimentPerformance: [],
      riskLevelPerformance: [],
    });
  }
}
