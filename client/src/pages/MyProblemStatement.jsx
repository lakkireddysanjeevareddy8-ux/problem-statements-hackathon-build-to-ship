import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Calendar,
  User,
  Users,
  Building,
  GraduationCap,
  Phone,
  Mail,
  Printer,
  Sparkles,
  ClipboardList,
  Target,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function MyProblemStatement({ onNavigate }) {
  const { user, token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyProblem() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/my-problem', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.success) {
          setData(result);
        }
      } catch (err) {
        console.error('Failed to load my problem:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMyProblem();
  }, [token]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-slate-400">Loading your assigned problem statement...</p>
      </div>
    );
  }

  if (!data || !data.hasSelected) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center mb-5">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">No Problem Statement Selected Yet</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
            You have not locked a challenge yet. Explore the 160 available problems across 16 domains and choose the best one for you.
          </p>
          <button
            onClick={() => onNavigate('problems')}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            Browse Available Problems
          </button>
        </div>
      </div>
    );
  }

  const { problem, participant, selected_at } = data.assignment;

  let tagsArray = [];
  try {
    tagsArray = typeof problem.tags === 'string' ? JSON.parse(problem.tags) : (problem.tags || []);
  } catch (e) {
    tagsArray = [];
  }

  const formattedDate = new Date(selected_at).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0 print:m-0 print:max-w-none">
      {/* Top Controls (Hidden on print) */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <button
          onClick={() => onNavigate('problems')}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Problem Dashboard</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Main Locked Status Banner */}
      <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-emerald-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span>🎯 Your Problem Statement</span>
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-bold text-slate-400">Problem ID: <span className="font-mono text-white">{problem.code}</span></span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 leading-tight">
                {problem.title}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-300 font-medium mt-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Your problem statement has been successfully locked to your account.</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <span className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black tracking-wide flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>STATUS: LOCKED</span>
            </span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Assigned: <strong className="text-white">{formattedDate}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span>{problem.domain.icon || '📁'}</span>
            <span>Domain: <strong className="text-white">{problem.domain.name}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Single Assignment Lock: <strong className="text-emerald-400">Active</strong></span>
          </div>
        </div>
      </div>

      {/* Grid: Problem Full Details + Participant Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Complete Challenge Specifications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Problem Statement Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-6">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 mb-2 flex items-center gap-2">
                <span>Problem Statement Description</span>
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                {problem.description}
              </p>
            </div>

            {problem.detailed_requirements && (
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 mb-2 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  <span>Detailed Requirements & Constraints</span>
                </h3>
                <div className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-5 rounded-2xl border border-slate-800 whitespace-pre-line">
                  {problem.detailed_requirements}
                </div>
              </div>
            )}

            {problem.expected_outcome && (
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>Expected Outcome & Prototype Deliverables</span>
                </h3>
                <div className="text-sm text-slate-200 leading-relaxed bg-emerald-950/15 p-5 rounded-2xl border border-emerald-900/30">
                  {problem.expected_outcome}
                </div>
              </div>
            )}

            {tagsArray.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Technology & Solution Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tagsArray.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Participant Credentials Card */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Assigned Participant Details</span>
            </h3>

            <div className="space-y-3.5 pt-2 text-xs">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Participant Name</p>
                  <p className="font-bold text-white text-sm">{participant.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">NIAT ID</p>
                  <p className="font-mono font-bold text-emerald-400 text-sm">
                    {participant.niat_id || participant.participant_id || user?.niat_id || user?.participant_id || 'NIAT001'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Email Address</p>
                  <p className="font-medium text-slate-300">{participant.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Participation Type</p>
                  <p className="font-bold text-indigo-300">Individual Participant</p>
                </div>
              </div>

              {participant.college && (
                <div className="flex items-start gap-3">
                  <Building className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">College / Institution</p>
                    <p className="font-medium text-slate-300">{participant.college}</p>
                  </div>
                </div>
              )}

              {participant.course && (
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Course & Year</p>
                    <p className="font-medium text-slate-300">
                      {participant.course} {participant.year ? `(${participant.year})` : ''}
                    </p>
                  </div>
                </div>
              )}

              {participant.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Contact Phone</p>
                    <p className="font-medium text-slate-300">{participant.phone}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              Selection lock is cryptographically stored in the relational database. This problem cannot be released, swapped, or selected by any other user.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
