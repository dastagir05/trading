export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type Sentiment = "bullish" | "bearish" | "neutral";

export type AiTradeStatus =
  | "suggested"
  | "active"
  | "target_hit"
  | "stoploss_hit"
  | "expired"
  | "cancelled"
  | "complete"
  | "active_expired"
  | "completed"
  | "strategy_exit";

export type NoteType =
  | "info"
  | "warning"
  | "error"
  | "success"
  | "expired_on_time";

export type Charges = {
  brokerage: number;
  stt: number;
  gst: number;
  sebi: number;
  total: number;
};

export type AiTrade = {
  _id: string;
  aiTradeId: string;
  title: string;
  sentiment: Sentiment;

  setup: {
    currentPrice: number;
    instrument_key: string;
    strategy: string;
    strike: string;
    expiry: string;
    symbol: string;
    instrumentKey: string;
  };

  tradePlan: {
    entry: string;
    target: string;
    stopLoss: string;
    timeFrame: string;
  };

  logic?: string;
  confidence?: number;
  riskLevel?: RiskLevel;

  // Trade execution details
  status: AiTradeStatus;
  entryPrice?: number;
  entryTime?: Date | string | null;
  quantity?: number;
  marginUsed?: number;

  // Exit details
  exitPrice?: number | null;
  exitTime?: Date | string | null;
  exitReason?: string | null;

  // Performance
  pnl?: number | null;
  netPnL?: number | null;
  percentPnL?: number | null;
  charges?: Charges;

  // Timestamps
  suggestedAt?: string;
  activatedAt?: Date | string | null;
  completedAt?: Date | string | null;

  // Validity
  isValid: boolean;
  expiryDate?: Date | string | null;

  // Tags
  tags?: string[];

  // Notes
  notes?: {
    timestamp: string;
    message: string;
    type: NoteType;
  }[];

  // Strategy flags
  isStrategy: boolean;
  processedToStrategy: boolean;

  createdAt: string;
  updatedAt: string;
};
