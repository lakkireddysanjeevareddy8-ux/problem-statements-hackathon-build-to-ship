import React, { useState, useEffect } from 'react';
import { AlertTriangle, Lock, Loader2, X, ShieldAlert } from 'lucide-react';

export default function ConfirmationModal({
  problem,
  onCancel,
  onConfirmSuccess,
  onConflict
}) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && !submitting) {
        onCancel();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [submitting, onCancel]);

  if (!problem) return null;

  const handleConfirm = async () => {
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const token = localStorage.getItem('hackathon_token');
      const res = await fetch(`/api/problems/${problem.id}/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onConfirmSuccess(data.problem, data.assignmentId);
      } else {
        const errorText = data.message || 'Sorry, this problem was just selected by another participant. Please choose another problem.';
        setErrorMsg(errorText);
        setSubmitting(false);
        if (onConflict) {
          onConflict(problem);
        }
      }
    } catch (err) {
      console.error('Selection request error:', err);
      setErrorMsg('Network error while locking problem statement. Please check your connection and try again.');
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) {
          onCancel();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-amber-500/40 bg-slate-900 p-6 sm:p-8 shadow-2xl shadow-amber-500/10 animate-in zoom-in-95 duration-150">
        {/* Warning Icon Badge */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400">
              ⚠️ Final Confirmation
            </span>
            <h3 className="text-xl font-extrabold text-white">
              Are you sure?
            </h3>
          </div>
        </div>

        {/* Problem Summary Box */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 mb-5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              {problem.problem_code}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {problem.domain_name}
            </span>
          </div>
          <p className="text-sm font-bold text-white leading-snug">
            {problem.title}
          </p>
        </div>

        {/* Warning Notice Text (Section 6) */}
        <div className="space-y-3 mb-6 text-xs text-slate-300 leading-relaxed bg-amber-950/20 border border-amber-900/30 p-4 rounded-xl">
          <p className="font-bold text-amber-200 text-sm">
            You can select only ONE problem statement.
          </p>
          <p className="text-slate-300">
            Once confirmed, your selection cannot be changed.
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
            <li>This problem statement will be permanently locked to your NIAT ID.</li>
            <li>It will immediately become unavailable to all other participants.</li>
          </ul>
        </div>

        {/* Error notification if conflict or failure */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {errorMsg ? (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Choose Another Problem
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={submitting}
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirm}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Locking Problem...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-slate-950" />
                    <span>Confirm Selection</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
