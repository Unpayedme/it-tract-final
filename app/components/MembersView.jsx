import React from 'react';
import { Search, Filter, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Tooltip } from "@/components/ui/tooltip"; 

const MembersView = ({ 
  filteredMembers, 
  filterType, 
  setFilterType, 
  searchQuery,       // Receive Prop
  setSearchQuery,    // Receive Prop
  setShowModal, 
  resetForm, 
  setEditingMember, 
  serverError,
  handleEdit,
  handleDelete
}) => {

  const getAttendanceColor = (days) => {
    if (days >= 20) return 'bg-emerald-100 text-emerald-700';
    if (days >= 10) return 'bg-blue-100 text-blue-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
       
       {/* Controls */}
       <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-5 rounded-xl shadow-sm border border-slate-100  sticky z-50 top-2">
         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
           <div className="relative w-full sm:w-64">
             <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
             <input 
               type="text" 
               placeholder="Search members..." 
               value={searchQuery} // Bind Value
               onChange={(e) => setSearchQuery(e.target.value)} // Bind Event
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
  );
};

export default MembersView;