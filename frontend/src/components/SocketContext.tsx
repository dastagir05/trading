"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ActiveTrade } from "./aiReport/AiTradeMonitor";

export type Trade = {
  id: string;
  status: string;
  isStrategy: boolean;
  aiTradeId: string;
  currentPrice: number;
  // add more fields as needed
};

type SocketContextType = {
  socket: Socket | null;
  trades: ActiveTrade[];
  setTrades: React.Dispatch<React.SetStateAction<ActiveTrade[]>>;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [trades, setTrades] = useState<ActiveTrade[]>([]);

  useEffect(() => {
    const s = io(process.env.NEXT_PUBLIC_BACKEND_URL!);
    setSocket(s);

    s.emit("subscribeAiTrades");

    s.on("aiTradesUpdate", (data: ActiveTrade[]) => {
      setTrades(data);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, trades, setTrades }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used inside SocketProvider");
  }
  return context;
};
