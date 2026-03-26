'use client';
import { useState } from 'react';
import { analysisAPI } from '../lib/api';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import { 
  Upload, FileText, Pill, Activity, AlertCircle, 
  CheckCircle, Calendar, User, Loader2, Sparkles, 
  Search, ShieldCheck 
} from 'lucide-react';

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState<'prescription' | 'lab-report'>('prescription');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('File size should be less than 15MB');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload JPG, PNG, WEBP, or PDF only');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      alert('Please upload a file first');
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const endpoint = activeTab === 'prescription' 
        ? analysisAPI.analyzePrescription 
        : analysisAPI.analyzeLabReport;

      const res = await endpoint({ imageData: selectedImage });
      let safeData = res?.data?.data;

      if (typeof safeData === 'string') {
        try {
          safeData = JSON.parse(safeData);
        } catch {
          alert('Server returned invalid response. Please try again.');
          setAnalyzing(false);
          return;
        }
      }
      setResult(safeData);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Analysis failed.';
      alert(errorMsg);
    } finally {
      setAnalyzing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'normal': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'critical': return 'text-rose-600 bg-rose-50 border-rose-200';
      default: return 'text-amber-600 bg-amber-50 border-amber-200';
    }
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
                <ShieldCheck className="h-7 w-7 text-[#2563eb]" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                  Medical Analysis
                </h1>
                <p className="text-white font-bold mt-2 text-sm md:text-base opacity-90">
                  AI-powered OCR & Clinical Insights 🧬
                </p>
              </div>
            </div>
          </div>

          {/* TABS NAVIGATION */}
          <div className="flex gap-3 mb-8 bg-white/5 backdrop-blur-sm p-2 rounded-3xl border border-white/10 w-fit">
            <button
              onClick={() => { setActiveTab('prescription'); setResult(null); setSelectedImage(null); }}
              className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${
                activeTab === 'prescription' ? 'bg-white text-[#2563eb] shadow-xl' : 'text-white hover:bg-white/10'
              }`}
            >
              <Pill size={18} /> Prescription
            </button>
            <button
              onClick={() => { setActiveTab('lab-report'); setResult(null); setSelectedImage(null); }}
              className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${
                activeTab === 'lab-report' ? 'bg-white text-[#2563eb] shadow-xl' : 'text-white hover:bg-white/10'
              }`}
            >
              <FileText size={18} /> Lab Report
            </button>
          </div>

          {/* UPLOAD SECTION */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl border-4 border-white/20 mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-6 flex items-center gap-2">
              <Upload className="text-[#2563eb]" /> {activeTab === 'prescription' ? 'Upload RX' : 'Upload Report'}
            </h2>
            
            <div className="border-4 border-dashed border-slate-100 rounded-[2rem] p-8 text-center hover:border-blue-200 transition-all cursor-pointer bg-slate-50">
              <input type="file" accept="image/*,application/pdf" onChange={handleImageUpload} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer">
                {selectedImage ? (
                  <div className="animate-in fade-in zoom-in">
                    {selectedImage.includes('application/pdf') ? (
                      <div className="flex flex-col items-center py-6">
                        <FileText className="h-24 w-24 text-rose-500 mb-4" />
                        <p className="font-black text-slate-900 uppercase text-xs">PDF Document Ready</p>
                      </div>
                    ) : (
                      <img src={selectedImage} alt="Preview" className="max-h-64 mx-auto rounded-3xl mb-4 shadow-2xl border-4 border-white" />
                    )}
                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest mt-4">Change Selection</p>
                  </div>
                ) : (
                  <div className="py-10">
                    <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                      <Upload className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Drop file here</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">JPG, PNG, PDF • MAX 15MB</p>
                  </div>
                )}
              </label>
            </div>

            {selectedImage && (
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full h-16 bg-[#2563eb] text-white rounded-2xl font-black text-xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 hover:bg-blue-700 mt-8"
              >
                {analyzing ? <Loader2 className="animate-spin" /> : <Activity />} ANALYZE NOW
              </button>
            )}
          </div>

          {/* RESULTS - PRESERVING DESKTOP TABLE STYLE ON MOBILE */}
          {result && (
            <div className="space-y-8 animate-in slide-in-from-bottom-5">
              
              {/* Common Summary Card */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border-4 border-white/20">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${getStatusColor(result.overallStatus || 'normal')} shadow-lg`}>
                    <Activity className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter">
                       Analysis Complete
                    </h3>
                    <p className="text-slate-500 font-bold">{result.summary || 'Extracted medical data below.'}</p>
                  </div>
                </div>
              </div>

              {/* THE TABLE - EXACT DESKTOP LOOK WITH HORIZONTAL SCROLL ON MOBILE */}
              <div className="bg-white rounded-[2.5rem] shadow-2xl border-4 border-white/20 overflow-hidden">
                <div className="overflow-x-auto"> {/* This allows horizontal swipe on mobile */}
                  <table className="w-full min-w-[600px]"> {/* Ensures table doesn't shrink below 600px */}
                    <thead className="bg-slate-900 text-white">
                      <tr className="text-[10px] font-black uppercase tracking-widest">
                        <th className="px-6 py-6 text-left">Parameter / Med</th>
                        <th className="px-6 py-6 text-left">Value / Dosage</th>
                        <th className="px-6 py-6 text-left">Range / Timing</th>
                        <th className="px-6 py-6 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeTab === 'lab-report' ? (
                        result.testResults?.map((test: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-5 font-black text-slate-900 uppercase text-xs">{test.parameter}</td>
                            <td className="px-6 py-5"><span className="text-xl font-black text-blue-600">{test.value}</span> <span className="text-xs font-bold text-slate-400">{test.unit}</span></td>
                            <td className="px-6 py-5 text-sm font-bold text-slate-500">{test.normalRange}</td>
                            <td className="px-6 py-5">
                              <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase border-2 ${getStatusColor(test.status)}`}>
                                {test.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        result.medicines?.map((med: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-5 font-black text-slate-900 uppercase text-xs">{med.name}</td>
                            <td className="px-6 py-5 font-black text-blue-600 uppercase text-xs">{med.dosage}</td>
                            <td className="px-6 py-5 text-sm font-bold text-slate-500 uppercase">{med.timing}</td>
                            <td className="px-6 py-5">
                              <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase bg-slate-900 text-white">
                                {med.duration}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Visual hint for mobile users */}
                <div className="md:hidden bg-slate-50 py-2 text-center border-t border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Swipe left/right to view full table ↔️</p>
                </div>
              </div>

              {/* BENTO FINDINGS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl text-white">
                   <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-2 text-blue-400">
                    <Search /> Key Findings
                  </h3>
                  <ul className="space-y-4">
                    {(result.keyFindings || []).map((finding: string, idx: number) => (
                      <li key={idx} className="flex gap-3 text-sm font-bold opacity-90 leading-relaxed">
                        <div className="h-2 w-2 rounded-full bg-blue-400 mt-1.5 shrink-0" /> {finding}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border-4 border-white/20">
                  <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-2 text-emerald-500">
                    <Sparkles /> AI Recommendations
                  </h3>
                   <ul className="space-y-4">
                    {(result.recommendations || []).map((rec: string, idx: number) => (
                      <li key={idx} className="flex gap-3 text-sm font-black text-slate-700 leading-relaxed">
                        <CheckCircle className="text-emerald-500 shrink-0" size={18} /> {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* DISCLAIMER */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-[2rem] p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="text-white h-6 w-6 flex-shrink-0" />
              <p className="text-xs text-white font-bold leading-relaxed">
                <span className="uppercase tracking-widest mr-2 underline">Clinical Disclaimer:</span> 
                This AI analysis is provided for educational purposes. Always consult a licensed doctor for medical diagnosis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}