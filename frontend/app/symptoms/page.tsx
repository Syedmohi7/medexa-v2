'use client';

import { useState } from 'react';
import { symptomAPI } from '../lib/api';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import { AlertCircle, CheckCircle, XCircle, Activity, Brain, Sparkles, Search } from 'lucide-react';

export default function SymptomsPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const commonSymptoms = [
    'Fever','Cough','Headache','Fatigue','Sore Throat',
    'Nausea','Dizziness','Chest Pain','Shortness of Breath',
    'Abdominal Pain','Back Pain','Muscle Aches','Joint Pain',
    'Loss of Appetite','Insomnia','Anxiety','Depression'
  ];

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const addCustomSymptom = () => {
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms([...selectedSymptoms, customSymptom.trim()]);
      setCustomSymptom('');
    }
  };

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) {
      alert('Please select at least one symptom');
      return;
    }

    setLoading(true);
    setShowResult(false);

    try {
      const res = await symptomAPI.analyze({ symptoms: selectedSymptoms });
      setAnalysis(res.data.analysis);
      setTimeout(() => setShowResult(true), 300);
    } finally {
      setLoading(false);
    }
  };

  const getRiskIcon = (risk: string) => {
    if (risk === 'low') return <CheckCircle className="h-10 w-10 text-emerald-500" />;
    if (risk === 'medium') return <AlertCircle className="h-10 w-10 text-amber-500" />;
    return <XCircle className="h-10 w-10 text-rose-500" />;
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gradient-to-br from-[#3b82f6] via-[#2563eb] to-[#10b981]">
        <Sidebar />

        <div className="flex-1 md:ml-64 px-4 md:px-8 pt-24 md:pt-10 pb-10 overflow-y-auto h-screen">
          
          {/* GLASS HEADER */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-[2.5rem] p-8 mb-8 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-lg">
                <Brain className="h-7 w-7 text-[#2563eb]" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                  Symptom Analysis
                </h1>
                <p className="text-white font-bold mt-2 text-sm md:text-base opacity-90">
                  AI-powered clinical assessment 🛡️
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* INPUT SECTION */}
            {!showResult && (
              <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl border-4 border-white/20">
                <div className="flex items-center gap-3 mb-8">
                  <Activity className="text-[#2563eb]" />
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                    Select Your Symptoms
                  </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
                  {commonSymptoms.map(symptom => (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`p-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 border-2 ${
                        selectedSymptoms.includes(symptom)
                          ? 'bg-[#2563eb] border-[#2563eb] text-white shadow-lg shadow-blue-200'
                          : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-blue-200'
                      }`}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 font-bold text-slate-900 focus:border-[#2563eb] outline-none transition-all placeholder:text-slate-300"
                      placeholder="Add custom symptom..."
                      value={customSymptom}
                      onChange={(e) => setCustomSymptom(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCustomSymptom()}
                    />
                  </div>
                  <button 
                    className="h-14 px-8 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95" 
                    onClick={addCustomSymptom}
                  >
                    Add
                  </button>
                </div>

                <button
                  onClick={analyzeSymptoms}
                  disabled={loading}
                  className="w-full h-16 bg-[#2563eb] text-white rounded-2xl font-black text-xl shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 hover:bg-blue-700 disabled:opacity-70"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent" />
                  ) : (
                    <>🧠 ANALYZE WITH MEDEXA AI</>
                  )}
                </button>
              </div>
            )}

            {/* RESULTS SECTION */}
            {showResult && analysis && (
              <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                {/* RISK LEVEL */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border-4 border-white/20 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Risk Assessment</h2>
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-1">Generated by Jozo-AI</p>
                    </div>
                    {getRiskIcon(analysis.riskLevel)}
                  </div>

                  <div className={`inline-block px-8 py-3 rounded-2xl text-2xl font-black uppercase tracking-tighter ${
                    analysis.riskLevel === 'low' ? 'bg-emerald-100 text-emerald-700' :
                    analysis.riskLevel === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {analysis.riskLevel} Risk
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* PRECAUTIONS */}
                  <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl text-white">
                    <h2 className="text-xl font-black mb-6 flex items-center gap-2 uppercase tracking-tight">
                      <Sparkles className="text-blue-400 h-5 w-5" /> Precautions
                    </h2>
                    <ul className="space-y-4">
                      {analysis.precautions.map((p: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-sm font-bold opacity-90 leading-relaxed">
                          <div className="h-2 w-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* RECOMMENDATIONS */}
                  <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border-4 border-white/20">
                    <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-tight">
                      <CheckCircle className="text-emerald-500 h-5 w-5" /> Recommendations
                    </h2>
                    <ul className="space-y-4">
                      {analysis.recommendations.map((r: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-700 leading-relaxed">
                          <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* DISCLAIMER */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] p-6 text-center">
                  <p className="text-white font-bold text-xs leading-relaxed flex items-center justify-center gap-2">
                    <AlertCircle size={14} /> 
                    MEDICAL DISCLAIMER: This is an AI-generated assessment, not a formal diagnosis.
                  </p>
                </div>

                <button
                  onClick={() => setShowResult(false)}
                  className="w-full h-16 bg-white text-slate-900 rounded-2xl font-black text-lg shadow-xl hover:bg-slate-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  🔄 RE-ANALYZE SYMPTOMS
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}