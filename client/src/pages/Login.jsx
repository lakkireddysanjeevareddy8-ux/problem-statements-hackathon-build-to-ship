import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

export default function Login({ onNavigate }) {
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
        login(data.user, data.token, data.assignedProblem);
        if (data.user.role === 'ADMIN') {
          onNavigate('admin');
        } else {
          onNavigate('problems');
        }
      } else {
        setErrorMsg(data.message || 'Invalid email or password.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoParticipant = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Participant123!');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Participant Login</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in to browse and lock your hackathon challenge</p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Fast Demo Logins (Click to autofill):</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoParticipant('alex.chen@university.edu')}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-300 hover:text-white hover:border-slate-700 transition-colors text-left"
            >
              <span className="font-bold block text-indigo-400">Alex Chen</span>
              alex.chen@university.edu
            </button>
            <button
              type="button"
              onClick={() => handleDemoParticipant('sarah.patel@tech.edu')}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-300 hover:text-white hover:border-slate-700 transition-colors text-left"
            >
              <span className="font-bold block text-cyan-400">Sarah Patel</span>
              sarah.patel@tech.edu
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="text-indigo-400 font-bold hover:underline cursor-pointer"
          >
            Register Now
          </button>
        </div>
      </div>
    </div>
  );
}
