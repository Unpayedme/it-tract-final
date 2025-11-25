import React from 'react';
import {
  Users, Activity, TrendingUp, ArrowUpRight, BrainCircuit, AlertTriangle, FileText, CheckCircle2, LineChart as LineIcon
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {
  Tooltip,
} from "@/components/ui/tooltip";
import StatCard from './StatCard';

const DashboardView = ({ stats, chartData, prescriptions, prescriptiveTable, serverError }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* 1. KEY METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Members" value={stats.totalMembers} subtext="Active Accounts" icon={Users} colorClass="bg-blue-500" />
        <StatCard title="Avg. Monthly Fee" value={`$${stats.avgFee}`} subtext="Per Member" icon={Activity} colorClass="bg-emerald-500" />
        <StatCard title="Avg. Attendance" value={stats.avgAttendance} subtext="Visits / Month" icon={TrendingUp} colorClass="bg-purple-500" />
        <StatCard title="Est. Revenue" value={`$${stats.totalRevenue}`} subtext="Current Month" icon={ArrowUpRight} colorClass="bg-indigo-500" />
      </div>

      {/* 2. DESCRIPTIVE ANALYTICS SECTION */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="text-slate-400" size={20} />
          <h2 className="text-xl font-bold text-slate-800">Descriptive Analytics</h2>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg mb-2 text-slate-800">Attendance per Member</h3>
            <p className="text-sm text-slate-500 mb-6">Individual member visitation frequency</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.memberAttendanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} interval={0} angle={-45} textAnchor="end" height={60} />
                  <YAxis stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                  <Bar dataKey="attendance" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Days" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg mb-2 text-slate-800">Trainer vs Member Count</h3>
            <p className="text-sm text-slate-500 mb-6">Client distribution across staff</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.trainerChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={50} name="Members" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Summary Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-lg text-slate-800">Statistical Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-4 font-bold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="p-4 font-bold text-slate-500 uppercase tracking-wider">Metric</th>
                  <th className="p-4 font-bold text-slate-500 uppercase tracking-wider">Formula / Desc</th>
                  <th className="p-4 font-bold text-slate-800 uppercase tracking-wider text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-4 font-medium text-slate-600">Members</td>
                  <td className="p-4 text-slate-600">Total Active Members</td>
                  <td className="p-4 text-slate-400 italic">COUNT(Members)</td>
                  <td className="p-4 text-right font-bold text-slate-800">{stats.totalMembers}</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-600">Attendance</td>
                  <td className="p-4 text-slate-600">Highest Attendance</td>
                  <td className="p-4 text-slate-400 italic">MAX(Attendance)</td>
                  <td className="p-4 text-right font-bold text-slate-800">{stats.highestAttendance}</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-600">Attendance</td>
                  <td className="p-4 text-slate-600">Lowest Attendance</td>
                  <td className="p-4 text-slate-400 italic">MIN(Attendance)</td>
                  <td className="p-4 text-right font-bold text-slate-800">{stats.lowestAttendance}</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-600">Attendance</td>
                  <td className="p-4 text-slate-600">Average Attendance</td>
                  <td className="p-4 text-slate-400 italic">AVERAGE(Attendance)</td>
                  <td className="p-4 text-right font-bold text-slate-800">{stats.avgAttendance}</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-600">Finances</td>
                  <td className="p-4 text-slate-600">Highest Monthly Fee</td>
                  <td className="p-4 text-slate-400 italic">MAX(Fee)</td>
                  <td className="p-4 text-right font-bold text-slate-800">${stats.highestFee}</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-600">Finances</td>
                  <td className="p-4 text-slate-600">Average Monthly Fee</td>
                  <td className="p-4 text-slate-400 italic">AVERAGE(Fee)</td>
                  <td className="p-4 text-right font-bold text-slate-800">${stats.avgFee}</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-600">Finances</td>
                  <td className="p-4 text-slate-600">Total Monthly Revenue</td>
                  <td className="p-4 text-slate-400 italic">SUM(Fee)</td>
                  <td className="p-4 text-right font-bold text-slate-800">${stats.totalRevenue}</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-600">Staff</td>
                  <td className="p-4 text-slate-600">Most Active Trainer</td>
                  <td className="p-4 text-slate-400 italic">MODE(Trainer)</td>
                  <td className="p-4 text-right font-bold text-slate-800">{stats.mostActiveTrainer}</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-600">Membership</td>
                  <td className="p-4 text-slate-600">Most Common Type</td>
                  <td className="p-4 text-slate-400 italic">MODE(Type)</td>
                  <td className="p-4 text-right font-bold text-slate-800">{stats.mostCommonType}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <hr className="border-slate-200 my-8" />

      {/* 3. PREDICTIVE ANALYTICS SECTION */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <LineIcon className="text-slate-400" size={20} />
          <h2 className="text-xl font-bold text-slate-800">Predictive Analytics</h2>
        </div>

        {/* Existing Revenue Forecasting */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Revenue Forecasting</h3>
                <p className="text-sm text-slate-500 mt-1">Comparison of Actual vs. Linear Regression & AI Smoothing.</p>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={val => `$${val}`} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="revenue" name="Actual" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="regression" name="Linear Reg." stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="smoothing" name="Exp. Smoothing" stroke="#10b981" strokeDasharray="3 3" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="movingAvg" name="Moving Avg" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg mb-2 text-slate-800">Membership Distribution</h3>
            <p className="text-sm text-slate-500 mb-6">Volume by tier</p>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.typeChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* NEW: ATTENDANCE PREDICTION (Matching Screenshot) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-lg text-slate-800">Attendance Prediction by Membership</h3>
            <p className="text-sm text-slate-500 mt-1">Growth forecast for next month based on current averages.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">

            {/* Table Side */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm border border-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3 border border-slate-200 font-bold text-slate-700">Membership Type</th>
                    <th className="p-3 border border-slate-200 font-bold text-slate-700">Average Attendance</th>
                    <th className="p-3 border border-slate-200 font-bold text-slate-700 bg-blue-50">Predicted Next Month</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.attendancePredictionData && stats.attendancePredictionData.map((row, i) => (
                    <tr key={i}>
                      <td className="p-3 border border-slate-200 font-medium">{row.type}</td>
                      <td className="p-3 border border-slate-200 text-center">{row.Average_Attendance}</td>
                      <td className="p-3 border border-slate-200 text-center bg-blue-50/30 font-bold text-blue-700">{row.Predicted_Next_Month_Attendance}</td>
                    </tr>
                  ))}
                  {(!stats.attendancePredictionData || stats.attendancePredictionData.length === 0) && (
                    <tr><td colSpan="3" className="p-4 text-center text-slate-400">No data available</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Chart Side */}
            <div className="h-64 border border-slate-100 rounded-lg p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.attendancePredictionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="type" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                  <Legend />
                  <Line type="monotone" dataKey="Average_Attendance" name="Avg. Attendance" stroke="#4f46e5" strokeWidth={3} />
                  <Line type="monotone" dataKey="Predicted_Next_Month_Attendance" name="Predicted Next Month" stroke="#ef4444" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      <hr className="border-slate-200 my-8" />

      {/* 4. PRESCRIPTIVE SECTION */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="flex items-center gap-3 mb-8 relative z-10">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <BrainCircuit className="text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-xl">AI Prescriptions (Prescriptive)</h3>
            <p className="text-slate-400 text-sm">Automated insights based on current metrics</p>
          </div>
        </div>
        {/* Strategic Action Plan Table */}
        <div className="relative z-10 bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md">
          <div className="p-4 border-b border-white/10 flex items-center gap-2">
            <CheckCircle2 className="text-emerald-400" size={18} />
            <h4 className="font-bold text-slate-100">Strategic Action Plan</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-white/5 text-slate-400 border-b border-white/10">
                  <th className="p-4 font-bold uppercase text-xs tracking-wider">Issue / Goal</th>
                  <th className="p-4 font-bold uppercase text-xs tracking-wider">Recommendation</th>
                  <th className="p-4 font-bold uppercase text-xs tracking-wider text-right">Expected Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {prescriptiveTable && prescriptiveTable.map((row, index) => (
                  <tr key={index} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium text-amber-200/90">{row.issue}</td>
                    <td className="p-4">{row.recommendation}</td>
                    <td className="p-4 text-right font-medium text-emerald-300">{row.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          &nbsp;&nbsp;&nbsp;&nbsp;
        </div>

        {/* Dynamic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 mb-8">
          {prescriptions.map((item, idx) => (
            <div key={idx} className={`p-5 rounded-xl border backdrop-blur-sm transition-transform hover:-translate-y-1 ${item.type === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                item.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' :
                  'bg-amber-500/10 border-amber-500/30'
              }`}>
              <h4 className={`font-bold mb-3 flex items-center gap-2 ${item.type === 'critical' ? 'text-red-400' :
                  item.type === 'success' ? 'text-emerald-400' :
                    'text-amber-400'
                }`}>
                {item.type === 'critical' ? <AlertTriangle size={16} /> : <TrendingUp size={16} />}
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