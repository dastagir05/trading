import { Trade } from "./trade";
export type User = {
  _id: string;
  name: string;
  email?: string;
  image: string;
  provider: string;
  providerId: string;
  role: string;
  lastLogin: Date;
  totalMoney: number;
  realisedPL: number;
  unrealisedPL: number;
  netPL: number;
  pnl: number;
  avgPnL: number;
  totalProfit: number;
  totalLoss: number;
  totalEstCharge: number;
  totalTrades: number;
  winRate: number;
  openPositions: number;
  lastTradeAt: Date;
  bestTrade: Trade;
  worstTrade: Trade;
  currSymbols: string;
  frequencySymbols: Map<string, number>;
  favouriteSymbols: string[];
  totalCompletedTrades: number | undefined | null;

  createdAt: string;
  updatedAt: string;

};
