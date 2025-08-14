"use client";
// import LightweightChart from "@/components/LightweightChart";
import { OMChart } from "../../../components/chart/OMChart";

export default function ChartPage() {
  return (
    <main style={{ padding: "2rem" }} className="bg-white">
      <h1 style={{ color: "black" }}>Open Market Candlestick Chart</h1>
      <OMChart />
      {/* <h1 style={{ color: "black", marginBottom: "1rem" }}>
        Line Series chart ig
      </h1> */}
      {/* <LightweightChart /> */}

      {/* <h1 style={{ color: "black", marginTop: "2rem" }}>Price Scale Chart</h1>
      <h3>
        THis is very dummy data it has no relation with our input data auth
        scale dection
      </h3> */}
      {/* <PriceScaleChart /> */}
      {/* <Embaded /> */}
    </main>
  );
}
