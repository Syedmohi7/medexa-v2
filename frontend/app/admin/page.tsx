'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '../lib/api';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import {
  Users,
  MessageSquare,
  Activity,
  TrendingUp,
  Download,
  ShieldCheck,
  Database,
} from 'lucide-react';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await adminAPI.getDashboard();
      console.log(res.data);
      setStats(res.data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

        <div className="flex-1 md:ml-64 pt-24 md:pt-10 px-4 md:px-8 pb-10 overflow-y-auto h-screen">

          {/* HEADER */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-[2.5rem] p-8 mb-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-lg">
                <ShieldCheck className="h-7 w-7 text-[#2563eb]" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white uppercase">
                  Admin Control 🔐
                </h1>
                <p className="text-white/80 font-bold text-sm mt-1">
                  System monitoring & enhanced health analytics
                </p>
              </div>
            </div>

            <button
              onClick={() => adminAPI.exportUsers()}
              className="flex items-center gap-2 px-8 py-4 bg-white text-blue-700 rounded-2xl font-black text-xs uppercase hover:bg-blue-50 active:scale-95 transition-all shadow-xl"
            >
              <Download className="h-5 w-5" />
              EXPORT HEALTH DATA 📋
            </button>
          </div>

          {/* STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            <StatCard icon={<Users />} label="Total Users" value={stats?.totalUsers || 0} />
            <StatCard icon={<MessageSquare />} label="AI Sessions" value={stats?.totalChats || 0} />
            <StatCard icon={<Activity />} label="Logs Analyzed" value={stats?.totalSymptoms || 0} />
            <StatCard icon={<TrendingUp />} label="Growth Rate" value={stats?.newUsers || 0} />
          </div>

          {/* RECENT USERS */}
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-6 md:p-10">
            <div className="flex items-center gap-3 mb-8">
              <Database className="text-blue-600 h-6 w-6" />
              <h2 className="text-2xl font-black text-slate-900 uppercase">
                Recent Health Profiles
              </h2>
            </div>

            {/* MOBILE VIEW */}
            <div className="space-y-4 md:hidden">
              {stats?.recentUsers?.map((u: any, i: number) => (
                <div key={i} className="bg-slate-50 border rounded-2xl p-5 shadow-sm">
                  <p className="font-black text-slate-900 text-lg">{u.name}</p>
                  <p className="text-sm font-bold text-blue-600 mb-2">{u.email}</p>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase text-slate-400">
                    <p>
                      Age:{' '}
                      <span className="text-slate-900">
                        {u.age ?? 'N/A'}
                      </span>
                    </p>
                    <p>
                      Gender:{' '}
                      <span className="text-slate-900 capitalize">
                        {u.gender || 'N/A'}
                      </span>
                    </p>
                    <p>
                      Weight:{' '}
                      <span className="text-slate-900">
                        {u.weight ? `${u.weight} kg` : 'N/A'}
                      </span>
                    </p>
                    <p>
                      Height:{' '}
                      <span className="text-slate-900">
                        {u.height ? `${u.height} cm` : 'N/A'}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-slate-400 text-xs font-black uppercase border-b">
                    <th className="px-6 py-4 text-left">User</th>
                    <th className="px-6 py-4 text-left">Email</th>
                    <th className="px-6 py-4 text-left">Age</th>
                    <th className="px-6 py-4 text-left">Gender</th>
                    <th className="px-6 py-4 text-left">Weight</th>
                    <th className="px-6 py-4 text-left">Height</th>
                    <th className="px-6 py-4 text-left">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stats?.recentUsers?.map((u: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-5 font-black">{u.name}</td>
                      <td className="px-6 py-5 font-bold text-blue-600">{u.email}</td>

                      <td className="px-6 py-5">
                        {u.age ?? 'N/A'}
                      </td>

                      <td className="px-6 py-5 capitalize">
                        {u.gender || 'N/A'}
                      </td>

                      <td className="px-6 py-5">
                        {u.weight ? `${u.weight} kg` : 'N/A'}
                      </td>

                      <td className="px-6 py-5">
                        {u.height ? `${u.height} cm` : 'N/A'}
                      </td>

                      <td className="px-6 py-5 text-slate-400 text-sm">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}

/* ================= STAT CARD ================= */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: JSX.Element;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white rounded-[2rem] shadow-2xl p-6 flex items-center gap-5 border hover:-translate-y-2 transition-transform">
      <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
          {label}
        </p>
        <p className="text-3xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}
