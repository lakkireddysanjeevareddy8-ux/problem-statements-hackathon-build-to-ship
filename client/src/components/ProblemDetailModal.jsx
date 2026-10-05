import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ClipboardList,
  Target,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function ProblemDetailModal({
  problem,
  onClose,
  onInitiateSelect,
  isSelectionOpen
}) {
  const { user, assignedProblem } = useAuth();

  if (!problem) return null;

  let tagsArray = [];
  try {
    tagsArray = typeof problem.tags === 'string' ? JSON.parse(problem.tags) : (problem.tags || []);
  } catch (e) {
    tagsArray = [];
  }

  const difficultyColors = {
    Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Hard: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-start justify-between gap-4 bg-slate-950/40">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-xs font-extrabold px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                {problem.problem_code}
              </span>
              <span className="text-xs text-slate-300 font-semibold flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800/90">
                <span>{problem.domain_icon || '📁'}</span>
                <span>{problem.domain_name}</span>
              </span>
              <span className={`text-xs font-bold px-3 py-0.5 rounded-full border ${difficultyColors[problem.difficulty] || difficultyColors.Medium}`}>
                {problem.difficulty}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                AVAILABLE
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
              {problem.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Problem Statement Overview */}
          <div>
            <h4 className="text-xs font-bold tracking-wider uppercase text-indigo-400 mb-2 flex items-center gap-1.5">
              <span>Problem Statement Context</span>
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
              {problem.description}
            </p>
          </div>

          {/* Detailed Requirements */}
          {problem.detailed_requirements && (
            <div>
              <h4 className="text-xs font-bold tracking-wider uppercase text-indigo-400 mb-2 flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-indigo-400" />
                <span>Detailed Requirements & Guidelines</span>
              </h4>
              <div className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 whitespace-pre-line font-normal">
                {problem.detailed_requirements}
              </div>
            </div>
          )}

          {/* Expected Outcome */}
          {problem.expected_outcome && (
            <div>
              <h4 className="text-xs font-bold tracking-wider uppercase text-emerald-400 mb-2 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Expected Outcome & Deliverables</span>
              </h4>
              <div className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-emerald-900/20 bg-emerald-950/10">
                {problem.expected_outcome}
              </div>
            </div>
          )}

          {/* Tags */}
          {tagsArray.length > 0 && (
            <div>
              <h4 className="text-xs font-bold tracking-wider uppercase text-slate-400 mb-2">
                Tech & Domain Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {tagsArray.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Action Buttons */}
        <div className="p-6 border-t border-slate-800/80 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Selection is permanent and cannot be changed or released.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {!user ? (
              <button
                onClick={() => {
                  onClose();
                  window.location.hash = '#login';
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                Log In to Select Problem
              </button>
            ) : assignedProblem ? (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-bold text-slate-400">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>You already locked problem {assignedProblem.problem_code}</span>
              </div>
            ) : !isSelectionOpen ? (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs font-bold text-rose-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Selection is currently Closed</span>
              </div>
            ) : (
              <button
                onClick={() => onInitiateSelect(problem)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Select This Problem</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
