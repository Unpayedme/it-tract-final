"use client";
import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface BookingData { date: string; count: number; }
interface Analytics { roomId: number; name: string; bookingsOverTime: BookingData[]; price: number; }

interface Props { data: Analytics[] }

const movingAverage = (values: number[], window = 3): (number | null)[] =>
  values.map((_, i) => (i < window - 1 ? null : values.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0) / window));

const exponentialSmoothing = (values: number[], alpha = 0.3): (number | null)[] => {
  if (values.length === 0) return [];
  const smooth: (number | null)[] = [null]; // first day N/A
  smooth.push(values[0]); // second day = first actual
  for (let i = 1; i < values.length; i++) {
    smooth.push(alpha * values[i] + (1 - alpha) * (smooth[i] as number));
  }
  return smooth;
};

const linearRegression = (values: number[]): number[] => {
  const n = values.length;
  if (n < 2) return [...values];
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;
  let numerator = 0, denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (values[i] - yMean);
    denominator += (i - xMean) ** 2;
  }
  const slope = numerator / denominator;
  const intercept = yMean - slope * xMean;
  return values.map((_, i) => slope * i + intercept);
};

const PredictiveTab: React.FC<Props> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {data.map((room) => {
        const counts = room.bookingsOverTime.map(b => b.count);
        const ma = movingAverage(counts, 3);
        const es = exponentialSmoothing(counts, 0.3);
        const lr = linearRegression(counts);

        // Compute next-day forecast
        const lastDate = new Date(room.bookingsOverTime[room.bookingsOverTime.length - 1].date);
        const nextDate = new Date(lastDate);
        nextDate.setDate(nextDate.getDate() + 1);
        const nextDateStr = nextDate.toISOString().split("T")[0];

        const nextMA = counts.slice(-3).length === 3 ? counts.slice(-3).reduce((a, b) => a + b, 0) / 3 : null;
        const nextES = es[es.length - 1] !== null ? 0.3 * counts[counts.length - 1] + 0.7 * (es[es.length - 1] as number) : null;
        const n = counts.length;
        const xMean = (n - 1) / 2;
        const yMean = counts.reduce((a, b) => a + b, 0) / n;
        let numerator = 0, denominator = 0;
        for (let i = 0; i < n; i++) {
          numerator += (i - xMean) * (counts[i] - yMean);
          denominator += (i - xMean) ** 2;
        }
        const slope = numerator / denominator;
        const intercept = yMean - slope * xMean;
        const nextLR = slope * n + intercept;

        // Build chart data with additional next-day prediction
        const chartData = [
          ...room.bookingsOverTime.map((b, i) => ({
            date: b.date,
            actual: counts[i],
            movingAverage: ma[i] ?? null,
            expSmooth: es[i] ?? null,
            regression: lr[i] ?? null,
          })),
          {
            date: nextDateStr,
            actual: null,
            movingAverage: nextMA ?? null,
            expSmooth: nextES ?? null,
            regression: nextLR ?? null,
          },
        ];

        return (
          <div key={room.roomId} className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">{room.name} Forecast 📈</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #4b5563", color: "#fff" }} />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
                <Line type="monotone" dataKey="actual" stroke="#3b82f6" name="Actual Bookings" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="movingAverage" stroke="#10b981" strokeDasharray="5 5" name="Moving Average" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="expSmooth" stroke="#f59e0b" strokeDasharray="3 3" name="Exponential Smoothing" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="regression" stroke="#ef4444" name="Linear Regression" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
};

export default PredictiveTab;
