import React from 'react';
import { 
  Users, Activity, TrendingUp, ArrowUpRight, BrainCircuit, AlertTriangle 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid , Legend, 
  ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import {
  Tooltip,
} from "@/components/ui/tooltip"; // Assuming this is where the provided UI component lives
import StatCard from './StatCard';

const DashboardView = ({ stats, chartData, prescriptions, serverError }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Members" value={stats.totalMembers} subtext="Active Accounts" icon={Users} colorClass="bg-blue-500" />
        <StatCard title="Avg. Monthly Fee" value={`$${stats.avgFee}`} subtext="Per Member" icon={Activity} colorClass="bg-emerald-500" />
        <StatCard title="Avg. Attendance" value={stats.avgAttendance} subtext="Visits / Month" icon={TrendingUp} colorClass="bg-purple-500" />
        <StatCard title="Est. Revenue" value={`$${stats.totalRevenue}`} subtext="Current Month" icon={ArrowUpRight} colorClass="bg-indigo-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Predictive Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-lg text-slate-800">Revenue Forecasting</h3>
              <p className="text-sm text-slate-500 mt-1">
                  Comparison of Actual vs. Linear Regression & AI Smoothing.
              </p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={val => `$${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="revenue" name="Actual" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="regression" name="Linear Reg." stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="smoothing" name="Exp. Smoothing" stroke="#10b981" strokeDasharray="3 3" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="movingAvg" name="Moving Avg" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Descriptive Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-lg mb-2 text-slate-800">Distribution</h3>
          <p className="text-sm text-slate-500 mb-6">Membership tiers by volume</p>
          <div className="h-60">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.typeChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Prescriptive Panel */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl overflow-hidden relative">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="flex items-center gap-3 mb-8 relative z-10">
           <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <BrainCircuit className="text-emerald-400" />
           </div>
           <div>
             <h3 className="font-bold text-xl">AI Prescriptions</h3>
             <p className="text-slate-400 text-sm">Automated insights based on current metrics</p>
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {prescriptions.map((item, idx) => (
             <div key={idx} className={`p-5 rounded-xl border backdrop-blur-sm transition-transform hover:-translate-y-1 ${
               item.type === 'critical' ? 'bg-red-500/10 border-red-500/30' : 
               item.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' : 
               'bg-amber-500/10 border-amber-500/30'
             }`}>
               <h4 className={`font-bold mb-3 flex items-center gap-2 ${
                 item.type === 'critical' ? 'text-red-400' : 
                 item.type === 'success' ? 'text-emerald-400' : 
                 'text-amber-400'
               }`}>
                 {item.type === 'critical' ? <AlertTriangle size={16}/> : <TrendingUp size={16}/>}
                 {item.title}
               </h4>
               <p className="text-sm text-slate-300 leading-relaxed opacity-90">{item.desc}</p>
             </div>
          ))}
          {prescriptions.length === 0 && (
            <div className="col-span-3 text-center py-8 text-slate-500 italic border border-dashed border-slate-700 rounded-xl">
              {serverError ? "Fix database connection to see insights." : "Add members to generate AI insights."}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default DashboardView;