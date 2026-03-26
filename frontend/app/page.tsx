'use client';

import { useRouter } from 'next/navigation';
import { Activity, Brain, Shield, ArrowRight, MessageSquare, AlertCircle, Sparkles, HeartPulse } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: MessageSquare,
      emoji: '💬',
      title: 'Intelligent Conversation',
      desc: 'Communicate your symptoms in natural language. Our AI analyzes your input to provide immediate guidance and potential health insights.'
    },
    {
      icon: Brain,
      emoji: '🧠',
      title: 'Symptom Logic',
      desc: 'Utilizing advanced medical data patterns to categorize symptoms and prioritize health concerns based on clinical relevance.'
    },
    {
      icon: Shield,
      emoji: '🛡️',
      title: 'Secured by Design',
      desc: 'Your health data is encrypted at rest and in transit. We ensure that your personal information remains strictly confidential.'
    },
    {
      icon: AlertCircle,
      emoji: '⚠️',
      title: 'Vulnerability Check',
      desc: 'Identify potential health risks early. Our system flags inconsistencies in symptoms to ensure you get the right attention when it matters.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3b82f6] via-[#2563eb] to-[#10b981] font-sans selection:bg-blue-100/30">
      
      {/* Navigation - Buttons optimized for mobile alignment */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/20 border-b border-white/30">
        <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-white rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform">
              <Activity className="text-blue-600 h-5 w-5 md:h-6 md:w-6" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tighter uppercase text-white drop-shadow-sm">Medexa</span>
          </div>
          
          {/* Action Buttons - Now identical in size and text length */}
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => router.push('/auth/login')} 
              className="px-4 md:px-6 py-2 md:py-2.5 bg-white text-blue-700 rounded-full text-xs md:text-sm font-black active:scale-95 transition-all shadow-xl hover:bg-blue-50"
            >
              Login 🔑
            </button>
            <button 
              onClick={() => router.push('/auth/register')} 
              className="px-4 md:px-6 py-2 md:py-2.5 bg-white text-blue-700 rounded-full text-xs md:text-sm font-black active:scale-95 transition-all shadow-xl hover:bg-blue-50"
            >
              Start 🚀
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6">
        {/* Hero Section */}
        <section className="py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-sm">
            <Sparkles className="h-3 w-3 text-yellow-300" /> AI-Powered Wellness
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 text-white drop-shadow-lg">
            Virtual Health <br />
            <span className="flex items-center justify-center gap-4">
              Assistance <HeartPulse className="h-12 w-12 md:h-20 md:w-20 text-white animate-pulse" />
            </span>
          </h1>
          <p className="max-w-xl mx-auto text-lg md:text-xl text-white font-bold mb-10 drop-shadow-md leading-relaxed">
            Medexa helps you understand your symptoms and navigate your health journey with AI-driven clarity. ✨
          </p>
          <button 
            onClick={() => router.push('/auth/register')}
            className="px-10 py-5 bg-white text-blue-700 rounded-2xl font-black text-xl hover:bg-blue-50 transition-all flex items-center gap-3 mx-auto shadow-2xl active:scale-95 group"
          >
            Start Conversation 🗣️ <ArrowRight className="h-6 w-6 stroke-[3px] group-hover:translate-x-1 transition-transform" />
          </button>
        </section>

        {/* Feature Grid */}
        <section className="pb-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="p-10 bg-white rounded-[2.5rem] border border-white/40 transition-all hover:shadow-2xl hover:-translate-y-2 shadow-blue-900/40 relative overflow-hidden group"
            >
              <div className="absolute top-6 right-8 text-4xl opacity-20 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500">
                {feature.emoji}
              </div>
              
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-8 shadow-inner group-hover:bg-blue-600 transition-colors">
                <feature.icon className="text-blue-700 group-hover:text-white transition-colors stroke-[2.5px]" size={24} />
              </div>
              
              <h3 className="text-3xl font-black mb-4 tracking-tight text-slate-900">
                {feature.title}
              </h3>
              <p className="text-slate-700 text-lg font-bold leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </section>

        {/* Built for Clarity Section */}
        <section className="py-16 border-t border-white/30 text-center md:text-left">
          <div className="max-w-2xl text-white">
            <h2 className="text-4xl font-black mb-6 tracking-tighter italic drop-shadow-md">Built for clarity 🔎</h2>
            <p className="text-white text-xl font-bold leading-relaxed drop-shadow-sm">
              We believe health technology should be intuitive, not intimidating. Medexa is designed to provide clear answers when you need them most. 💡
            </p>
          </div>
        </section>

        {/* Medical Description Section */}
        <section className="py-12 bg-white rounded-[2.5rem] px-10 mb-20 shadow-2xl border-4 border-white/20">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.3em]">Medical Description</h4>
              <span className="text-lg">📋</span>
            </div>
            <p className="text-slate-800 text-sm font-bold leading-relaxed max-w-5xl">
              Medexa is a virtual health assistant platform built to bridge the gap between complex medical information and user understanding. Our system uses advanced computational logic to analyze symptom patterns. 
              <br /><br />
              <strong>⚠️ Disclaimer:</strong> This tool is for informational purposes only and does not constitute professional medical advice, diagnosis, or treatment. Always consult with a licensed healthcare provider for any medical concerns. 
            </p>
          </div>
        </section>
      </main>

      <footer className="py-10 text-center border-t border-white/20">
        <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center justify-center gap-2">
          Made with ❤️ for your health by syed mohi • 2026
        </p>
      </footer>
    </div>
  );
}