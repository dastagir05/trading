import { useEffect } from "react";
import { AiTrade } from "./AiTradeList";

type AiTradeCardProps = {
  trade: AiTrade;
  openDialog: boolean;
  closeDialog: () => void;
};

const AiTradeCard = ({ trade, openDialog, closeDialog }: AiTradeCardProps) => {
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

  if (!openDialog) return null;

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
            <h3 className="text-lg font-semibold">{trade.setup.symbol}</h3>
            <span
              className={`inline-block px-2 py-1 text-xs rounded mt-1 ${
                trade.sentiment === "bullish"
                  ? "bg-green-100 text-green-800"
                  : trade.sentiment === "bearish"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {trade.sentiment.toUpperCase()}
            </span>
          </div>
          <div className="text-right">
            <p className="text-gray-900 font-medium mb-2">
              ₹{trade.setup.currentPrice}
            </p>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                trade.status === "suggested"
                  ? "bg-yellow-100 text-yellow-800"
                  : trade.status === "active"
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
            ["Instrument", trade.setup.instrumentKey],
            ["Strategy", trade.setup.strategy],
            ["Strike", trade.setup.strike],
            ["Expiry", trade.setup.expiry],
            ["Entry", trade.tradePlan.entry],
            ["Target", trade.tradePlan.target],
            ["StopLoss", trade.tradePlan.stopLoss],
            ["TimeFrame", trade.tradePlan.timeFrame],
            ["Confidence", trade.confidence ? `${trade.confidence}%` : "-"],
            ["Risk Level", trade.riskLevel ?? "-"],
            [
              "Suggested At",
              trade.suggestedAt
                ? new Date(trade.suggestedAt).toLocaleString()
                : "-",
            ],
            [
              "Expiry Date",
              trade.setup.expiry
                ? new Date(trade.setup.expiry).toLocaleString()
                : "-",
            ],
          ].map(([label, value], idx) => (
            <div className="flex justify-between" key={idx}>
              <span className="text-gray-500">{label}:</span>
              <span>{value}</span>
            </div>
          ))}

          {trade.status !== "suggested" && (
            <>
              {[
                ["Entry Price", trade.entryPrice ?? "-"],
                [
                  "Entry Time",
                  trade.entryTime
                    ? new Date(trade.entryTime).toLocaleString()
                    : "-",
                ],
                ["Exit Price", trade.exitPrice ?? "-"],
                [
                  "Exit Time",
                  trade.exitTime
                    ? new Date(trade.exitTime).toLocaleString()
                    : "-",
                ],
                ["PnL", trade.pnl ? `₹${trade.pnl}` : "-"],
                ["Net PnL", trade.pnl ? `₹${trade.pnl}` : "-"],
                [
                  "Percent PnL",
                  trade.percentPnL !== undefined && trade.percentPnL !== null
                    ? `${trade.percentPnL.toFixed(2)}%`
                    : "-",
                ],
                // ["Charges", trade.exitPrice ? `₹${trade.pnl}` : "-"],
              ].map(([label, value], idx) => (
                <div className="flex justify-between" key={idx}>
                  <span className="text-gray-500">{label}:</span>
                  <span>{value}</span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Notes */}
        {/* {trade.notes && trade.notes.length > 0 && (
          <div className="mt-4 border-t pt-3 space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Notes:</h4>
            {trade.notes.map((note, idx) => (
              <div
                key={idx}
                className={`text-xs px-2 py-1 rounded ${
                  note.type === "warning"
                    ? "bg-yellow-100 text-yellow-800"
                    : note.type === "error"
                    ? "bg-red-100 text-red-800"
                    : note.type === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {new Date(note.timestamp).toLocaleString()} – {note.message}
              </div>
            ))}
          </div>
        )} */}
      </div>
    </div>
  );
};

export default AiTradeCard;
