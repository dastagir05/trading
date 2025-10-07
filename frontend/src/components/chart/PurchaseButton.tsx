import { useSession } from "next-auth/react";
import React from "react";
import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import axios from "axios";
import { io } from "socket.io-client";

type Status = "pending" | "inprocess";
type CapCategory = "large" | "mid" | "small" | "index" | undefined;
type Form = {
  userId: string | undefined;
  symbol: string;
  instrumentKey: string;
  quantity: number;
  entryPrice: number;
  side: "buy" | "sell";
  capCategory: CapCategory;
  entryTime: Date | undefined;
  status: Status;
  lotSize: number | undefined;
  stoploss: number | undefined;
  target: number | undefined;
  description: string | undefined;
  validity: string;
  validityTime: Date;
};
const todayAt320PM = new Date();
todayAt320PM.setHours(15, 20, 0, 0); // 15:20:00.000 (3:20 PM)

type Props = {
  Symbol: string;
  InstrumentKey: string;
  lotSize: number | undefined;
  Expiry: Date | undefined;
  FromSuggestion?: boolean;
};
type Side = "buy" | "sell";
const PurchaseButton = ({
  Symbol,
  InstrumentKey,
  lotSize,
  Expiry,
  FromSuggestion,
}: Props) => {
  const [showDialog, setShowDialog] = useState(false);
  const [SelectSide, setSelectSide] = useState<Side>("buy");
  const { data: session } = useSession();
  const [buy, setBuy] = useState(0);
  const [sell, setSell] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [marketStatus, setMarketStatus] = useState(true);
  const [form, setForm] = useState<Form>({
    userId: session?.user._id,
    symbol: Symbol,
    instrumentKey: InstrumentKey,
    quantity: 1,
    entryPrice: SelectSide === "buy" ? buy : sell,
    side: SelectSide,
    capCategory: undefined,
    entryTime: undefined,
    status: "inprocess", //inprocess before entry
    lotSize,
    stoploss: undefined,
    target: undefined,
    description: undefined,
    validityTime: todayAt320PM,
    validity: "",
  });
  const [invalidStoplossErr, setInvalidStoplossErr] = useState("");
  const [invalidTargetErr, setInvalidTargetErr] = useState("");
  //socket data for buy sell btn
  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`);
    socket.on("connect", () => {
      socket.on("marketStatus", (data) => {
        console.log("mark", data);
        setMarketStatus(data.statusCode);
      });

      socket.emit("getInstrumentKey", {
        instrumentKey: InstrumentKey,
      });
    });

    socket.on("getBuySellValue", ({ buyPrice, sellPrice }) => {
      setBuy(buyPrice);
      setSell(sellPrice);
      // if(buyPrice===0 || sellPrice ===0){
      //   setMarketStatus(false)
      // }
    });

    return () => {
      socket.disconnect();
    };
  }, [InstrumentKey]);
  //on side change keep dialog alive
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      side: SelectSide,
      // entryPrice: SelectSide === "buy" ? buy : sell,
    }));
  }, [SelectSide, buy, sell]);
  //clear form
  useEffect(() => {
    setForm({
      ...form,
      stoploss: undefined,
      target: undefined,
      entryTime: undefined,
      description: undefined,
      capCategory: undefined,
      lotSize: undefined,
      entryPrice: SelectSide === "buy" ? buy : sell,
      validityTime: todayAt320PM,
      symbol: Symbol,
      side: SelectSide,
      instrumentKey: InstrumentKey,
      quantity: 1,
      status: "inprocess",
    });
  }, [showDialog]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    console.log("bs", buy, sell);
    e.preventDefault();
    setIsLoading(true);
    setInvalidStoplossErr("");
    setInvalidTargetErr("");
    if (!session?.user._id) {
      setIsLoading(false);
      return;
    }

    // Build payload conditionally to exclude undefined stoploss/target
    const payload: Partial<Form> = {
      userId: session.user._id,
      symbol: form.symbol,
      instrumentKey: form.instrumentKey,
      quantity: form.quantity,
      entryPrice: form.entryPrice,
      side: SelectSide,
      status: form.status,
      validityTime: form.validityTime,
    };

    const isBuy = SelectSide === "buy";
    const entry = form.entryPrice ?? (isBuy ? buy : sell);
    // const entry = payload.entryPrice ? payload.enteredPrice : payload.enteredPrice;

    let isValid = true;
    if (form) {
      if (form.entryPrice === undefined) {
        payload.entryPrice = SelectSide === "buy" ? buy : sell;
      }
      if (form.stoploss !== undefined) {
        // ✅ Stoploss check
        const sl = form.stoploss;
        if ((isBuy && sl >= entry) || (!isBuy && sl <= entry)) {
          setInvalidStoplossErr(
            isBuy
              ? "Stoploss must be below entry price"
              : "Stoploss must be above entry price"
          );
          isValid = false;
        } else {
          payload.stoploss = sl;
        }
      }

      // ✅ Target check
      if (form.target !== undefined) {
        const tgt = form.target;
        if ((isBuy && tgt <= entry) || (!isBuy && tgt >= entry)) {
          setInvalidTargetErr(
            isBuy
              ? "Target must be above entry price"
              : "Target must be below entry price"
          );
          isValid = false;
        } else {
          payload.target = tgt;
        }
      }

      if (form.lotSize !== undefined && payload.quantity) {
        payload.quantity *= form.lotSize;
      }
      console.log("payloas", payload);

      //handle capCaptegory
    }
    if (!isValid) {
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/trade/createTrade`,
        payload
      );
      setShowDialog(false);
    } catch (error) {
      console.error("Error placing order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeDialog = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowDialog(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  return (
    <div className="relative">
      {/* The btn */}
      {FromSuggestion ? (
        <button
          onClick={() => {
            setShowDialog(true);
            setSelectSide("buy");
          }}
          className="mx-1 px-4 py-2 bg-gradient-to-r from-green-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-md transform hover:scale-105"
        >
          Execute {formatPrice(buy)}{" "}
        </button>
      ) : (
        <div className="space-x-2">
          <button
            onClick={() => {
              setShowDialog(true);
              setSelectSide("buy");
            }}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-md transform hover:scale-105"
          >
            Buy {formatPrice(buy)}{" "}
          </button>
          <button
            onClick={() => {
              setShowDialog(true);
              setSelectSide("sell");
            }}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-md transform hover:scale-105"
          >
            Sell {formatPrice(sell)}{" "}
          </button>
        </div>
      )}

      {showDialog && !marketStatus && (
        <>
          <div className="fixed inset-0 text-black bg-white/10 backdrop-blur-xs flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-xl w-[90%] max-w-xs">
              <div>Market is Close </div>
              <button
                type="button"
                onClick={() => setShowDialog(false)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
      {/* The Dialog */}
      {showDialog && marketStatus && (
        <div
          onClick={closeDialog}
          className="fixed inset-0 text-black bg-white/10 backdrop-blur-xs flex items-center justify-center z-50"
        >
          <div className="bg-white p-6 rounded shadow-xl w-[90%] max-w-md">
            <div className="flex flex-start space-x-6 text-lg mb-4">
              <h2 className="font-semibold ">{Symbol}</h2>
              <span className="text-gray-600">
                LTP: {formatPrice(sell)}
              </span>{" "}
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-4 mt-5">
              {/*  buy sell */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectSide("buy")}
                  className={`flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition duration-300 ${
                    SelectSide === "buy"
                      ? "ring-2 ring-offset-2 ring-white font-semibold"
                      : ""
                  }`}
                >
                  Buy
                  {SelectSide === "buy" ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    ""
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectSide("sell")}
                  className={`flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow transition duration-300 ${
                    SelectSide === "sell"
                      ? "ring-2 ring-offset-2 ring-white font-semibold"
                      : ""
                  }`}
                >
                  Sell
                  {SelectSide === "sell" ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    ""
                  )}
                </button>
              </div>

              {/* The Quantity & Entry Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium">Quantity</label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({ ...form, quantity: parseInt(e.target.value) })
                    }
                    className="border p-2 w-full rounded"
                    required
                  />
                  <div>{lotSize}</div>
                </div>

                <div>
                  <label className="block font-medium ">
                    Entry Price (Default) {form.entryPrice}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    // value={SelectSide === "buy" ? buy : sell}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        // enteredPrice: SelectSide === "buy" ? buy : sell,
                        status: "pending",
                        entryPrice: parseFloat(e.target.value),
                      })
                    }
                    className="border p-2 w-full rounded"
                  />
                </div>
              </div>

              {/* Validity Duration Selector */}
              <div className="mt-4">
                <label className="block font-medium">Trade Validity</label>
                <select
                  value={form.validity}
                  onChange={(e) => {
                    const selected = e.target.value;
                    const validityTime = new Date();

                    if (form.instrumentKey.startsWith("NSE_FO")) {
                      switch (selected) {
                        case "intraday":
                          validityTime.setHours(15, 30, 0, 0); // Set to today at 3:30 PM IST
                          break;
                        case "tomorrow":
                          validityTime.setDate(validityTime.getDate() + 1);
                          break;
                        case "1week":
                          validityTime.setDate(validityTime.getDate() + 7);
                          break;
                        case "1month":
                          Expiry?.toLocaleDateString();
                          break;
                      }
                    } else {
                      switch (selected) {
                        case "intraday":
                          validityTime.setHours(15, 30, 0, 0); // Set to today at 3:30 PM IST
                          break;
                        case "tomorrow":
                          validityTime.setDate(validityTime.getDate() + 1);
                          break;
                        case "1week":
                          validityTime.setDate(validityTime.getDate() + 7);
                          break;
                        case "1month":
                          validityTime.setMonth(validityTime.getMonth() + 1);
                          break;
                        default:
                          validityTime.setHours(15, 30, 0, 0);
                      }
                    }

                    setForm({ ...form, validity: selected, validityTime });
                  }}
                  className="border p-2 w-full rounded"
                >
                  <option value="">Select Validity</option>
                  <option value="intraday">Intraday (till today 3:30PM)</option>
                  <option value="tomorrow">Till Tomorrow</option>
                  <option value="1week">1 Week</option>
                  <option value="1month">1 Month</option>
                </select>
              </div>

              {/* Optional Stoploss/Target */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium">
                    Stoploss (Optional)
                  </label>
                  <input
                    type="number"
                    value={form.stoploss || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        stoploss: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    className="border p-2 w-full rounded"
                  />
                  <div className="text-xs text-red-500">
                    {invalidStoplossErr}
                  </div>
                </div>

                <div>
                  <label className="block font-medium">Target (Optional)</label>
                  <input
                    type="number"
                    value={form.target || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        target: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    className="border p-2 w-full rounded"
                  />
                  <span className="text-xs text-red-500">
                    {invalidTargetErr}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block font-medium mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Enter a short trade description..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                  maxLength={150} // limit to 150 chars
                />
              </div>

              {/* final decision */}
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowDialog(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`${
                    isLoading ? "bg-red-500" : "bg-green-600"
                  } text-white px-4 py-2 rounded `}
                >
                  Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseButton;
