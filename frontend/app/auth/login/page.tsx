'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../../lib/api';
import { Activity, Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      router.push(
        response.data.user.role === 'admin' ? '/admin' : '/dashboard'
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-emerald-400 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8">

        {/* LOGO */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-3">
            MEDEXA
          </h1>
          <p className="text-sm text-gray-600">
            AI-Powered Health Assistant
          </p>
        </div>

        <h2 className="text-xl font-bold text-center mb-1">
          Welcome Back 👋
        </h2>
        <p className="text-center text-gray-600 text-sm mb-6">
          Sign in to continue your health journey
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="email"
                required
                className="input-field pl-11 py-3 rounded-xl"
                placeholder="you@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="password"
                required
                className="input-field pl-11 py-3 rounded-xl"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-70"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{' '}
          <button
            onClick={() => router.push('/auth/register')}
            className="text-blue-600 font-semibold hover:underline"
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}
