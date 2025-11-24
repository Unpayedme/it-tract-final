'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, Activity, TrendingUp, AlertTriangle, Plus, Search, Trash2, 
  Edit, Save, X, Filter, ArrowUpRight, BrainCircuit, BarChart3, Database 
} from 'lucide-react';

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid , Legend, 
  ResponsiveContainer, BarChart, Bar 
} from 'recharts';

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

// --- HISTORICAL DATA (Static for Analytics Demo) ---
const HISTORICAL_REVENUE = [
  { period: 1, revenue: 1500 }, { period: 2, revenue: 1550 }, { period: 3, revenue: 1620 }, { period: 4, revenue: 1580 },
  { period: 5, revenue: 1700 }, { period: 6, revenue: 1750 }, { period: 7, revenue: 1800 }, { period: 8, revenue: 1780 },
  { period: 9, revenue: 1850 }, { period: 10, revenue: 1900 }, { period: 11, revenue: 1950 }, { period: 12, revenue: 2100 },
  { period: 13, revenue: 2050 }, { period: 14, revenue: 2150 }, { period: 15, revenue: 2200 }, { period: 16, revenue: 2300 },
  { period: 17, revenue: 2250 }, { period: 18, revenue: 2400 }, { period: 19, revenue: 2450 }, { period: 20, revenue: 2500 },
];

// --- ANALYTICS UTILITIES ---
const calculateLinearRegression = (data) => {
  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  
  data.forEach(d => {
    sumX += d.period;
    sumY += d.revenue;
    sumXY += (d.period * d.revenue);
    sumXX += (d.period * d.period);
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return data.map(d => ({
    ...d,
    regression: Math.round(intercept + slope * d.period)
  }));
};

const calculateExponentialSmoothing = (data, alpha = 0.5) => {
  let forecast = data[0].revenue || 0; 
  return data.map((d, index) => {
    if (index === 0) return { ...d, smoothing: d.revenue };
    const prevRevenue = data[index - 1].revenue ?? forecast;
    forecast = alpha * prevRevenue + (1 - alpha) * forecast;
    return { ...d, smoothing: Math.round(forecast) };
  });
};

const calculateMovingAverage = (data, window = 3) => {
  return data.map((d, index) => {
    if (index < window - 1) return { ...d, movingAvg: null };
    let sum = 0;
    for (let i = 0; i < window; i++) {
      const val = data[index - i].revenue;
      if (val !== undefined) sum += val;
    }
    return { ...d, movingAvg: Math.round(sum / window) };
  });
};

const generatePredictiveData = (baseData) => {
  let processed = calculateLinearRegression(baseData);
  processed = calculateExponentialSmoothing(processed, 0.5);
  processed = calculateMovingAverage(processed, 3);
  
  const lastPeriod = baseData[baseData.length - 1].period;
  const lastReg = processed[processed.length - 1].regression ?? 0;
  const firstReg = processed[0].regression ?? 0;
  const slope = (lastReg - firstReg) / (processed.length - 1);
  const intercept = firstReg;

  for(let i=1; i<=3; i++) {
    const nextP = lastPeriod + i;
    const linReg = Math.round(intercept + slope * nextP);
    processed.push({
      period: nextP,
      revenue: 0, 
      regression: linReg,
      smoothing: undefined,
      movingAvg: null,
      isForecast: true
    });
  }
  return processed;
};

// --- COMPONENTS ---
const Card = ({ title, value, subtext, icon: Icon, colorClass }) => (
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

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [members, setMembers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [editingMember, setEditingMember] = useState(null);
  const [serverError, setServerError] = useState(null);

  const [formData, setFormData] = useState({
    member_name: '',
    membership_type: 'Silver',
    attendance_days: 0,
    trainer_assigned: 'None',
    monthly_fee: 60
  });

  // --- API INTEGRATION ---
  
  // 1. Fetch Members (GET)
  const fetchMembers = async () => {
    setLoading(true);
    setServerError(null);
    try {
      const res = await fetch('/api/members');
      if (!res.ok) throw new Error('Failed to connect to API');
      const data = await res.json();
      setMembers(data);
    } catch (error) {
      console.error("API Error:", error);
      setServerError("Could not connect to Neon DB.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // 2. Add/Edit Member (POST/PUT)
  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      attendance_days: Number(formData.attendance_days) || 0,
      monthly_fee: Number(formData.monthly_fee) || 0,
    };

    try {
      if (editingMember) {
        // UPDATE EXISTING
        const res = await fetch(`/api/members/${editingMember.member_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!res.ok) throw new Error('Update failed');
        const updated = await res.json();
        
        setMembers(prev => prev.map(m => m.member_id === editingMember.member_id ? updated : m));
      } else {
        // CREATE NEW
        const res = await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Create failed');
        const newItem = await res.json();
        
        setMembers(prev => [...prev, newItem]);
      }
      setShowModal(false);
      setEditingMember(null);
      resetForm();
    } catch (error) {
      console.error("Operation Error:", error);
      alert("Failed to save data. Check database connection.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Delete Member (DELETE)
const handleDelete = async (id) => {
  console.log('Deleting member ID:', id); // should print a number
  if (!id) return alert('No ID to delete');

  const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Delete failed');
  setMembers(prev => prev.filter(m => m.member_id !== id));
};

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      member_name: member.member_name,
      membership_type: member.membership_type,
      attendance_days: member.attendance_days,
      trainer_assigned: member.trainer_assigned,
      monthly_fee: member.monthly_fee
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      member_name: '',
      membership_type: 'Silver',
      attendance_days: 0,
      trainer_assigned: 'None',
      monthly_fee: 60
    });
  };

  // --- ANALYTICS CALCULATIONS ---
  const stats = useMemo(() => {
    const totalMembers = members.length;
    const totalRevenue = members.reduce((acc, curr) => acc + (curr.monthly_fee || 0), 0);
    const avgFee = totalMembers > 0 ? (totalRevenue / totalMembers).toFixed(2) : "0";
    const avgAttendance = totalMembers > 0 ? (members.reduce((acc, curr) => acc + (curr.attendance_days || 0), 0) / totalMembers).toFixed(1) : "0";
    
    const typeDist = members.reduce((acc, curr) => {
      const type = curr.membership_type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const typeChartData = Object.keys(typeDist).map(key => ({ name: key, count: typeDist[key] }));

    return { totalMembers, totalRevenue, avgFee, avgAttendance, typeChartData };
  }, [members]);

  const predictiveData = useMemo(() => generatePredictiveData(HISTORICAL_REVENUE), []);

  const prescriptions = useMemo(() => {
    const suggestions = [];
    const lowAttendanceCount = members.filter(m => m.attendance_days < 5).length;
    if (lowAttendanceCount > 0) {
      suggestions.push({
        type: 'critical',
        title: 'High Risk of Churn',
        desc: `${lowAttendanceCount} members have visited less than 5 times. Assign trainers for check-in calls immediately.`
      });
    }

    if (predictiveData.length > 4) {
      const startReg = predictiveData[0].regression ?? 0;
      const endReg = predictiveData[predictiveData.length-4].regression ?? 0;
      const slope = endReg - startReg;
      
      if (slope > 0) {
        suggestions.push({
          type: 'success',
          title: 'Positive Growth Trajectory',
          desc: 'Linear regression indicates steady growth. Suggest increasing capacity or adding Platinum perks to capitalize on trend.'
        });
      }
    }

    const trainerCounts = members.reduce((acc, m) => {
      if(m.trainer_assigned && m.trainer_assigned !== 'None') {
        acc[m.trainer_assigned] = (acc[m.trainer_assigned] || 0) + 1;
      }
      return acc;
    }, {});
    
    // Find highest load trainer
    const overloadedTrainer = Object.entries(trainerCounts).sort((a,b) => b[1] - a[1])[0];
    if(overloadedTrainer && overloadedTrainer[1] > 2) {
      suggestions.push({
        type: 'warning',
        title: 'Trainer Optimization',
        desc: `${overloadedTrainer[0]} is managing ${overloadedTrainer[1]} active clients. Consider rebalancing load to junior staff.`
      });
    }

    return suggestions;
  }, [members, predictiveData]);

  const filteredMembers = members.filter(m => filterType === 'All' || m.membership_type === filterType);

  const getAttendanceColor = (days) => {
    if (days >= 20) return 'bg-emerald-100 text-emerald-700';
    if (days >= 10) return 'bg-blue-100 text-blue-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-slate-900 text-white p-6 hidden md:flex flex-col shadow-xl z-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 bg-emerald-500 rounded-lg">
            <Activity className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none">FitLogic</h1>
            <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">Analytics</span>
          </div>
        </div>
        
        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <BarChart3 size={20} />
            <span className="font-medium">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('members')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === 'members' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <Users size={20} />
            <span className="font-medium">Members</span>
          </button>
        </nav>

        <div className="pt-6 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${!serverError ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
            <span className="text-xs font-mono text-slate-400">
              {!serverError ? 'NEON DB ACTIVE' : 'CONN ERROR'}
            </span>
          </div>
          <p className="text-[10px] text-slate-600 px-2 leading-relaxed">
            Prisma ORM<br/>
            PostgreSQL (Neon)
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 h-screen overflow-y-auto bg-slate-50">
        <div className="p-8 max-w-7xl mx-auto">
        
          {/* TOP BAR */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
                {activeTab === 'dashboard' ? 'Business Overview' : 'Member Management'}
              </h2>
              <p className="text-slate-500 mt-1">Welcome back, Administrator.</p>
            </div>
            <div className="flex items-center gap-4">
               <div className={`px-4 py-2 bg-white border ${!serverError ? 'border-slate-200' : 'border-red-200'} rounded-lg text-sm text-slate-600 shadow-sm flex items-center gap-2`}>
                  {loading && !members.length ? (
                    <>
                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Database size={14} className={!serverError ? "text-emerald-500" : "text-red-500"} />
                      <span className="font-medium">{!serverError ? 'Neon Database' : 'Connection Failed'}</span>
                    </>
                  )}
               </div>
               <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                 AD
               </div>
            </div>
          </header>

          {/* DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Total Members" value={stats.totalMembers} subtext="Active Accounts" icon={Users} colorClass="bg-blue-500" />
                <Card title="Avg. Monthly Fee" value={`$${stats.avgFee}`} subtext="Per Member" icon={Activity} colorClass="bg-emerald-500" />
                <Card title="Avg. Attendance" value={stats.avgAttendance} subtext="Visits / Month" icon={TrendingUp} colorClass="bg-purple-500" />
                <Card title="Est. Revenue" value={`$${stats.totalRevenue}`} subtext="Current Month" icon={ArrowUpRight} colorClass="bg-indigo-500" />
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
                      <LineChart data={predictiveData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
          )}

          {/* MEMBERS VIEW */}
          {activeTab === 'members' && (
             <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
               
               {/* Controls */}
               <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                   <div className="relative w-full sm:w-64">
                     <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                     <input 
                       type="text" 
                       placeholder="Search members..." 
                       className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                     />
                   </div>
                   <div className="flex items-center gap-2 w-full sm:w-auto">
                     <Filter className="w-4 h-4 text-slate-500" />
                     <select 
                       value={filterType} 
                       onChange={(e) => setFilterType(e.target.value)}
                       className="bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 py-2 pl-2 pr-8 rounded-lg outline-none cursor-pointer hover:bg-slate-100 transition-colors w-full sm:w-auto"
                     >
                       <option value="All">All Tiers</option>
                       <option value="Gold">Gold</option>
                       <option value="Silver">Silver</option>
                       <option value="Platinum">Platinum</option>
                     </select>
                   </div>
                 </div>
                 <button 
                   onClick={() => { resetForm(); setEditingMember(null); setShowModal(true); }}
                   disabled={!!serverError}
                   className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 shadow-sm shadow-emerald-200 transition-all hover:shadow-emerald-300 active:scale-95 whitespace-nowrap"
                 >
                   <Plus size={18} /> Add Member
                 </button>
               </div>

               {/* Table */}
               <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                 <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                     <thead className="bg-slate-50 border-b border-slate-100">
                       <tr>
                         <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Member Name</th>
                         <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                         <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance</th>
                         <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trainer</th>
                         <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fee</th>
                         <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                       {filteredMembers.map(member => (
                         <tr key={member.member_id} className="hover:bg-slate-50/80 transition-colors group">
                           <td className="p-4 font-semibold text-slate-700">{member.member_name}</td>
                           <td className="p-4">
                             <span className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1
                               ${member.membership_type === 'Platinum' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 
                                 member.membership_type === 'Gold' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                                 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                               <div className={`w-1.5 h-1.5 rounded-full ${
                                 member.membership_type === 'Platinum' ? 'bg-indigo-500' : 
                                 member.membership_type === 'Gold' ? 'bg-amber-500' : 
                                 'bg-slate-400'
                               }`}></div>
                               {member.membership_type}
                             </span>
                           </td>
                           <td className="p-4">
                             <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getAttendanceColor(member.attendance_days).replace('text', 'border-transparent text')}`}>
                                  {member.attendance_days} days
                                </span>
                                {member.attendance_days < 5 && (
                                  <Tooltip title="Low Attendance Risk">
                                    <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                                  </Tooltip>
                                )}
                             </div>
                           </td>
                           <td className="p-4 text-slate-600 text-sm flex items-center gap-2">
                             {member.trainer_assigned !== 'None' ? (
                               <>
                                 <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                   {member.trainer_assigned.charAt(0)}
                                 </div>
                                 {member.trainer_assigned}
                               </>
                             ) : (
                               <span className="text-slate-400 italic">No Trainer</span>
                             )}
                           </td>
                           <td className="p-4 font-mono text-slate-700 font-medium">${member.monthly_fee}</td>
                           <td className="p-4 text-right">
                             <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => handleEdit(member)} className="p-1.5 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm rounded-md text-slate-500 transition-all"><Edit size={16} /></button>
                               <button onClick={() => handleDelete(member.member_id)} className="p-1.5 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-md text-red-500 transition-all"><Trash2 size={16} /></button>
                             </div>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
                 {filteredMembers.length === 0 && (
                   <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                        <Search size={32} />
                      </div>
                      <p>{serverError ? "Database connection error." : "No members found. Add one to get started!"}</p>
                      {!serverError && (
                        <button onClick={() => {resetForm(); setShowModal(true)}} className="text-emerald-600 font-medium text-sm mt-2 hover:underline">Add First Member</button>
                      )}
                   </div>
                 )}
               </div>
             </div>
          )}

        </div>
      </main>

      {/* MODAL DIALOG */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div className="bg-white p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-800">{editingMember ? 'Edit Member' : 'Add New Member'}</h3>
                <p className="text-xs text-slate-500">
                  {editingMember ? 'Updating Neon DB record' : 'Creating new Neon DB record'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddMember} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <input required type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                  value={formData.member_name} onChange={(e) => setFormData({...formData, member_name: e.target.value})} placeholder="e.g. John Doe" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Membership</label>
                  <div className="relative">
                    <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-500"
                      value={formData.membership_type} onChange={(e) => setFormData({...formData, membership_type: e.target.value})}>
                      <option value="Silver">Silver</option>
                      <option value="Gold">Gold</option>
                      <option value="Platinum">Platinum</option>
                    </select>
                    <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                      <ArrowUpRight size={14} className="rotate-45" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Fee ($)</label>
                  <input type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                    value={formData.monthly_fee} onChange={(e) => setFormData({...formData, monthly_fee: parseFloat(e.target.value)})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Attendance</label>
                  <input type="number" max="31" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                    value={formData.attendance_days} onChange={(e) => setFormData({...formData, attendance_days: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Trainer</label>
                  <div className="relative">
                    <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-500"
                      value={formData.trainer_assigned} onChange={(e) => setFormData({...formData, trainer_assigned: e.target.value})}>
                      <option value="None">None</option>
                      <option value="Mike Ross">Mike Ross</option>
                      <option value="Rachel Zane">Rachel Zane</option>
                      <option value="Harvey Specter">Harvey Specter</option>
                    </select>
                     <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                      <ArrowUpRight size={14} className="rotate-45" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 font-medium shadow-md shadow-emerald-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Save size={18} />}
                  {editingMember ? 'Update Changes' : 'Save Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;