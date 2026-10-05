import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Lock, ArrowRight, Award, Sparkles } from 'lucide-react';

export default function SelectionSuccessModal({ problem, onViewMyProblem }) {
  useEffect(() => {
    // Confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    } catch (e) {
      console.warn('Confetti error:', e);
    }
  }, []);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onViewMyProblem();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-emerald-500/40 bg-slate-900 p-8 shadow-2xl shadow-emerald-500/20 text-center animate-in zoom-in-95 duration-200">
        {/* Animated Celebration Icon */}
        <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px] shadow-xl shadow-emerald-500/30 mb-5 animate-bounce">
          <div className="w-full h-full bg-slate-950 rounded-[23px] flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 inline-block mb-2">
          🎉 SUCCESS!
        </span>

        <h2 className="text-2xl font-black text-white mb-2">
          Problem Statement Locked
        </h2>

        <p className="text-xs text-slate-300 mb-6 leading-relaxed max-w-sm mx-auto">
          Your challenge has been confirmed and atomically assigned. It is now permanently reserved exclusively for your account.
        </p>

        {/* Problem Card Summary */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left mb-6 shadow-inner">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="font-mono text-xs font-extrabold px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              {problem?.problem_code}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Lock className="w-3.5 h-3.5" />
              <span>🟢 LOCKED</span>
            </div>
          </div>

          <h4 className="text-base font-bold text-white mb-1 leading-snug">
            {problem?.title}
          </h4>

          <p className="text-xs text-slate-400">
            Domain: <span className="text-slate-200 font-semibold">{problem?.domain_name || problem?.domainCode}</span>
          </p>
        </div>

        <p className="text-[11px] text-slate-400 mb-6">
          This problem statement is no longer visible to other participants.
        </p>

        {/* View My Problem Button */}
        <button
          onClick={onViewMyProblem}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-sm font-extrabold shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <span>View My Problem</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
