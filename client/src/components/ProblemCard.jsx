import React from 'react';
import { ArrowRight, Tag, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ProblemCard({ problem, onSelect }) {
  const difficultyColors = {
    Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Hard: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  let tagsArray = [];
  try {
    tagsArray = typeof problem.tags === 'string' ? JSON.parse(problem.tags) : (problem.tags || []);
  } catch (e) {
    tagsArray = [];
  }

  return (
    <div className="group relative rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between">
      {/* Top Header: Code, Domain & Difficulty */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              {problem.problem_code}
            </span>
            <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80">
              <span>{problem.domain_icon || '📁'}</span>
              <span className="truncate max-w-[130px]">{problem.domain_name}</span>
            </span>
          </div>

          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${difficultyColors[problem.difficulty] || difficultyColors.Medium}`}>
            {problem.difficulty}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug mb-2.5">
          {problem.title}
        </h3>

        {/* Description snippet */}
        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
          {problem.description}
        </p>

        {/* Tags */}
        {tagsArray.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {tagsArray.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800/60 text-slate-400 border border-slate-700/50"
              >
                #{tag}
              </span>
            ))}
            {tagsArray.length > 3 && (
              <span className="text-[10px] text-slate-400 px-1 py-0.5">
                +{tagsArray.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Footer: Status & Action Button */}
      <div className="pt-4 border-t border-slate-800/70 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>AVAILABLE</span>
        </div>

        <button
          onClick={() => onSelect(problem)}
          className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 transition-all group-hover:shadow-md group-hover:shadow-indigo-500/20 cursor-pointer"
        >
          <span>View Problem</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
