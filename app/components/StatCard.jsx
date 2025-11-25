import React from 'react';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
      <div className={`p-2 rounded-full ${colorClass} bg-opacity-10`}>
        <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
    </div>
    <div className="flex flex-col">
      <span className="text-2xl font-bold text-slate-800">{value}</span>
      <span className="text-xs text-slate-400 mt-1">{subtext}</span>
    </div>
  </div>
);

export default StatCard;