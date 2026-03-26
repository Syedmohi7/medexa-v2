'use client';

import { doctors } from './doctors';
import DoctorAvatar from '../components/DoctorAvatar';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import { ExternalLink, Stethoscope, Award, Calendar } from 'lucide-react';

export default function ConsultDoctorPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gradient-to-br from-[#3b82f6] via-[#2563eb] to-[#10b981]">
        <Sidebar />

        {/* pt-24 ensures the header is not hidden behind the mobile navigation bar */}
        <div className="flex-1 ml-0 md:ml-64 p-4 md:p-8 pt-24 md:pt-10 overflow-y-auto h-screen">
          <div className="max-w-7xl mx-auto">
            
            {/* GLASS HEADER */}
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-[2rem] p-6 md:p-8 mb-8 shadow-2xl">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-white rounded-2xl shadow-lg">
                  <Stethoscope className="h-7 w-7 text-[#2563eb]" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase leading-tight">
                    Consult Specialists
                  </h1>
                  <p className="text-white font-bold text-sm md:text-base">
                    Expert medical advice at your fingertips 🩺
                  </p>
                </div>
              </div>
              <p className="text-white text-sm font-bold mt-4 max-w-2xl leading-relaxed drop-shadow-sm">
                Browse our directory of verified specialists. Book appointments securely via official health platforms like Apollo and Practo.
              </p>
            </div>

            {/* DOCTOR GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doc, index) => (
                <div
                  key={index}
                  className="bg-white rounded-[2.5rem] p-6 shadow-2xl hover:-translate-y-2 transition-all duration-300 border-4 border-white/20 group"
                >
                  {/* Doctor Info Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse group-hover:hidden" />
                        <DoctorAvatar gender={doc.gender as 'male' | 'female'} />
                    </div>
                    <div>
                      <h2 className="font-black text-xl text-slate-900 leading-tight">
                        {doc.name}
                      </h2>
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 rounded-lg text-blue-700 text-[10px] font-black uppercase mt-1 tracking-wider">
                        {doc.specialization}
                      </div>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-blue-600 stroke-[2.5px]" />
                        <div>
                            <span className="text-slate-500 uppercase text-[10px] font-black block tracking-widest">Qualification</span>
                            <p className="text-sm font-black text-slate-800">{doc.qualification}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-blue-600 stroke-[2.5px]" />
                        <div>
                            {/* FIXED LINE 83: Removed redundant text-slate-400 and darkened for visibility */}
                            <span className="text-slate-500 uppercase text-[10px] font-black block tracking-widest">Experience</span>
                            <p className="text-sm font-black text-slate-800">{doc.experience}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                            <div className="h-2 w-2 bg-white rounded-full" />
                        </div>
                        <div>
                            <span className="text-slate-500 uppercase text-[10px] font-black block tracking-widest">Available On</span>
                            <p className="text-sm font-black text-slate-800">{doc.platform}</p>
                        </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <a
                    href={doc.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#2563eb] text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-600/20 group"
                  >
                    Book Now 🚀
                    <ExternalLink className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </a>

                  <p className="text-[10px] font-black text-slate-400 text-center mt-4 uppercase tracking-[0.2em]">
                    Redirecting to {doc.platform}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}