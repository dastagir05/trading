"use client";
import React, { useEffect, useRef } from "react";
import { createChart, LineSeries } from "lightweight-charts";

const LightweightChart = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: 600,
      height: 300,
    });

    const lineSeries = chart.addSeries(LineSeries);
    lineSeries.setData([
      { time: "2019-04-11", value: 80.01 },
      { time: "2019-04-12", value: 96.63 },
      { time: "2019-04-13", value: 76.64 },
      { time: "2019-04-14", value: 81.89 },
      { time: "2019-04-15", value: 74.43 },
      { time: "2019-04-16", value: 80.01 },
      { time: "2019-04-17", value: 96.63 },
      { time: "2019-04-18", value: 76.64 },
      { time: "2019-04-19", value: 81.89 },
      { time: "2019-04-20", value: 74.43 },
    ]);

    return () => chart.remove();
  }, []);

  return <div ref={chartContainerRef} />;
};

export default LightweightChart;
