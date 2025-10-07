interface Profile {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  joinDate?: { date: string; time: string };
  kycStatus?: string;
  profilePicture?: string;
  provider?: string;
  lastLogin?: string;
  panNumber?: string;
  bankAccount?: string;
  tradingExperience?: string;
}

interface Trading {
  totalMoney?: number;
  totalInvested?: number;
  currentValue?: number;
  realisePL?: number;
  unralisePL?: number;
  pnl?: number;
  avgPnL?: number;
  totalEstCharge?: number;
  totalGains?: number;
  gainsPercentage?: number;
  totalLoses?: number;
  availableFunds?: number;
  totalTrades?: number;
  totalCompleteTrade?: number;
  successfulTrades?: number;
  successRate?: number;
  avgHoldingPeriod?: string;
  riskProfile?: string;
  favoriteStocks?: string[];
  monthlyTradingVolume?: number;
}

export interface UserData {
  profile: Profile;
  trading: Trading;
}
