import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle, Key } from 'lucide-react';

export default function AdminLogin({ onNavigate }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (data.user.role !== 'ADMIN') {
          setErrorMsg('Access denied: This portal is strictly reserved for Hackathon Administrators.');
          setLoading(false);
          return;
        }
        login(data.user, data.token, data.assignedProblem);
        onNavigate('admin');
      } else {
        setErrorMsg(data.message || 'Invalid administrator credentials.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofillAdmin = () => {
    setEmail('admin@hackathon.org');
    setPassword('AdminSecureHackathon2026!');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="p-8 rounded-3xl bg-slate-900/80 border border-purple-500/30 backdrop-blur-xl shadow-2xl shadow-purple-500/10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 mx-auto flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
            Organizer Portal
          </span>
          <h2 className="text-2xl font-black text-white mt-2">Admin Dashboard Login</h2>
          <p className="text-xs text-slate-400 mt-1">Authorized hackathon committee & organizers only</p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="admin@hackathon.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Admin Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Verifying Admin Access...' : 'Enter Admin Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Autofill */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={handleAutofillAdmin}
            className="text-[11px] font-bold text-purple-400 hover:text-purple-300 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/40 border border-purple-800/50 transition-colors cursor-pointer"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Autofill Seed Admin Credentials</span>
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          Not an administrator?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-indigo-400 font-bold hover:underline cursor-pointer"
          >
            Go to Participant Login
          </button>
        </div>
      </div>
    </div>
  );
}
