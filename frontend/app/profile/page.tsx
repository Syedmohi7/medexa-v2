'use client';

import { useEffect, useState } from 'react';
import { userAPI } from '../lib/api';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import { Save, Camera, Trash2, User, Mail, Info, Heart, Target } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    bloodGroup: '',
    existingConditions: [] as string[],
    emergencyContact: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [profilePicture, setProfilePicture] = useState<string>('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) return;

    const user = JSON.parse(userData);

    setProfile({
      name: user.name || '',
      email: user.email || '',
      age: user.healthProfile?.age?.toString() || '',
      gender: user.healthProfile?.gender || '',
      height: user.healthProfile?.height?.toString() || '',
      weight: user.healthProfile?.weight?.toString() || '',
      bloodGroup: user.healthProfile?.bloodGroup || '',
      existingConditions: user.healthProfile?.existingConditions || [],
      emergencyContact: user.healthProfile?.emergencyContact || '',
    });

    setBmi(user.healthProfile?.bmi || null);

    const pic = localStorage.getItem(`profilePicture_${user.email}`);
    if (pic) setProfilePicture(pic);
  }, []);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setProfilePicture(base64);
      localStorage.setItem(`profilePicture_${profile.email}`, base64);
    };
    reader.readAsDataURL(file);
  };

  const removeProfilePicture = () => {
    setProfilePicture('');
    localStorage.removeItem(`profilePicture_${profile.email}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    try {
      const payload = {
        age: profile.age ? Number(profile.age) : undefined,
        gender: profile.gender || undefined,
        height: profile.height ? Number(profile.height) : undefined,
        weight: profile.weight ? Number(profile.weight) : undefined,
        bloodGroup: profile.bloodGroup || undefined,
        existingConditions: profile.existingConditions,
        emergencyContact: profile.emergencyContact,
      };

      const res = await userAPI.updateProfile(payload);
      setBmi(res.data.healthProfile.bmi);

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.healthProfile = res.data.healthProfile;
      localStorage.setItem('user', JSON.stringify(user));

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gradient-to-br from-[#3b82f6] via-[#2563eb] to-[#10b981]">
        <Sidebar />

        <div className="flex-1 md:ml-64 px-4 md:px-8 pt-24 md:pt-10 pb-10 overflow-y-auto h-screen">
          
          <div className="max-w-4xl mx-auto">
            {/* GLASS HEADER */}
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-[2.5rem] p-8 mb-8 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-white text-[#2563eb] flex items-center justify-center text-4xl font-black overflow-hidden shadow-2xl border-4 border-white/30 transition-transform hover:scale-105">
                    {profilePicture ? (
                      <img src={profilePicture} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      profile.name.slice(0, 2).toUpperCase()
                    )}
                  </div>

                  <div className="absolute -bottom-2 -right-2 flex flex-col gap-2">
                    <label className="bg-[#2563eb] p-3 rounded-2xl cursor-pointer shadow-xl hover:bg-blue-600 transition-colors">
                      <Camera className="h-5 w-5 text-white" />
                      <input type="file" hidden onChange={handleProfilePictureChange} />
                    </label>
                    {profilePicture && (
                      <button 
                        onClick={removeProfilePicture}
                        className="bg-rose-500 p-3 rounded-2xl shadow-xl hover:bg-rose-600 transition-colors"
                      >
                        <Trash2 className="h-5 w-5 text-white" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-center md:text-left">
                  <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">{profile.name}</h1>
                  <p className="text-white/80 font-bold flex items-center justify-center md:justify-start gap-2 mt-2">
                    <Mail size={16} /> {profile.email}
                  </p>
                  {bmi !== null && (
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-2xl text-[#2563eb] font-black shadow-lg">
                      <Heart size={18} fill="currentColor" /> BMI: {bmi}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {success && (
              <div className="mb-8 bg-emerald-400 text-slate-900 rounded-[2rem] p-6 font-black text-center shadow-2xl animate-bounce">
                ✅ {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* BASIC INFO */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border-4 border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <Info className="text-[#2563eb]" />
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Vital Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Age</label>
                    <input
                      className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-bold text-slate-900 focus:border-[#2563eb] outline-none transition-all"
                      placeholder="e.g. 22"
                      value={profile.age}
                      onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                    <select
                      className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-bold text-slate-900 focus:border-[#2563eb] outline-none transition-all appearance-none"
                      value={profile.gender}
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Height (cm)</label>
                    <input
                      className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-bold text-slate-900 focus:border-[#2563eb] outline-none transition-all"
                      placeholder="e.g. 180"
                      value={profile.height}
                      onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Weight (kg)</label>
                    <input
                      className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-bold text-slate-900 focus:border-[#2563eb] outline-none transition-all"
                      placeholder="e.g. 92"
                      value={profile.weight}
                      onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* EMERGENCY CONTACT (NEW) */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl text-white">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="text-blue-400" />
                  <h2 className="text-2xl font-black tracking-tight uppercase">Security & Emergencies</h2>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Emergency Phone Number</label>
                  <input
                    className="w-full h-14 bg-white/10 border-2 border-white/10 rounded-2xl px-6 font-bold text-white focus:border-blue-400 outline-none transition-all"
                    placeholder="+91 XXXX XXX XXX"
                    value={profile.emergencyContact}
                    onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full h-16 bg-white text-[#2563eb] rounded-[2rem] font-black text-xl shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 hover:bg-blue-50"
              >
                <Save size={24} />
                {loading ? 'SYNCING DATA...' : 'SAVE MEDEXA PROFILE'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}