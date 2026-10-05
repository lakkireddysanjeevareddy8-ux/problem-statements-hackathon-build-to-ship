import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  UserPlus,
  User,
  CreditCard,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Lock,
  ShieldCheck,
  Loader2
} from 'lucide-react';

export default function Register({ onNavigate }) {
  const { loginWithNiat, loginAdmin } = useAuth();
  const [name, setName] = useState('');
  const [niatId, setNiatId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = name.trim();
    const cleanNiatId = niatId.trim();

    // Smart detection: If an email is entered in either field, authenticate directly as Admin
    const possibleEmail = (cleanNiatId && cleanNiatId.includes('@'))
      ? cleanNiatId
      : ((cleanName && cleanName.includes('@')) ? cleanName : null);

    if (possibleEmail) {
      setLoading(true);
      try {
        const adminRes = await loginAdmin(possibleEmail);
        setLoading(false);
        if (adminRes.success) {
          onNavigate('admin');
          return;
        } else {
          setErrorMsg(adminRes.message || 'This email is not authorized for administrator access.');
          return;
        }
      } catch (err) {
        setLoading(false);
        setErrorMsg('Failed to connect to the server. Please try again.');
        return;
      }
    }

    if (!cleanName || !cleanNiatId) {
      setErrorMsg('Please enter your name and NIAT ID.');
      return;
    }

    setLoading(true);

    try {
      const result = await loginWithNiat(cleanName, cleanNiatId.toUpperCase());
      setLoading(false);

      if (result.success) {
        if (result.user?.role === 'ADMIN' || result.isAdmin) {
          onNavigate('admin');
        } else {
          onNavigate(result.assignedProblem ? 'my-problem' : 'problems');
        }
      } else {
        setErrorMsg(result.message || 'Registration failed. Please check your details.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md">
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-2xl shadow-2xl shadow-indigo-950/30">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Participant Registration • 140 Seats</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              Participant Registration
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Enter your Name and NIAT ID to register and choose your challenge.
            </p>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMsg}</div>
            </div>
          )}

          {/* Participant Registration Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="register-name" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="register-name"
                  type="text"
                  placeholder="e.g. Sanjeev Reddy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  autoComplete="name"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="register-niat-id" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                NIAT ID
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="register-niat-id"
                  type="text"
                  placeholder="e.g. NIAT003"
                  value={niatId}
                  onChange={(e) => setNiatId(e.target.value)}
                  disabled={loading}
                  autoComplete="off"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white font-mono placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all ${niatId.includes('@') ? '' : 'uppercase'} disabled:opacity-50`}
                />
              </div>
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Registering Participant...</span>
                </>
              ) : (
                <>
                  <span>Register & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Key Constraints Box */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200">One Problem Guarantee:</strong> One NIAT ID = One participant account. Once you select and confirm your challenge, it is permanently locked to your account.
              </div>
            </div>
          </div>

          {/* Navigation link to Login */}
          <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="text-indigo-400 font-bold hover:underline cursor-pointer"
              >
                Log In here
              </button>
            </span>

            <button
              type="button"
              onClick={() => onNavigate('admin-login')}
              className="text-slate-500 hover:text-purple-400 transition-colors inline-flex items-center gap-1 cursor-pointer font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Access</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

