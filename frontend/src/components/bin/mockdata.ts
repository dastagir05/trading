
import { Trade } from "@/types/trade"
// 👇 Make only the optional fields optional
export type MockTrade = Omit<Trade, 'stoploss' | 'target' | 'validity'> &
  Partial<Pick<Trade, 'stoploss' | 'target' | 'validity'>>;


export const mockTrades: MockTrade[] = [
    {
      _id: "6879de0bd016a8645ed11266",
      userId: "686bf73449c55dc480543664",
      symbol: "RELIANCE",
      instrumentKey: "NSE_EQ|INE002A01018",
      quantity: 1,
      entryPrice: 1470.9,
      validityTime: "2025-07-18T09:50:00.000+00:00",
      side: "buy",
      marginUsed: 1470.9,
      capCategory: "large",
      estCharge: 40,
      status: "inprocess",
      createdAt: "2025-07-18T05:39:23.737+00:00",
      updatedAt: "2025-07-18T05:39:23.737+00:00"
    },
    {
      _id: "6879de0bd016a8645ed11267",
      userId: "686bf73449c55dc480543664",
      symbol: "TCS",
      instrumentKey: "NSE_EQ|INE467B01029",
      quantity: 2,
      entryPrice: 4156.75,
      validityTime: "2025-07-17T15:30:00.000+00:00",
      side: "buy",
      marginUsed: 8313.5,
      capCategory: "large",
      estCharge: 85,
      status: "completed",
      createdAt: "2025-07-17T10:15:30.000+00:00",
      updatedAt: "2025-07-17T10:16:45.000+00:00"
    },
    {
      _id: "6879de0bd016a8645ed11268",
      userId: "686bf73449c55dc480543664",
      symbol: "HDFCBANK",
      instrumentKey: "NSE_EQ|INE040A01034",
      quantity: 5,
      entryPrice: 1687.25,
      validityTime: "2025-07-16T15:30:00.000+00:00",
      side: "sell",
      marginUsed: 8436.25,
      capCategory: "large",
      estCharge: 92,
      status: "completed",
      createdAt: "2025-07-16T14:22:15.000+00:00",
      updatedAt: "2025-07-16T14:23:30.000+00:00"
    },
    {
      _id: "6879de0bd016a8645ed11269",
      userId: "686bf73449c55dc480543664",
      symbol: "INFY",
      instrumentKey: "NSE_EQ|INE009A01021",
      quantity: 3,
      entryPrice: 1834.50,
      validityTime: "2025-07-15T15:30:00.000+00:00",
      side: "buy",
      marginUsed: 5503.5,
      capCategory: "large",
      estCharge: 68,
      status: "cancelled",
      createdAt: "2025-07-15T11:45:20.000+00:00",
      updatedAt: "2025-07-15T11:50:10.000+00:00"
    },
    {
      _id: "6879de0bd016a8645ed11270",
      userId: "686bf73449c55dc480543664",
      symbol: "BHARTIARTL",
      instrumentKey: "NSE_EQ|INE397D01024",
      quantity: 10,
      entryPrice: 1234.80,
      validityTime: "2025-07-14T15:30:00.000+00:00",
      side: "buy",
      marginUsed: 12348,
      capCategory: "large",
      estCharge: 125,
      status: "rejected",
      createdAt: "2025-07-14T13:30:45.000+00:00",
      updatedAt: "2025-07-14T13:35:20.000+00:00"
    }
  ];
  