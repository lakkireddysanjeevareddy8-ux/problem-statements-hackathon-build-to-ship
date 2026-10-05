import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import ProblemCard from '../components/ProblemCard';
import ProblemDetailModal from '../components/ProblemDetailModal';
import ConfirmationModal from '../components/ConfirmationModal';
import SelectionSuccessModal from '../components/SelectionSuccessModal';
import {
  Search,
  Filter,
  Lock,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Radio,
  Check,
  ShieldAlert
} from 'lucide-react';

export default function ParticipantDashboard({
  onNavigate,
  initialDomainFilter,
  hackathonMeta
}) {
  const { user, assignedProblem, setAssignedProblemDirect, refreshUser } = useAuth();
  const { subscribeToProblems, connected, reconnectCount } = useSocket();

  const [problems, setProblems] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDomain, setSelectedDomain] = useState(initialDomainFilter || 'ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [selectedAvailability, setSelectedAvailability] = useState('ALL'); // ALL, AVAILABLE, LOCKED
  const [searchQuery, setSearchQuery] = useState('');

  // Conflict alert (Section 9)
  const [conflictNotification, setConflictNotification] = useState(null);

  // Modals state
  const [activeProblemDetail, setActiveProblemDetail] = useState(null);
  const [confirmingProblem, setConfirmingProblem] = useState(null);
  const [successProblem, setSuccessProblem] = useState(null);

  // Fetch all problems (including assigned/locked so real-time updates transition statuses smoothly)
  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      // 1. Fetch domains
      const dRes = await fetch('/api/problems/domains');
      const dData = await dRes.json();
      if (dData.success) {
        setDomains(dData.domains);
      }

      // 2. Fetch problems with include_all=true to receive full live assignment state
      const pRes = await fetch('/api/problems?include_all=true');
      const pData = await pRes.json();
      if (pData.success) {
        setProblems(pData.problems);
      }
    } catch (err) {
      console.error('Failed to fetch problems:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time Assignment Synchronization (Section 3, 4, 5, 6, 7)
  useEffect(() => {
    const unsubscribe = subscribeToProblems((event, data) => {
      if (!data) return;

      if (event === 'problem_locked' || event === 'problem_assigned') {
        setProblems((currentProblems) =>
          currentProblems.map((p) => {
            if (p.id === data.problemId || p.problem_code === data.problemCode) {
              return {
                ...p,
                status: 'ASSIGNED',
                assigned_user_id: data.assignedUserId
              };
            }
            return p;
          })
        );

        // Handle open problem detail modal if another participant locked it
        setActiveProblemDetail((current) => {
          if (current && (current.id === data.problemId || current.problem_code === data.problemCode)) {
            const isMe = data.assignedUserId && user?.id === data.assignedUserId;
            if (isMe) {
              return { ...current, status: 'ASSIGNED', assigned_user_id: data.assignedUserId };
            }
            // Another participant locked it! (Section 9)
            setConflictNotification(
              'Sorry, this problem was just selected by another participant. Please choose another problem.'
            );
            return null;
          }
          return current;
        });

        // Handle confirmation modal if someone else confirmed it in that split-second
        setConfirmingProblem((current) => {
          if (current && (current.id === data.problemId || current.problem_code === data.problemCode)) {
            const isMe = data.assignedUserId && user?.id === data.assignedUserId;
            if (!isMe) {
              setConflictNotification(
                'Sorry, this problem was just selected by another participant. Please choose another problem.'
              );
              return null;
            }
          }
          return current;
        });
      } else if (event === 'problem_unlocked' || event === 'problem_updated') {
        setProblems((currentProblems) =>
          currentProblems.map((p) => {
            if (p.id === data.problemId || p.problem_code === data.problemCode) {
              return {
                ...p,
                status: data.status || 'AVAILABLE',
                assigned_user_id: null
              };
            }
            return p;
          })
        );
      }
    });

    // Cleanup subscription on unmount (Section 6 & 21)
    return () => {
      unsubscribe();
    };
  }, [subscribeToProblems, user?.id]);

  // Reconciliation / Fallback polling every 25 seconds (Section 11)
  useEffect(() => {
    const timer = setInterval(() => {
      fetchData(true);
    }, 25000);
    return () => clearInterval(timer);
  }, [fetchData]);

  // Re-sync on socket reconnect (Section 11)
  useEffect(() => {
    if (reconnectCount > 0) {
      fetchData(true);
    }
  }, [reconnectCount, fetchData]);

  // Auto-dismiss conflict notification
  useEffect(() => {
    if (conflictNotification) {
      const timer = setTimeout(() => {
        setConflictNotification(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [conflictNotification]);

  // Derive live counts directly from current database-backed assignment state (Section 13)
  const totalCount = problems.length;
  const availableCount = problems.filter((p) => p.status === 'AVAILABLE').length;
  const assignedCount = problems.filter((p) => p.status === 'ASSIGNED').length;

  // Filtered problems list (Section 14)
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      // Domain filter
      if (selectedDomain !== 'ALL') {
        if (p.domain_code !== selectedDomain && p.domain_id !== Number(selectedDomain)) {
          return false;
        }
      }

      // Difficulty filter
      if (selectedDifficulty !== 'ALL' && p.difficulty !== selectedDifficulty) {
        return false;
      }

      // Availability status filter (Section 14: Available only, etc.)
      if (selectedAvailability === 'AVAILABLE' && p.status !== 'AVAILABLE') {
        return false;
      }
      if (selectedAvailability === 'LOCKED' && p.status !== 'ASSIGNED') {
        return false;
      }

      // Search query (keyword, title, code, tags)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = p.title?.toLowerCase().includes(q);
        const codeMatch = p.problem_code?.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);
        let tagMatch = false;
        try {
          const tags = typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags || []);
          tagMatch = tags.some((t) => t.toLowerCase().includes(q));
        } catch (e) {
          tagMatch = false;
        }

        if (!titleMatch && !codeMatch && !descMatch && !tagMatch) {
          return false;
        }
      }

      return true;
    });
  }, [problems, selectedDomain, selectedDifficulty, selectedAvailability, searchQuery]);

  // Selection initiation from ProblemDetailModal
  const handleInitiateSelect = (problem) => {
    setActiveProblemDetail(null);
    setConfirmingProblem(problem);
  };

  // Successful locking confirmation
  const handleConfirmSuccess = (problem, assignmentId) => {
    setConfirmingProblem(null);
    setSuccessProblem(problem);

    // Update auth context state immediately
    setAssignedProblemDirect({
      id: assignmentId,
      problem_id: problem.id,
      problem_code: problem.problem_code,
      title: problem.title,
      domain_name: problem.domain_name || problem.domainCode,
      selected_at: new Date().toISOString()
    });

    // Mark as ASSIGNED and owned by current user locally
    setProblems((prev) =>
      prev.map((p) =>
        p.id === problem.id ? { ...p, status: 'ASSIGNED', assigned_user_id: user?.id } : p
      )
    );
    refreshUser();
  };

  // Handle race condition loss in confirmation modal (Section 9)
  const handleConflictLoss = (problem) => {
    // Immediately mark as ASSIGNED locally
    setProblems((prev) =>
      prev.map((p) =>
        p.id === problem.id ? { ...p, status: 'ASSIGNED' } : p
      )
    );
    // Refetch to guarantee 100% database consistency
    fetchData(true);
  };

  const isSelectionOpen = hackathonMeta?.is_selection_open ?? true;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Real-time Conflict Alert Toast (Section 9) */}
      {conflictNotification && (
        <div className="fixed top-20 right-6 z-50 max-w-md p-4 rounded-2xl bg-rose-950/95 border border-rose-500/60 text-white shadow-2xl backdrop-blur-md flex items-start gap-3 animate-in slide-in-from-top-4 duration-200">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs leading-relaxed">
            <p className="font-bold text-rose-200 mb-0.5">Problem No Longer Available</p>
            <p className="text-rose-100">{conflictNotification}</p>
          </div>
          <button
            onClick={() => setConflictNotification(null)}
            className="text-rose-300 hover:text-white p-1 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Participant Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Participant Dashboard
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
              <span className="text-xs text-slate-400 font-medium">
                {user ? `Welcome, ${user.name}` : 'Welcome, Hacker'}
              </span>
              {/* Realtime Live Pulse Indicator */}
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live Sync</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {assignedProblem ? (
                <span className="flex items-center gap-2">
                  <span>🎯 Problem Assigned</span>
                </span>
              ) : (
                <span>Welcome, {user?.name || 'Participant'} 👋</span>
              )}
            </h1>
            {user?.niat_id && (
              <div className="mt-1 flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  NIAT ID: {user.niat_id}
                </span>
              </div>
            )}
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl font-medium">
              {assignedProblem ? (
                <span className="flex flex-col sm:flex-row sm:items-center gap-2 text-emerald-400">
                  <span className="font-mono font-bold text-white bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                    {assignedProblem.problem_code}
                  </span>
                  <span>{assignedProblem.title}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                    🔒 Permanently Locked
                  </span>
                </span>
              ) : (
                'Browse and select your hackathon challenge. Live availability updates automatically.'
              )}
            </p>
          </div>

          {/* Quick Status / Live Problem Counters (Section 13) */}
          {assignedProblem ? (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 backdrop-blur-md">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  🟢 LOCKED TO ACCOUNT
                </span>
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{assignedProblem.problem_code}</span>
                  <span className="text-slate-400 text-xs font-normal">| {assignedProblem.title}</span>
                </p>
                <button
                  onClick={() => onNavigate('my-problem')}
                  className="text-xs font-bold text-emerald-300 hover:text-emerald-200 underline mt-0.5 inline-flex items-center gap-1 cursor-pointer"
                >
                  View Full Challenge Specification →
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 sm:gap-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="text-center">
                <p className="text-[11px] text-slate-400 font-medium">Total</p>
                <p className="text-xl sm:text-2xl font-black text-white">{totalCount}</p>
              </div>
              <div className="w-[1px] h-8 bg-slate-800"></div>
              <div className="text-center">
                <p className="text-[11px] text-slate-400 font-medium">Available</p>
                <p className="text-xl sm:text-2xl font-black text-emerald-400">{availableCount}</p>
              </div>
              <div className="w-[1px] h-8 bg-slate-800"></div>
              <div className="text-center">
                <p className="text-[11px] text-slate-400 font-medium">Assigned</p>
                <p className="text-xl sm:text-2xl font-black text-rose-400">{assignedCount}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prominent Locked Notification if already locked */}
      {assignedProblem && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl shadow-emerald-950/20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-extrabold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {assignedProblem.problem_code}
                </span>
                <span className="text-xs font-extrabold text-emerald-400">
                  🔒 PROBLEM STATEMENT LOCKED
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                {assignedProblem.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                You have successfully selected this problem statement. Selection is locked and cannot be changed.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('my-problem')}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all shrink-0 cursor-pointer"
          >
            <span>My Problem Statement</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar & Filters Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problem statements by keyword, code, or tags..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Availability Status Filter (Section 14: Available only / Locked / All) */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 overflow-x-auto">
            {[
              { id: 'ALL', label: 'All Problems' },
              { id: 'AVAILABLE', label: `Available (${availableCount})` },
              { id: 'LOCKED', label: `Locked (${assignedCount})` }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedAvailability(st.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedAvailability === st.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 overflow-x-auto">
            {['ALL', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedDifficulty === diff
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {diff === 'ALL' ? 'All Difficulties' : diff}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDomain('ALL');
              setSelectedDifficulty('ALL');
              setSelectedAvailability('ALL');
              fetchData();
            }}
            title="Reset Filters"
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Domain Category Filter Carousel */}
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2 min-w-max">
            <button
              onClick={() => setSelectedDomain('ALL')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDomain === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Domains ({problems.length})</span>
            </button>

            {domains.map((d) => {
              // Calculate domain count dynamically from current problems state
              const domainProblems = problems.filter(
                (p) => p.domain_code === d.code || p.domain_id === d.id
              );
              const domainAvail = domainProblems.filter((p) => p.status === 'AVAILABLE').length;

              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDomain(d.code)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedDomain === d.code
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border-transparent'
                      : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span>{d.icon}</span>
                  <span>{d.name}</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/30 text-slate-400">
                    {domainAvail}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Problem Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse"></div>
          ))}
        </div>
      ) : filteredProblems.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-slate-800 bg-slate-900/40">
          <div className="w-16 h-16 rounded-3xl bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400 mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No Matching Problem Statements</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            {selectedAvailability === 'AVAILABLE'
              ? 'All problem statements matching this filter have been selected by participants.'
              : 'No problem statements match your active filters or search keyword.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDomain('ALL');
              setSelectedDifficulty('ALL');
              setSelectedAvailability('ALL');
              fetchData();
            }}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProblems.map((problem) => {
            const isMine = Boolean(
              (user && problem.assigned_user_id === user.id) ||
              (assignedProblem &&
                (assignedProblem.problem_id === problem.id ||
                  assignedProblem.problem_code === problem.problem_code))
            );

            return (
              <ProblemCard
                key={problem.id}
                problem={problem}
                isMine={isMine}
                onSelect={(p) => setActiveProblemDetail(p)}
                onNavigateToMyProblem={() => onNavigate('my-problem')}
              />
            );
          })}
        </div>
      )}

      {/* Problem Details Modal */}
      {activeProblemDetail && (
        <ProblemDetailModal
          problem={activeProblemDetail}
          onClose={() => setActiveProblemDetail(null)}
          onInitiateSelect={handleInitiateSelect}
          isSelectionOpen={isSelectionOpen}
        />
      )}

      {/* Confirmation Modal (Section 1, 8, 9) */}
      {confirmingProblem && (
        <ConfirmationModal
          problem={confirmingProblem}
          onCancel={() => setConfirmingProblem(null)}
          onConfirmSuccess={handleConfirmSuccess}
          onConflict={handleConflictLoss}
        />
      )}

      {/* Success Celebration Modal */}
      {successProblem && (
        <SelectionSuccessModal
          problem={successProblem}
          onViewMyProblem={() => {
            setSuccessProblem(null);
            onNavigate('my-problem');
          }}
        />
      )}
    </div>
  );
}
