import { useEffect, useState } from "react";
import { Trade } from "../../types/trade";
import axios from "axios";

type TradeCardProps = {
  trade: Trade;
  openDialog: boolean;
  closeDialog: () => void;
};

const TradeCard = ({ trade, openDialog, closeDialog }: TradeCardProps) => {
  const [openModifyTSDialog, setOpenModifyTsDialog] = useState(false);
  const [target, setTarget] = useState<number>(trade.target ?? 0);
  const [stoploss, setStoploss] = useState<number>(trade.stoploss ?? 0);

  useEffect(() => {
    if (openDialog) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [openDialog]);

  const deleteTrades = async (tradeId: string) => {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/trade/closeTrade`,
      {
        userId: trade.userId,
        tradeId: tradeId,
      }
    );
    console.log(res);
  };
  const handleModifyTS = async () => {
    const shouldUpdateTarget = target && target !== trade.target;
    const shouldUpdateStoploss = stoploss && stoploss !== trade.stoploss;

    if (shouldUpdateTarget || shouldUpdateStoploss) {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/trade/modifyTargetStoploss`,
        {
          userId: trade.userId,
          tradeId: trade._id,
          target,
          stoploss,
        }
      );
      console.log("Updated:", res.data);
    }

    setOpenModifyTsDialog(false);
    closeDialog();
  };

  if (!openDialog) return null;

  console.log("trad in mytrade", trade);
  return (
    <div className="fixed inset-0 text-black flex items-center justify-center z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-white/10 backdrop-blur-sm"
        onClick={closeDialog}
      ></div>

      {/* Dialog Content */}
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-200">
        {/* Close button (top-right) */}
        <button
          onClick={closeDialog}
          className="absolute top-1 right-2 p-1 rounded-full hover:bg-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Trade Header */}
        <div className="flex justify-between items-start mb-4 mt-2">
          <div>
            <h3 className="text-lg font-semibold">{trade.symbol}</h3>
            <span
              className={`inline-block px-2 py-1 text-xs rounded mt-1 ${
                trade.side === "buy"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {trade?.side ? trade.side.toUpperCase() : "-"}
            </span>
          </div>
          <div className="text-right">
            <p className="text-gray-900 font-medium mb-2">
              ₹{trade.entryPrice}
            </p>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                trade.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : trade.status === "inprocess"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {trade.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Trade Details */}
        <div className="space-y-3 text-sm border-t pt-4">
          {[
            ["Instrument", trade.instrumentKey],
            ["Quantity", trade.quantity],
            ["Margin Used", trade.marginUsed],
            ["Cap Category", trade.capCategory ?? "-"],
            [
              "Validity Time",
              trade.validityTime
                ? new Date(trade.validityTime).toLocaleString()
                : "-",
            ],
            ["Target", `₹${trade.target ?? "-"}`],
            ["Stoploss", `₹${trade.stoploss ?? "-"}`],
            ["Created", new Date(trade.createdAt).toLocaleString()],
            ["Last Updated", new Date(trade.updatedAt).toLocaleString()],
          ].map(([label, value], idx) => (
            <div className="flex justify-between" key={idx}>
              <span className="text-gray-500">{label}:</span>
              <span>{value}</span>
            </div>
          ))}
          {trade.status !== "pending" && trade.status !== "inprocess" && (
            <>
              {[
                ["Exit Price", trade.exitPrice ? `₹${trade.exitPrice}` : "-"],
                [
                  "Exit Time",
                  trade.exitTime
                    ? new Date(trade.exitTime).toLocaleString()
                    : "-",
                ],
                [
                  "Entry Time",
                  trade.entryTime
                    ? new Date(trade.entryTime).toLocaleString()
                    : "-",
                ],
                [
                  "Total Charges",
                  trade.charges ? `₹${trade.charges.total}` : "-",
                ],

                ["PnL", trade.pnl ? `₹${trade.pnl}` : "-"],
                ["Net PnL", trade.netpnl ? `₹${trade.netpnl}` : "-"],
                [
                  "Percent PnL",
                  trade.percentPnL !== undefined && trade.percentPnL !== null
                    ? `${trade.percentPnL.toFixed(2)}%`
                    : "-",
                ],
              ].map(([label, value], idx) => (
                <div className="flex justify-between" key={idx}>
                  <span className="text-gray-500">{label}:</span>
                  <span>{value}</span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Action Buttons */}
        {trade.status === "inprocess" && (
          <div className="mt-6 flex justify-end space-x-3">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              onClick={() => setOpenModifyTsDialog(true)}
            >
              Modify Target & Stoploss
            </button>
            <button
              onClick={() => deleteTrades(trade._id)}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            >
              Close Trade
            </button>
          </div>
        )}
      </div>

      {/* modify traget or stoploss */}
      {openModifyTSDialog && (
        <>
          <div className="fixed inset-0 bg-white/10 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Price
                  </label>
                  <input
                    type="number"
                    placeholder="Enter new target"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={target}
                    onChange={(e) => setTarget(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stoploss Price
                  </label>
                  <input
                    type="number"
                    placeholder="Enter new stoploss"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={stoploss}
                    onChange={(e) => setStoploss(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                  onClick={() => setOpenModifyTsDialog(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                  onClick={handleModifyTS}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TradeCard;
