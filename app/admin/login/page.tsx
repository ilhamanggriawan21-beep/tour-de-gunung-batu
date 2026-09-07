'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import TopoBackground from '@/components/TopoBackground';
import { Lock, Bike, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      setLoading(false);

      if (data.success && data.admin) {
        localStorage.setItem('tdgb_admin_session', JSON.stringify(data.admin));
        router.push('/admin');
      } else {
        setError(data.error || 'Email atau kata sandi tidak valid.');
      }
    } catch (err) {
      setLoading(false);
      setError('Terjadi kesalahan koneksi.');
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 relative bg-brand-navy flex items-center justify-center">
      <TopoBackground />

      <div className="max-w-md w-full relative z-10 space-y-6">
        <div className="text-center text-white">
          <div className="w-14 h-14 rounded-2xl bg-brand-royal text-brand-yellow flex items-center justify-center mx-auto mb-3 border-2 border-brand-yellow shadow-glow">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold font-display text-brand-yellow">PORTAL ADMIN PANITIA</h1>
          <p className="text-xs text-brand-sky mt-1">Rudeboys Cyclist & PEADERAL Indonesia</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-900/80 border border-rose-500 text-rose-200 rounded-2xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-brand-sky/20 shadow-glow space-y-4 text-white">
          <div>
            <label className="block text-xs font-bold text-brand-sky mb-1">Email / Akun Login Admin *</label>
            <input
              type="text"
              required
              placeholder="admin.tourdegunungbatu.com atau rudeboys@..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-brand-navy/80 border border-brand-sky/30 text-white focus:outline-none focus:border-brand-yellow text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-sky mb-1">Kata Sandi *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-brand-navy/80 border border-brand-sky/30 text-white focus:outline-none focus:border-brand-yellow text-sm"
            />
            <p className="text-[10px] text-brand-sky/60 mt-1">
              Default password MVP: <code className="text-brand-yellow font-bold">admin123</code>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-yellow hover:bg-amber-400 text-brand-navy font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-glow"
          >
            {loading ? 'Memeriksa Hak Akses...' : 'Masuk Dashboard Admin'}
          </button>
        </form>

        <div className="text-center text-[11px] text-brand-sky/60">
          Hanya 2 akun terautentikasi (Rudeboys & PEADERAL) yang memiliki akses ke panel ini.
        </div>
      </div>
    </div>
  );
}
