import React from 'react';
import {
  Code2,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Layers,
  Compass,
  CheckCircle,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage({ onNavigate, stats, domains }) {
  const { user, assignedProblem } = useAuth();

  const steps = [
    {
      step: '01',
      title: 'Register Profile',
      desc: 'Create your participant account and verify your college and team credentials.',
      icon: <Users className="w-5 h-5 text-indigo-400" />
    },
    {
      step: '02',
      title: 'Explore Challenges',
      desc: 'Browse across 16 specialized domains and 160 real-world problem statements.',
      icon: <Compass className="w-5 h-5 text-cyan-400" />
    },
    {
      step: '03',
      title: 'Select ONE Problem',
      desc: 'Carefully pick the challenge that best matches your team’s passion and technical skills.',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />
    },
    {
      step: '04',
      title: 'Lock Your Challenge',
      desc: 'Confirm your choice to atomically lock the problem statement to your account exclusively.',
      icon: <Lock className="w-5 h-5 text-emerald-400" />
    },
    {
      step: '05',
      title: 'Build Your Solution',
      desc: 'Harness your locked challenge specification and develop your hackathon prototype.',
      icon: <Zap className="w-5 h-5 text-purple-400" />
    }
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 text-center max-w-5xl mx-auto px-4">
        {/* Glow ambient background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-64 h-64 bg-cyan-500/15 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-xl text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
            <span>Official Hackathon 2026 Portal</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Choose Your Challenge.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400">
              Build Your Solution.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
            Welcome to the Hackathon 2026 Problem Statement Allocation Platform. Each challenge is unique and reserved for only one team. Once selected, your problem statement is permanently locked.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              assignedProblem ? (
                <button
                  onClick={() => onNavigate('my-problem')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-emerald-200" />
                  <span>View Your Locked Problem ({assignedProblem.problem_code})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('problems')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>Browse Available Problems</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )
            ) : (
              <>
                <button
                  onClick={() => onNavigate('register')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Register as Participant</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-extrabold text-sm transition-all cursor-pointer"
                >
                  <span>Participant Login</span>
                </button>
                <button
                  onClick={() => onNavigate('admin-login')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-purple-400 hover:text-purple-300 hover:bg-purple-950/30 text-xs font-bold transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Organizer Login</span>
                </button>
              </>
            )}
          </div>

          {/* Critical Rule Highlight Banner */}
          <div className="mt-12 p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/20 max-w-xl mx-auto backdrop-blur-md flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              <strong className="text-amber-300">Single Assignment Guarantee:</strong> Each problem statement can be selected by only one participant account. Once confirmed, it disappears for all other participants.
            </p>
          </div>
        </div>
      </section>

      {/* Live Statistics Counter Bar */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-2xl">
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Challenges</p>
            <p className="text-3xl sm:text-4xl font-black text-white">160</p>
            <p className="text-[10px] text-indigo-400 mt-1">Verified Specifications</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">Available</p>
            <p className="text-3xl sm:text-4xl font-black text-emerald-400">
              {stats?.available_problems ?? 160}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Ready for Selection</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">Selected</p>
            <p className="text-3xl sm:text-4xl font-black text-amber-400">
              {stats?.selected_problems ?? 0}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Locked by Teams</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">Tech Domains</p>
            <p className="text-3xl sm:text-4xl font-black text-cyan-400">16</p>
            <p className="text-[10px] text-slate-400 mt-1">Specialized Categories</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            Participant Guide
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-3 mb-4">
            How The Allocation System Works
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Follow the 5 simple steps to register, choose your challenge, and permanently lock it to your hackathon team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((st, i) => (
            <div
              key={i}
              className="relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between hover:border-indigo-500/30 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black tracking-widest text-slate-500 group-hover:text-indigo-400 transition-colors">
                    {st.step}
                  </span>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    {st.icon}
                  </div>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">
                  {st.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 16 Domains Preview */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              Domains
            </span>
            <h2 className="text-3xl font-black text-white mt-2">
              16 Innovation Tracks
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              10 curated problem statements per domain spanning real-world impact.
            </p>
          </div>

          <button
            onClick={() => onNavigate('problems')}
            className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
          >
            <span>Explore All 160 Problems</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3.5">
          {domains?.map((d) => (
            <div
              key={d.id}
              onClick={() => onNavigate('problems', { domainCode: d.code })}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-indigo-500/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-2xl group-hover:scale-110 transition-transform">{d.icon}</span>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                    {d.name}
                  </h4>
                  <span className="font-mono text-[10px] text-slate-400">{d.code} Series</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60">
                <span>{d.available_problems ?? 10} Available</span>
                <span className="text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ & Rules Section */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
            Rules & FAQs
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Can I change my problem statement after selecting?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed pl-6">
              No. To ensure absolute fairness and prevent hoarding, all selections are permanently locked to your participant account immediately upon confirmation.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              What happens if two participants click confirm at the exact same moment?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed pl-6">
              The platform utilizes database-level atomic transactions with strict unique constraints. Exactly one participant’s transaction will succeed; the other participant will instantly receive an alert that the problem has just been taken and can choose another.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Can other participants see which problem I selected?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed pl-6">
              No. For privacy, selected problems simply disappear from the available browse list for everyone else. Only administrators can view assignment records.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
