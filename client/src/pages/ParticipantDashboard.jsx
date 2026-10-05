import React, { useState, useEffect } from 'react';
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
  RefreshCw
} from 'lucide-react';

export default function ParticipantDashboard({
  onNavigate,
  initialDomainFilter,
  hackathonMeta
}) {
  const { user, assignedProblem, setAssignedProblemDirect, refreshUser } = useAuth();
  const { lockedEvents } = useSocket();

  const [problems, setProblems] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState(initialDomainFilter || 'ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [activeProblemDetail, setActiveProblemDetail] = useState(null);
  const [confirmingProblem, setConfirmingProblem] = useState(null);
  const [successProblem, setSuccessProblem] = useState(null);

  // Fetch available problems and domains
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch domains
      const dRes = await fetch('/api/problems/domains');
      const dData = await dRes.json();
      if (dData.success) {
        setDomains(dData.domains);
      }

      // 2. Fetch available problems
      let url = '/api/problems?';
      if (selectedDomain && selectedDomain !== 'ALL') {
        url += `domain=${selectedDomain}&`;
      }
      if (selectedDifficulty && selectedDifficulty !== 'ALL') {
        url += `difficulty=${selectedDifficulty}&`;
      }
      if (searchQuery.trim()) {
        url += `search=${encodeURIComponent(searchQuery.trim())}&`;
      }

      const pRes = await fetch(url);
      const pData = await pRes.json();
      if (pData.success) {
        setProblems(pData.problems);
      }
    } catch (err) {
      console.error('Failed to fetch problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDomain, selectedDifficulty]);

  // When search query debounces or submits
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  // Real-time automatic removal of locked problems (Section 29)
  useEffect(() => {
    if (lockedEvents && lockedEvents.length > 0) {
      const latestLocked = lockedEvents[0];
      setProblems((currentProblems) =>
        currentProblems.filter((p) => p.id !== latestLocked.problemId && p.problem_code !== latestLocked.problemCode)
      );

      // If the user currently had that problem's detail modal open, close it with an alert
      if (activeProblemDetail && (activeProblemDetail.id === latestLocked.problemId || activeProblemDetail.problem_code === latestLocked.problemCode)) {
        setActiveProblemDetail(null);
        setConfirmingProblem(null);
      }
    }
  }, [lockedEvents]);

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

    // Remove from local list
    setProblems((prev) => prev.filter((p) => p.id !== problem.id));
    refreshUser();
  };

  const isSelectionOpen = hackathonMeta?.is_selection_open ?? true;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {assignedProblem ? 'Problem Locked Exclusively' : 'Choose Your Hackathon Challenge'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              {assignedProblem
                ? 'Your problem statement has been permanently assigned to your account.'
                : 'Browse available challenges, analyze requirements, and lock your chosen problem statement.'}
            </p>
          </div>

          {/* Quick Status / Locked Banner */}
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
            <div className="flex items-center gap-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="text-center">
                <p className="text-xs text-slate-400 font-medium">Available</p>
                <p className="text-2xl font-black text-emerald-400">{problems.length}</p>
              </div>
              <div className="w-[1px] h-8 bg-slate-800"></div>
              <div className="text-center">
                <p className="text-xs text-slate-400 font-medium">Domains</p>
                <p className="text-2xl font-black text-cyan-400">16</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prominent Locked Notification if already locked (Section 18) */}
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
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problem statements by keyword, code, or tags..."
              className="w-full pl-11 pr-24 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

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
              <span>All 16 Domains ({problems.length})</span>
            </button>

            {domains.map((d) => (
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
                  {d.available_problems ?? 0}
                </span>
              </button>
            ))}
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
      ) : problems.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-slate-800 bg-slate-900/40">
          <div className="w-16 h-16 rounded-3xl bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400 mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No Available Problems Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            All problem statements matching your search criteria have either been selected by other participants or do not match your filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDomain('ALL');
              setSelectedDifficulty('ALL');
              fetchData();
            }}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem) => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              onSelect={(p) => setActiveProblemDetail(p)}
            />
          ))}
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

      {/* Confirmation Modal (Section 1 & 11) */}
      {confirmingProblem && (
        <ConfirmationModal
          problem={confirmingProblem}
          onCancel={() => setConfirmingProblem(null)}
          onConfirmSuccess={handleConfirmSuccess}
        />
      )}

      {/* Success Celebration Modal (Section 34) */}
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
