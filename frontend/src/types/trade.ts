type Charges = {
  brokerage:number,
  stt:number,
  gst:number,
  sebi:number,
  total:number,
}
export type Trade = {
  _id: string;
  userId: string;
  symbol: string;
  instrumentKey: string;
  quantity: number;
  entryPrice: number ;
  side: "buy" | "sell";
  status: string;
  marginUsed: number;
  capCategory: 'large' | 'mid' | 'small' | 'index';
  validityTime: Date | string | null;
  pnl: number | undefined | null;
  percentPnL: number | undefined | null;
  netpnl: number | undefined | null;
  exitPrice: number | undefined | null;
  exitTime: Date | string | null;
  charges: Charges | undefined;
  entryTime: Date | string | null;
  stoploss: number | undefined | null;
  target: number | undefined | null;
  validity: string | null;
  createdAt: string;
  updatedAt: Date | string;
};
// status: 'inprocess' | 'completed' | 'cancelled' | 'rejected';
