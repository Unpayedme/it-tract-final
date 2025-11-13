"use client";
import React, { useState } from "react";
import {
  ScatterChart,
  Scatter,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import MetricCard from "./MetricCard";

interface BookingData {
  date: string;
  count: number;
}
interface GuestRecord {
  guestName: string;
  date: string;
}

interface Analytics {
  roomId: number;
  name: string;
  bookingsOverTime: BookingData[];
  price: number;
  guestRecords: GuestRecord[];
}

interface Props {
  data: Analytics[];
}

// ---------- Regression Functions ----------
const linearRegression = (values: number[]) => {
  const n = values.length;
  if (n < 2) return values.map((v) => v);
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;
  let num = 0,
    den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (values[i] - yMean);
    den += (i - xMean) ** 2;
  }
  const slope = num / den;
  const intercept = yMean - slope * xMean;
  return values.map((_, i) => slope * i + intercept);
};

const quadraticRegression = (values: number[]) => {
  const n = values.length;
  if (n < 3) return linearRegression(values);
  const x = values.map((_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumX2 = x.reduce((a, b) => a + b * b, 0);
  const sumX3 = x.reduce((a, b) => a + b * b * b, 0);
  const sumX4 = x.reduce((a, b) => a + b * b * b * b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
  const sumX2Y = x.reduce((sum, xi, i) => sum + xi * xi * values[i], 0);

  const A = [
    [n, sumX, sumX2],
    [sumX, sumX2, sumX3],
    [sumX2, sumX3, sumX4],
  ];
  const B = [sumY, sumXY, sumX2Y];

  const solve = (A: number[][], B: number[]) => {
    const m = A.map((row, i) => [...row, B[i]]);
    const size = A.length;
    for (let i = 0; i < size; i++) {
      let maxRow = i;
      for (let k = i + 1; k < size; k++)
        if (Math.abs(m[k][i]) > Math.abs(m[maxRow][i])) maxRow = k;
      [m[i], m[maxRow]] = [m[maxRow], m[i]];
      for (let k = i + 1; k < size; k++) {
        const f = m[k][i] / m[i][i];
        for (let j = i; j <= size; j++) m[k][j] -= f * m[i][j];
      }
    }
    const x = new Array(size).fill(0);
    for (let i = size - 1; i >= 0; i--) {
      x[i] = m[i][size];
      for (let j = i + 1; j < size; j++) x[i] -= m[i][j] * x[j];
      x[i] /= m[i][i];
    }
    return x;
  };

  try {
    const [a, b, c] = solve(A, B);
    return x.map((xi) => a + b * xi + c * xi * xi);
  } catch {
    return linearRegression(values);
  }
};

const cubicRegression = (values: number[]) => {
  const n = values.length;
  if (n < 4) return quadraticRegression(values);
  const x = values.map((_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumX2 = x.reduce((a, b) => a + b * b, 0);
  const sumX3 = x.reduce((a, b) => a + b * b * b, 0);
  const sumX4 = x.reduce((a, b) => a + b * b * b * b, 0);
  const sumX5 = x.reduce((a, b) => a + b * b * b * b * b, 0);
  const sumX6 = x.reduce((a, b) => a + b * b * b * b * b * b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
  const sumX2Y = x.reduce((sum, xi, i) => sum + xi * xi * values[i], 0);
  const sumX3Y = x.reduce((sum, xi, i) => sum + xi * xi * xi * values[i], 0);

  const A = [
    [n, sumX, sumX2, sumX3],
    [sumX, sumX2, sumX3, sumX4],
    [sumX2, sumX3, sumX4, sumX5],
    [sumX3, sumX4, sumX5, sumX6],
  ];
  const B = [sumY, sumXY, sumX2Y, sumX3Y];

  const solve = (A: number[][], B: number[]) => {
    const m = A.map((row, i) => [...row, B[i]]);
    const size = A.length;
    for (let i = 0; i < size; i++) {
      let maxRow = i;
      for (let k = i + 1; k < size; k++)
        if (Math.abs(m[k][i]) > Math.abs(m[maxRow][i])) maxRow = k;
      [m[i], m[maxRow]] = [m[maxRow], m[i]];
      for (let k = i + 1; k < size; k++) {
        const f = m[k][i] / m[i][i];
        for (let j = i; j <= size; j++) m[k][j] -= f * m[i][j];
      }
    }
    const x = new Array(size).fill(0);
    for (let i = size - 1; i >= 0; i--) {
      x[i] = m[i][size];
      for (let j = i + 1; j < size; j++) x[i] -= m[i][j] * x[j];
      x[i] /= m[i][i];
    }
    return x;
  };

  try {
    const [a, b, c, d] = solve(A, B);
    return x.map((xi) => a + b * xi + c * xi * xi + d * xi * xi * xi);
  } catch {
    return quadraticRegression(values);
  }
};

const calculateR2 = (actual: number[], predicted: number[]) => {
  const n = actual.length;
  if (n < 2) return 1;
  const mean = actual.reduce((a, b) => a + b, 0) / n;
  const ssRes = actual.reduce((s, v, i) => s + (v - predicted[i]) ** 2, 0);
  const ssTot = actual.reduce((s, v) => s + (v - mean) ** 2, 0);
  return 1 - ssRes / ssTot;
};

// ---------- Component ----------
const PrescriptiveTab: React.FC<Props> = ({ data }) => {
  const [trendlineType, setTrendlineType] = useState<
    "linear" | "quadratic" | "cubic"
  >("linear");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
      {data.map((room) => {
        if (!room || !room.bookingsOverTime || room.bookingsOverTime.length === 0)
          return null;

        const price = room.price || 0;
        const dailyCounts = room.bookingsOverTime.map((b) => b.count || 0);
        const totalBookings = room.guestRecords?.length || 0;
        const avgBookings = totalBookings / (dailyCounts.length || 1);

        let recommendation = "",
          optimalPrice = price;
        if (avgBookings < 3) {
          recommendation = "Low demand. Consider reducing price.";
          optimalPrice *= 0.9;
        } else if (avgBookings < 5) {
          recommendation = "Stable demand. Maintain current pricing.";
        } else {
          recommendation = "High demand. Consider increasing price.";
          optimalPrice *= 1.1;
        }

        const scatterData = dailyCounts.map((y, i) => ({
          x: i,
          y,
          date: room.bookingsOverTime[i].date,
        }));

        let trendline: number[] = [];
        if (trendlineType === "linear") trendline = linearRegression(dailyCounts);
        else if (trendlineType === "quadratic")
          trendline = quadraticRegression(dailyCounts);
        else trendline = cubicRegression(dailyCounts);

        const nextIndex = dailyCounts.length;
        const nextDate = new Date(room.bookingsOverTime[nextIndex - 1].date);
        nextDate.setDate(nextDate.getDate() + 1);
        let nextTrend = 0;
        if (trendlineType === "linear")
          nextTrend = linearRegression([...dailyCounts, 0]).slice(-1)[0];
        else if (trendlineType === "quadratic")
          nextTrend = quadraticRegression([...dailyCounts, 0]).slice(-1)[0];
        else nextTrend = cubicRegression([...dailyCounts, 0]).slice(-1)[0];
        const trendlineData = trendline
          .map((y, i) => ({ x: i, y }))
          .concat({ x: nextIndex, y: nextTrend });

        const r2 = calculateR2(dailyCounts, trendline);

        const demandColor =
          avgBookings < 3
            ? "text-red-400"
            : avgBookings < 5
            ? "text-yellow-400"
            : "text-cyan-400";

        const boxColor =
          avgBookings < 3
            ? "bg-red-900/40 border-red-600"
            : avgBookings < 5
            ? "bg-yellow-900/30 border-yellow-600"
            : "bg-cyan-900/30 border-cyan-600";

        return (
          <div
            key={room.roomId}
            className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-lg flex flex-col justify-between hover:scale-[1.01] transition-all duration-300"
          >
            <h2 className="text-2xl font-bold mb-4 text-blue-400">
              {room.name}
            </h2>

            <div className="grid grid-cols-1 gap-3">
              <MetricCard
                title="Current Price"
                value={`₱${price.toLocaleString()}`}
                color="bg-indigo-600"
              />
              <MetricCard
                title="Suggested Optimal Price"
                value={`₱${optimalPrice.toLocaleString()}`}
                color="bg-sky-600"
              />
            </div>

            <div
              className={`mt-6 p-5 rounded-xl border transition-all duration-300 ${boxColor}`}
            >
              <h3 className={`text-lg font-semibold ${demandColor}`}>
                Recommendation 💡
              </h3>
              <p
                className={`text-sm leading-relaxed font-medium ${demandColor}`}
              >
                {recommendation}
              </p>
            </div>

            <div className="mt-6 bg-gray-900/50 p-4 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold text-blue-300 mb-3">
                Demand Pattern Analysis
              </h3>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm text-gray-300">Trendline:</label>
                <select
                  value={trendlineType}
                  onChange={(e) =>
                    setTrendlineType(
                      e.target.value as "linear" | "quadratic" | "cubic"
                    )
                  }
                  className="bg-gray-700 text-white text-sm rounded px-2 py-1"
                >
                  <option value="linear">Linear</option>
                  <option value="quadratic">Quadratic</option>
                  <option value="cubic">Cubic</option>
                </select>
                <span className="text-sm text-gray-400 font-mono ml-2">
                  R² = {r2.toFixed(3)}
                </span>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart
                  margin={{ top: 10, right: 20, bottom: 60, left: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    stroke="#9ca3af"
                    label={{
                      value: "Date",
                      position: "insideBottom",
                      offset: -45,
                      fill: "#9ca3af",
                    }}
                    tickFormatter={(i) =>
                      scatterData[i]?.date
                        ? new Date(scatterData[i].date).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )
                        : `Day ${i + 1}`
                    }
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    stroke="#9ca3af"
                    label={{
                      value: "Number of Bookings",
                      angle: -90,
                      position: "insideLeft",
                      fill: "#9ca3af",
                    }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-gray-800 border border-gray-600 text-white p-3 rounded shadow-lg">
                            <div className="font-semibold text-blue-300 mb-1">
                              Booking Details
                            </div>
                            <div className="text-sm">
                              Date:{" "}
                              {d.date
                                ? new Date(d.date).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : `Forecast Day ${d.x + 1}`}
                            </div>
                            <div className="text-sm">
                              Bookings:{" "}
                              <span className="font-bold text-blue-400">
                                {d.y}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend verticalAlign="top" />
                  <Scatter
                    name="Daily Bookings"
                    data={scatterData}
                    fill="#3b82f6"
                  />
                  <Line
                    type="linear"
                    dataKey="y"
                    data={trendlineData}
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={false}
                    strokeDasharray="5 5"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PrescriptiveTab;
