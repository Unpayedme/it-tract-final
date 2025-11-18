"use client";
import React from "react";

const MetricCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
  <div className={`p-4 rounded-xl ${color} text-white shadow-md flex flex-col`}>
    <span className="text-sm opacity-80">{title}</span>
    <span className="text-2xl font-bold mt-1">{value}</span>
  </div>
);

export default MetricCard;
