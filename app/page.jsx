'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { generatePredictiveData } from './utils/analytics';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import MembersView from './components/MembersView';
import MemberModal from './components/MemberModal';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [members, setMembers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // --- FILTER STATES ---
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState(''); // NEW: Search State

  const [editingMember, setEditingMember] = useState(null);
  const [serverError, setServerError] = useState(null);
  
  // Data State
  const [predictiveData, setPredictiveData] = useState([]);
  const [revenueLoading, setRevenueLoading] = useState(false);

  const [formData, setFormData] = useState({
    member_name: '',
    membership_type: 'Silver',
    attendance_days: 0,
    trainer_assigned: 'None',
    monthly_fee: 60
  });

  // --- API INTEGRATION ---
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

  const fetchRevenue = async () => {
    setRevenueLoading(true);
    try {
      const res = await fetch('/api/revenue');
      if (!res.ok) throw new Error('Failed to load revenue');
      const json = await res.json();
      if (json.series) {
        setPredictiveData(generatePredictiveData(json.series));
      }
    } catch (err) {
      console.error('Revenue fetch error', err);
    } finally {
      setRevenueLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchRevenue();
  }, []);

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
        const res = await fetch(`/api/members/${editingMember.member_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Update failed');
        const updated = await res.json();
        setMembers(prev => prev.map(m => m.member_id === editingMember.member_id ? updated : m));
      } else {
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
      try { fetchRevenue(); } catch (e) { /* ignore */ }
    } catch (error) {
      console.error("Operation Error:", error);
      alert("Failed to save data. Check database connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return alert('No ID to delete');
    try {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setMembers(prev => prev.filter(m => m.member_id !== id));
      try { fetchRevenue(); } catch (e) { /* ignore */ }
    } catch (err) {
      console.error('Delete error', err);
      alert('Failed to delete member');
    }
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

  const chartData = predictiveData;

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

    if (chartData.length > 4) {
      const startReg = chartData[0].regression ?? 0;
      const endReg = chartData[chartData.length-4].regression ?? 0;
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

  // --- UPDATED FILTER LOGIC ---
  const filteredMembers = members.filter(m => {
    const matchesType = filterType === 'All' || m.membership_type === filterType;
    const matchesSearch = m.member_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} serverError={serverError} />

      <main className="flex-1 h-screen overflow-y-auto bg-slate-50">
        <div className="p-8 max-w-7xl mx-auto">
          <Header activeTab={activeTab} loading={loading} membersCount={members.length} serverError={serverError} />

          {activeTab === 'dashboard' && (
            <DashboardView 
              stats={stats} 
              chartData={chartData} 
              prescriptions={prescriptions} 
              serverError={serverError}
            />
          )}

          {activeTab === 'members' && (
             <MembersView 
               filteredMembers={filteredMembers}
               filterType={filterType}
               setFilterType={setFilterType}
               searchQuery={searchQuery}         // Pass Prop
               setSearchQuery={setSearchQuery}   // Pass Prop
               setShowModal={setShowModal}
               resetForm={resetForm}
               setEditingMember={setEditingMember}
               serverError={serverError}
               handleEdit={handleEdit}
               handleDelete={handleDelete}
             />
          )}
        </div>
      </main>

      <MemberModal 
        showModal={showModal}
        setShowModal={setShowModal}
        editingMember={editingMember}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleAddMember}
        loading={loading}
      />
    </div>
  );
};

export default App;