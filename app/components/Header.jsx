import React from 'react';
import { Database } from 'lucide-react';

const Header = ({ activeTab, loading, membersCount, serverError }) => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
          {activeTab === 'dashboard' ? 'Business Overview' : 'Member Management'}
        </h2>
        <p className="text-slate-500 mt-1">Welcome back, Administrator.</p>
      </div>
      <div className="flex items-center gap-4">
         <div className={`px-4 py-2 bg-white border ${!serverError ? 'border-slate-200' : 'border-red-200'} rounded-lg text-sm text-slate-600 shadow-sm flex items-center gap-2`}>
            {loading && !membersCount ? (
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
  );
};

export default Header;