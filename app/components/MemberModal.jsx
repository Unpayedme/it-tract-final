import React from 'react';
import { X, Save, ArrowUpRight } from 'lucide-react';

const MemberModal = ({ 
  showModal, 
  setShowModal, 
  editingMember, 
  formData, 
  setFormData, 
  handleSubmit, 
  loading 
}) => {
  if (!showModal) return null;

  return (
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
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
            <input required type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
              value={formData.member_name} onChange={(e) => setFormData({...formData, member_name: e.target.value})} placeholder="Full Name" />
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
                  <option value="Johnlee Jumao-ass">Johnlee Jumao-ass</option>
                  <option value="Jamak Gulbe Roger">Jamak Gulbe Roger</option>
                  <option value="Sefuesky">Sefuesky</option>
                </select>
                 <div className="absolute right-3 top-3 pointer-events-none text-slate-400  ">
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
  );
};

export default MemberModal;