type Charges = {
    brokerage: number;
    stt: number;
    gst: number;
    sebi: number;
    total: number;
  };
  
  export type FutTrade = {
    _id: string;
    userId: string;
  
    // Futures-specific
    tradingSymbol: string;                // e.g. RELIANCE28AUG24FUT
    instrumentKey: string;                // e.g. NSE_FO|12345
    expiry: string;                       // ISO date string
    lotSize: number;
  
    // Order Info
    quantity: number;
    entryPrice: number;
    side: "buy" | "sell";
    marginUsed: number;
    status: 'inprocess' | 'completed' | 'cancelled' | 'rejected';
  
    // P&L and Price Tracking
    pnl: number | null;
    percentPnL: number | null;
    netpnl: number | null;
    exitPrice: number | null;
    exitTime: Date | string | null;
    entryTime: Date | string | null;
  
    // Optional Controls
    stoploss: number | null;
    target: number | null;
    validityTime: Date | string | null;
    validity: string | null;
  
    // Fees
    charges: Charges;
  
    // Timestamps
    createdAt: string;
    updatedAt: Date | string;
  };
  