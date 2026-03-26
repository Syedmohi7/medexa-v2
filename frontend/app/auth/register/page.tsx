'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../../lib/api';
import { Activity, Mail, Lock, User, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Exact Background Gradient from Screenshot
    <div className="min-h-screen bg-gradient-to-b from-[#3b82f6] via-[#2563eb] to-[#10b981] flex items-center justify-center p-6">
      
      {/* Main Card with specific rounded corners and deep shadow */}
      <div className="bg-[#f8fafc] rounded-[2.5rem] shadow-2xl p-8 w-full max-w-[440px] flex flex-col items-center">
        
        {/* Exact Icon Style */}
        <div className="w-16 h-16 bg-[#3b82f6] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-400/30 mb-4">
          <Activity className="h-10 w-10 text-white" />
        </div>

        {/* Logo and Subtext Fonts */}
        <h1 className="text-4xl font-black text-[#1e293b] tracking-tighter uppercase mb-1">
          MEDEXA
        </h1>
        <p className="text-gray-400 text-sm font-semibold tracking-tight mb-8">
          AI-Powered Health Assistant
        </p>

        <h2 className="text-2xl font-extrabold text-[#1e293b] mb-1">
          Create Account 👋
        </h2>
        <p className="text-gray-500 text-sm font-medium mb-8">
          Sign up to begin your health journey
        </p>

        {/* Error Handling */}
        {error && (
          <div className="w-full bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-red-800 text-xs font-bold">{error}</p>
          </div>
        )}

        {/* Form with Exact Input Styles */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-600 ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                required
                className="w-full h-14 bg-white border border-gray-200 rounded-2xl pl-12 pr-4 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-600 ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="email"
                required
                className="w-full h-14 bg-white border border-gray-200 rounded-2xl pl-12 pr-4 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                placeholder="you@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-600 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="password"
                required
                className="w-full h-14 bg-white border border-gray-200 rounded-2xl pl-12 pr-4 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5 pb-2">
            <label className="text-sm font-bold text-gray-600 ml-1">Confirm Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="password"
                required
                className="w-full h-14 bg-white border border-gray-200 rounded-2xl pl-12 pr-4 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          {/* Exact Button Blue Color */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-[#2563eb] text-white rounded-2xl font-extrabold text-lg shadow-lg shadow-blue-600/20 hover:bg-[#1d4ed8] active:scale-[0.98] transition-all disabled:opacity-70"
          >
            {loading ? 'Processing...' : 'Sign Up'}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-gray-500 font-bold text-sm">
          Already have an account?{' '}
          <button
            onClick={() => router.push('/auth/login')}
            className="text-[#2563eb] hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}