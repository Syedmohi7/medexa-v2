'use client';

import { useEffect, useState } from 'react';
import { userAPI, reportAPI } from '../lib/api';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import {
  Download,
  Activity,
  Heart,
  TrendingUp,
  MessageSquare,
  Flame,
  Droplets,
  Utensils,
  Zap,
  AlertCircle,
  UserPlus
} from 'lucide-react';

const getBMICategory = (bmi: number | null) => {
  if (!bmi) return { label: 'Not Available', color: 'bg-white/20 text-white' };
  if (bmi < 18.5) return { label: 'Underweight', color: 'bg-yellow-400 text-slate-900' };
  if (bmi < 25) return { label: 'Normal', color: 'bg-emerald-400 text-slate-900' };
  if (bmi < 30) return { label: 'Overweight', color: 'bg-orange-400 text-slate-900' };
  return { label: 'Obese', color: 'bg-rose-400 text-slate-900' };
};

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await userAPI.getDashboard();
      setStats(res.data.stats);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Logic for new users vs existing users
  const hasProfile = stats?.healthProfile && stats.healthProfile.weight && stats.healthProfile.height;
  
  const weightKg = hasProfile ? Number(stats.healthProfile.weight) : null;
  
  // Clean Calculations with Rounding
  const waterIntakeLiters = weightKg ? (weightKg * 0.033).toFixed(1) : 'N/A';
  
  // ✅ Math.round ensures no decimal points for calories (e.g., 2208.4 becomes 2208)
  const maintenanceCalories = weightKg ? Math.round((weightKg * 24) + 500) : null; 
  const weightLossCalories = maintenanceCalories ? Math.round(maintenanceCalories - 500) : 'N/A';
  const activeBurnGoal = hasProfile ? Math.round(weightKg * 5.5) : 'N/A'; // Dynamic burn goal based on weight

  const bmiValue = stats?.healthProfile?.bmi ?? null;
  const bmiStatus = getBMICategory(bmiValue);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen bg-[#2563eb]">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gradient-to-br from-[#3b82f6] via-[#2563eb] to-[#10b981]">
        <Sidebar />

        <div className="flex-1 md:ml-64 px-4 md:px-8 pt-24 md:pt-10 pb-10 overflow-y-auto h-screen">
          
          {/* HEADER CARD */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-[2.5rem] p-8 mb-8 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                  Health Dashboard 📊
                </h1>
                <p className="text-white/80 font-bold mt-3">
                  {hasProfile ? 'Welcome back! Your clinical profile is active.' : 'Welcome! Please complete your profile to see rounded health metrics.'}
                </p>
              </div>
              
              {!hasProfile && (
                <a href="/profile" className="flex items-center gap-3 bg-white text-[#2563eb] px-6 py-3 rounded-2xl font-black shadow-lg hover:bg-blue-50 transition-all">
                  <UserPlus size={20} /> SETUP PROFILE
                </a>
              )}
            </div>
          </div>

          {/* KPI GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* BMI CARD */}
            <div className="relative rounded-[2.5rem] bg-white p-8 shadow-2xl overflow-hidden group hover:-translate-y-2 transition-all">
              <div className="absolute top-0 right-0 opacity-5 text-[100px] font-black pointer-events-none">BMI</div>
              <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <Heart className="text-[#2563eb]" size={28} />
              </div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Body Mass Index</p>
              <p className="text-4xl font-black text-slate-900 mt-2">{bmiValue ? bmiValue : 'N/A'}</p>
              <span className={`inline-block mt-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${bmiStatus.color}`}>
                {bmiStatus.label}
              </span>
            </div>

            {/* WATER INTAKE */}
            <div className="rounded-[2.5rem] bg-white p-8 shadow-2xl hover:-translate-y-2 transition-all group">
              <div className="bg-cyan-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:bg-cyan-500 transition-colors">
                <Droplets className="text-cyan-500 group-hover:text-white transition-colors" size={28} />
              </div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Daily Hydration</p>
              <p className="text-4xl font-black text-slate-900 mt-2">{waterIntakeLiters}{waterIntakeLiters !== 'N/A' && 'L'}</p>
              <p className="text-slate-500 text-[10px] font-black mt-4 uppercase italic">Rec. Goal: 8-10 Glasses 💧</p>
            </div>

            {/* CALORIES TO TAKE */}
            <div className="rounded-[2.5rem] bg-white p-8 shadow-2xl hover:-translate-y-2 transition-all group">
              <div className="bg-orange-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:bg-orange-500 transition-colors">
                <Utensils className="text-orange-500 group-hover:text-white transition-colors" size={28} />
              </div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Calorie Intake</p>
              <p className="text-4xl font-black text-slate-900 mt-2">{weightLossCalories}</p>
              <p className="text-slate-500 text-[10px] font-black mt-4 uppercase italic">Target for Weight Loss 🥗</p>
            </div>

            {/* CALORIES TO BURN */}
            <div className="rounded-[2.5rem] bg-white p-8 shadow-2xl hover:-translate-y-2 transition-all group">
              <div className="bg-rose-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:bg-rose-500 transition-colors">
                <Flame className="text-rose-500 group-hover:text-white transition-colors" size={28} />
              </div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Active Burn</p>
              <p className="text-4xl font-black text-slate-900 mt-2">{activeBurnGoal}</p>
              <p className="text-slate-500 text-[10px] font-black mt-4 uppercase italic">Daily Exercise Goal 🏃</p>
            </div>
          </div>

          {/* LOWER GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between">
                    <MessageSquare className="text-purple-600 mb-4" size={32} />
                    <div>
                        <p className="text-4xl font-black text-slate-900">{stats?.totalChats || 0}</p>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">AI Consultations</p>
                    </div>
                </div>
                <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between text-white">
                    <Zap className="text-yellow-400 mb-4" size={32} />
                    <div>
                        <p className="text-4xl font-black">{hasProfile ? '92%' : '0%'}</p>
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Accuracy Score</p>
                    </div>
                </div>
             </div>

             <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 flex flex-col justify-center">
                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter uppercase">Health Reports 📋</h2>
                <p className="text-slate-500 font-bold mb-8 italic">Generate your medical summary for doctor consultation.</p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    disabled={!hasProfile}
                    onClick={() => reportAPI.downloadPDF()}
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#2563eb] text-white font-black hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-200 disabled:opacity-50"
                  >
                    <Download size={20} /> PDF REPORT
                  </button>
                  <button
                    disabled={!hasProfile}
                    onClick={() => reportAPI.downloadCSV()}
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-4 border-slate-50 text-slate-900 font-black hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Download size={20} /> CSV DATA
                  </button>
                </div>
              </div>
          </div>

          <div className="mt-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-[2rem] p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="text-white h-6 w-6 flex-shrink-0" />
              <p className="text-sm text-white font-bold leading-relaxed">
                <span className="uppercase tracking-widest mr-2 underline">Medical Disclaimer:</span> 
                Rounded caloric and hydration data is calculated based on your profile weight of {hasProfile ? `${weightKg}kg` : 'N/A'}. Always verify with a clinical professional before adjusting your intake.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}