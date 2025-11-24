"use client";
import React, { useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import MetricCard from "./MetricCard";
import { liveAnalytics } from "@/lib/analyticsTransfer";

interface BookingData { date: string; count: number; }
interface GuestRecord { guestName: string; date: string; }
interface Analytics { roomId: number; name: string; bookingsOverTime: BookingData[]; price: number; guestRecords: GuestRecord[]; }

interface Props { data: Analytics[] }

export const useDescriptiveTab = (initialData: Analytics[]) => {
  const [data, setData] = useState<Analytics[]>(initialData);

  useEffect(() => {
    setData(liveAnalytics.length ? liveAnalytics : initialData);
  }, [initialData]);

  const addBooking = (roomId: number, guestName: string) => {
    const today = new Date().toISOString().split("T")[0];
    setData(prev =>
      prev.map(room => {
        if (room.roomId !== roomId) return room;
        const updatedGuests = [...room.guestRecords, { guestName, date: today }];
        let updatedBookings = [...room.bookingsOverTime];
        const idx = updatedBookings.findIndex(b => b.date === today);
        if (idx === -1) updatedBookings.push({ date: today, count: 1 });
        else updatedBookings[idx] = { ...updatedBookings[idx], count: updatedBookings[idx].count + 1 };
        return { ...room, guestRecords: updatedGuests, bookingsOverTime: updatedBookings };
      })
    );
  };

  return { data, addBooking };
};

const DescriptiveTab: React.FC<Props> = ({ data: initialData }) => {
  const { data } = useDescriptiveTab(initialData);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
      {data.map(room => {
        const chartBookings = [...room.bookingsOverTime].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const totalBookings = room.guestRecords.length;
        const totalSales = totalBookings * room.price;
        const avgDailyBookings = totalBookings / (chartBookings.length || 1);

        return (
          <div key={room.roomId} className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg flex flex-col hover:scale-[1.01] transition-all duration-200">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">{room.name}</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <MetricCard title="Current Price" value={`₱${room.price.toLocaleString()}`} color="bg-indigo-600"/>
              <MetricCard title="Total Bookings" value={`${totalBookings}`} color="bg-sky-600"/>
              <MetricCard title="Total Sales" value={`₱${totalSales.toLocaleString()}`} color="bg-emerald-600"/>
              <MetricCard title={`Avg Daily Bookings`} value={avgDailyBookings.toFixed(1)} color="bg-gray-700"/>
            </div>

            <div className="w-full h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartBookings} margin={{ top: 5, right: 20, bottom: 40, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" label={{ value: "Date", position: "insideBottom", offset: -25, fill: "#9ca3af" }} />
                  <YAxis allowDecimals={false} stroke="#9ca3af" label={{ value: "Bookings", angle: -90, position: "insideLeft", fill: "#9ca3af" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #4b5563", color: "#fff" }} formatter={(value: number) => [`${value} bookings`, "Bookings"]} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} name="Daily Bookings"/>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Updated Table: One row per guest per date */}
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900 text-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Guest</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700 text-gray-300">
                  {room.guestRecords
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((g, idx) => (
                      <tr key={`${g.date}-${idx}`} className="hover:bg-gray-700 transition-colors">
                        <td className="px-4 py-2">{new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                        <td className="px-4 py-2">{g.guestName}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DescriptiveTab;
