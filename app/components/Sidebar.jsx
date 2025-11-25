import React from 'react';
import { Activity, BarChart3, Users } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, serverError }) => {
  return (
    <div className="w-64 bg-slate-900 text-white p-6 hidden md:flex flex-col shadow-xl z-10">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-2 bg-emerald-500 rounded-lg">
          <Activity className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight leading-none">GYM SYSTEM</h1>
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
  );
};

export default Sidebar;