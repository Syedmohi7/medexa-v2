'use client';

import { useState, useEffect } from 'react';
import { recommendationAPI } from '../lib/api';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import { Play, Clock, Sparkles, Activity, Youtube } from 'lucide-react';

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, [category]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const res = await recommendationAPI.getExercises({ symptom: category });
      setExercises(res.data.exercises || []);
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'general', label: 'General Fitness 🏃' },
    { value: 'stress', label: 'Stress Relief 🧘' },
    { value: 'back pain', label: 'Back Pain 🦴' },
    { value: 'fatigue', label: 'Energy Boost ⚡' },
    { value: 'anxiety', label: 'Anxiety Relief 🌊' }
  ];

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gradient-to-br from-[#3b82f6] via-[#2563eb] to-[#10b981]">
        <Sidebar />

        {/* MAIN CONTENT */}
        <div className="flex-1 md:ml-64 px-4 md:px-8 pt-24 md:pt-10 pb-10 overflow-y-auto h-screen">
          
          {/* GLASS HEADER */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-[2.5rem] p-8 mb-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-white rounded-2xl shadow-lg">
                <Activity className="h-7 w-7 text-[#2563eb]" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">
                  Workout Plans 🏋️
                </h1>
                <p className="text-white/90 font-bold text-sm md:text-base mt-1">
                  AI-Curated routines based on your health profile
                </p>
              </div>
            </div>
          </div>

          {/* CATEGORY FILTER */}
          <div className="mb-10 bg-white/5 backdrop-blur-sm p-6 rounded-[2rem] border border-white/10 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
               <Sparkles className="h-4 w-4 text-yellow-300" />
               <label className="text-xs font-black text-white uppercase tracking-widest">
                 Select Focus Area
               </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`px-6 py-3 rounded-2xl font-black transition-all active:scale-95 text-xs uppercase tracking-wider shadow-lg ${
                    category === cat.value
                      ? 'bg-white text-blue-700'
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* EXERCISE GRID */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
              <p className="text-white font-black uppercase text-xs tracking-widest">Syncing Routines...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {exercises.map((exercise, index) => (
                <div key={index} className="bg-white rounded-[2.5rem] p-6 shadow-2xl border-4 border-white/20 hover:-translate-y-2 transition-all group overflow-hidden">
                  
                  {/* Thumbnail Container */}
                  <div className="relative mb-6 rounded-[1.8rem] overflow-hidden bg-slate-900 aspect-video shadow-inner">
                    <img
                      src={`https://img.youtube.com/vi/${exercise.videoId}/mqdefault.jpg`}
                      alt={exercise.name}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />

                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-blue-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={`https://www.youtube.com/watch?v=${exercise.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white rounded-full p-5 shadow-2xl transform scale-75 group-hover:scale-100 transition-transform"
                      >
                        <Play className="h-8 w-8 text-blue-600 fill-blue-600" />
                      </a>
                    </div>
                    
                    {/* Duration Badge */}
                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-white" />
                        <span className="text-[10px] font-black text-white">{exercise.duration}</span>
                    </div>
                  </div>

                  {/* Text Details */}
                  <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight uppercase tracking-tight">
                    {exercise.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recommended for {category}</span>
                  </div>

                  <a
                    href={`https://www.youtube.com/watch?v=${exercise.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#2563eb] text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-600/20 group"
                  >
                    Watch Now <Youtube className="h-5 w-5" />
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* DISCLAIMER CARD */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-[2rem] p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-yellow-400 rounded-xl shadow-lg">
                <Sparkles className="h-5 w-5 text-slate-900" />
              </div>
              <div>
                <p className="text-sm text-white font-bold leading-relaxed italic">
                  <span className="uppercase tracking-widest mr-2 underline">Health Disclaimer:</span> 
                  Safety is priority. Consult with a healthcare professional before starting new high-intensity programs. Medexa AI provides curated educational content only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}