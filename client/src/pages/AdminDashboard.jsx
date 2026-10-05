import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Users,
  Layers,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Download,
  Search,
  Plus,
  Edit,
  Trash2,
  Power,
  RefreshCw,
  Clock,
  ShieldAlert,
  FileText,
  Activity,
  Calendar,
  X,
  Printer,
  ChevronRight,
  TrendingUp,
  Sliders,
  RotateCcw
} from 'lucide-react';

export default function AdminDashboard({ onNavigate }) {
  const { token, user } = useAuth();
  const { broadcastProblemUpdated, subscribeToProblems } = useSocket();

  const [activeTab, setActiveTab] = useState('overview'); // overview, problems, participants, assignments, import, export, settings, logs
  const [loading, setLoading] = useState(true);

  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [problems, setProblems] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [domains, setDomains] = useState([]);

  // Filters & Search
  const [problemSearch, setProblemSearch] = useState('');
  const [problemStatusFilter, setProblemStatusFilter] = useState('ALL');
  const [problemDomainFilter, setProblemDomainFilter] = useState('ALL');

  const [participantSearch, setParticipantSearch] = useState('');
  const [participantStatusFilter, setParticipantStatusFilter] = useState('ALL');

  // Modals
  const [problemModalOpen, setProblemModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [resetModalData, setResetModalData] = useState(null);
  const [resetReason, setResetReason] = useState('');
  const [resetting, setResetting] = useState(false);

  // New/Edit problem form
  const [problemForm, setProblemForm] = useState({
    problem_code: '',
    domain_id: 1,
    title: '',
    description: '',
    detailed_requirements: '',
    expected_outcome: '',
    difficulty: 'Medium',
    tags: ''
  });

  // Settings form
  const [settingsForm, setSettingsForm] = useState({
    selection_status: 'OPEN',
    selection_start_time: '',
    selection_end_time: '',
    hackathon_title: 'HACKATHON 2026'
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // CSV Import State
  const [csvFile, setCsvFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Action status message
  const [statusAlert, setStatusAlert] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDashboardData(data);
        setSettingsForm({
          selection_status: data.settings.selection_status || 'OPEN',
          selection_start_time: data.settings.selection_start_time || '',
          selection_end_time: data.settings.selection_end_time || '',
          hackathon_title: 'HACKATHON 2026'
        });
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    }
  };

  const fetchProblems = async () => {
    try {
      let url = '/api/admin/problems?';
      if (problemStatusFilter !== 'ALL') url += `status=${problemStatusFilter}&`;
      if (problemDomainFilter !== 'ALL') url += `domain=${problemDomainFilter}&`;
      if (problemSearch.trim()) url += `search=${encodeURIComponent(problemSearch.trim())}&`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProblems(data.problems);
      }
    } catch (err) {
      console.error('Failed to fetch admin problems:', err);
    }
  };

  const fetchParticipants = async () => {
    try {
      let url = '/api/admin/participants?';
      if (participantStatusFilter !== 'ALL') url += `status=${participantStatusFilter}&`;
      if (participantSearch.trim()) url += `search=${encodeURIComponent(participantSearch.trim())}&`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setParticipants(data.participants);
      }
    } catch (err) {
      console.error('Failed to fetch participants:', err);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/admin/assignments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAssignments(data.assignments);
      }
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs?limit=50', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAuditLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    }
  };

  const fetchDomains = async () => {
    try {
      const res = await fetch('/api/problems/domains');
      const data = await res.json();
      if (data.success) {
        setDomains(data.domains);
      }
    } catch (err) {
      console.error('Failed to fetch domains:', err);
    }
  };

  useEffect(() => {
    if (token) {
      setLoading(true);
      Promise.all([
        fetchDashboard(),
        fetchProblems(),
        fetchParticipants(),
        fetchAssignments(),
        fetchDomains(),
        fetchAuditLogs()
      ]).finally(() => setLoading(false));
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'problems') fetchProblems();
    if (activeTab === 'participants') fetchParticipants();
    if (activeTab === 'assignments') fetchAssignments();
    if (activeTab === 'logs') fetchAuditLogs();
  }, [activeTab, problemStatusFilter, problemDomainFilter, participantStatusFilter]);

  // Real-time synchronization for Admin Dashboard (Section 12)
  useEffect(() => {
    if (!subscribeToProblems) return;

    const unsubscribe = subscribeToProblems((event, data) => {
      if (!data) return;

      if (event === 'problem_locked' || event === 'problem_assigned') {
        // Immediately update problem state
        setProblems((prev) =>
          prev.map((p) =>
            p.id === data.problemId || p.problem_code === data.problemCode
              ? { ...p, status: 'ASSIGNED' }
              : p
          )
        );

        // Fetch fresh stats from the database (Section 12: Assigned +1, Available -1)
        fetchDashboard();
        fetchAssignments();
        fetchParticipants();
      } else if (event === 'problem_unlocked' || event === 'problem_updated') {
        setProblems((prev) =>
          prev.map((p) =>
            p.id === data.problemId || p.problem_code === data.problemCode
              ? { ...p, status: data.status || 'AVAILABLE' }
              : p
          )
        );
        fetchDashboard();
        fetchAssignments();
        fetchParticipants();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribeToProblems]);

  const showAlert = (msg, type = 'success') => {
    setStatusAlert({ msg, type });
    setTimeout(() => setStatusAlert(null), 5000);
  };

  // Toggle problem availability status
  const handleToggleStatus = async (problemId) => {
    try {
      const res = await fetch(`/api/admin/problems/${problemId}/toggle-status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showAlert(data.message, 'success');
        fetchProblems();
        fetchDashboard();
      } else {
        showAlert(data.message, 'error');
      }
    } catch (err) {
      showAlert('Failed to update status', 'error');
    }
  };

  // Delete problem
  const handleDeleteProblem = async (problemId, code) => {
    if (!window.confirm(`Are you sure you want to permanently delete problem ${code}?`)) return;

    try {
      const res = await fetch(`/api/admin/problems/${problemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showAlert(data.message, 'success');
        fetchProblems();
        fetchDashboard();
      } else {
        showAlert(data.message, 'error');
      }
    } catch (err) {
      showAlert('Failed to delete problem', 'error');
    }
  };

  // Save new / edit problem
  const handleProblemFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingProblem ? `/api/admin/problems/${editingProblem.id}` : '/api/admin/problems';
      const method = editingProblem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(problemForm)
      });
      const data = await res.json();
      if (data.success) {
        showAlert(data.message, 'success');
        setProblemModalOpen(false);
        setEditingProblem(null);
        fetchProblems();
        fetchDashboard();
      } else {
        showAlert(data.message, 'error');
      }
    } catch (err) {
      showAlert('Failed to save problem', 'error');
    }
  };

  // Open edit modal
  const handleEditClick = (p) => {
    setEditingProblem(p);
    let tagsStr = '';
    try {
      const parsed = typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags;
      tagsStr = Array.isArray(parsed) ? parsed.join(', ') : '';
    } catch (e) {
      tagsStr = p.tags || '';
    }

    setProblemForm({
      problem_code: p.problem_code,
      domain_id: p.domain_id,
      title: p.title,
      description: p.description,
      detailed_requirements: p.detailed_requirements || '',
      expected_outcome: p.expected_outcome || '',
      difficulty: p.difficulty || 'Medium',
      tags: tagsStr
    });
    setProblemModalOpen(true);
  };

  // Open Create Modal
  const handleCreateClick = () => {
    setEditingProblem(null);
    setProblemForm({
      problem_code: '',
      domain_id: domains[0]?.id || 1,
      title: '',
      description: '',
      detailed_requirements: '',
      expected_outcome: '',
      difficulty: 'Medium',
      tags: ''
    });
    setProblemModalOpen(true);
  };

  // Handle Administrative Reset (Section 30)
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetReason.trim()) return;

    setResetting(true);
    try {
      const res = await fetch(`/api/admin/reset-assignment/${resetModalData.assignment_id || resetModalData.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: resetReason })
      });
      const data = await res.json();
      if (data.success) {
        showAlert(data.message, 'success');
        setResetModalData(null);
        setResetReason('');
        fetchDashboard();
        fetchProblems();
        fetchParticipants();
        fetchAssignments();
      } else {
        showAlert(data.message, 'error');
      }
    } catch (err) {
      showAlert('Failed to reset assignment', 'error');
    } finally {
      setResetting(false);
    }
  };

  // Save Settings
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settingsForm)
      });
      const data = await res.json();
      if (data.success) {
        setSettingsSuccess(true);
        showAlert('Hackathon settings updated & broadcast.', 'success');
        fetchDashboard();
      } else {
        showAlert(data.message, 'error');
      }
    } catch (err) {
      showAlert('Failed to update settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // Handle CSV Import
  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) return;

    setImporting(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setImportResult(data);
        showAlert(data.message, 'success');
        fetchDashboard();
        fetchProblems();
      } else {
        showAlert(data.message, 'error');
      }
    } catch (err) {
      showAlert('Failed to upload and import CSV', 'error');
    } finally {
      setImporting(false);
    }
  };

  // Handle Export CSV
  const handleExportCsv = () => {
    window.open(`/api/admin/export`, '_blank');
  };

  const stats = dashboardData?.stats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Alert Banner */}
      {statusAlert && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xl ${
            statusAlert.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/80 border border-rose-500/40 text-rose-200'
          }`}
        >
          <span>{statusAlert.msg}</span>
          <button onClick={() => setStatusAlert(null)} className="p-1 hover:bg-white/10 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Admin Header with Hackathon Selection Toggle */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-purple-500/30 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
              Admin & Organizer Command Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Hackathon Allocation Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time monitoring, participant allocation logs, and master problem statement control.
          </p>
        </div>

        {/* Live Selection Mode Pill & Quick Toggle */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Selection Mode</span>
              <span
                className={`text-xs font-black uppercase ${
                  settingsForm.selection_status === 'OPEN' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {settingsForm.selection_status === 'OPEN' ? '🟢 OPEN (Active)' : '🔴 CLOSED'}
              </span>
            </div>
            <button
              onClick={() => {
                const newStatus = settingsForm.selection_status === 'OPEN' ? 'CLOSED' : 'OPEN';
                setSettingsForm({ ...settingsForm, selection_status: newStatus });
                fetch('/api/admin/settings', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ selection_status: newStatus })
                })
                  .then((res) => res.json())
                  .then((d) => {
                    showAlert(`Hackathon selection is now ${newStatus}.`, 'success');
                    fetchDashboard();
                  });
              }}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                settingsForm.selection_status === 'OPEN'
                  ? 'bg-rose-950/50 border-rose-800/60 text-rose-300 hover:bg-rose-900/60'
                  : 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60'
              }`}
            >
              <Power className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={fetchDashboard}
            title="Refresh Metrics"
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <p className="text-[11px] text-slate-400 uppercase font-bold">Total Problems</p>
          <p className="text-2xl font-black text-white mt-1">{stats?.total_problems ?? 160}</p>
          <span className="text-[10px] text-slate-500 font-medium">Database records</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <p className="text-[11px] text-emerald-400 uppercase font-bold">Available</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{stats?.available_problems ?? 0}</p>
          <span className="text-[10px] text-slate-500 font-medium">Ready to claim</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <p className="text-[11px] text-amber-400 uppercase font-bold">Selected</p>
          <p className="text-2xl font-black text-amber-400 mt-1">{stats?.selected_problems ?? 0}</p>
          <span className="text-[10px] text-slate-500 font-medium">Locked to participants</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <p className="text-[11px] text-indigo-400 uppercase font-bold">Participants</p>
          <p className="text-2xl font-black text-indigo-400 mt-1">{stats?.total_participants ?? 0}</p>
          <span className="text-[10px] text-slate-500 font-medium">Registered accounts</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <p className="text-[11px] text-cyan-400 uppercase font-bold">Selection %</p>
          <p className="text-2xl font-black text-cyan-400 mt-1">{stats?.selection_percentage ?? 0}%</p>
          <span className="text-[10px] text-slate-500 font-medium">Capacity filled</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <p className="text-[11px] text-purple-400 uppercase font-bold">Domains</p>
          <p className="text-2xl font-black text-purple-400 mt-1">{stats?.number_of_domains ?? 16}</p>
          <span className="text-[10px] text-slate-500 font-medium">Track categories</span>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Overview & Charts', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'problems', label: `Problem Statements (${problems.length})`, icon: <Layers className="w-4 h-4" /> },
          { id: 'participants', label: `Participants (${participants.length})`, icon: <Users className="w-4 h-4" /> },
          { id: 'assignments', label: `Locked Assignments (${assignments.length})`, icon: <Lock className="w-4 h-4" /> },
          { id: 'import', label: 'Bulk Import (CSV)', icon: <Upload className="w-4 h-4" /> },
          { id: 'export', label: 'Export Data', icon: <Download className="w-4 h-4" /> },
          { id: 'settings', label: 'Hackathon Schedule', icon: <Sliders className="w-4 h-4" /> },
          { id: 'logs', label: 'Audit Logs', icon: <Activity className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & CHARTS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart: Problems By Domain */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
                <span>Problem Allocation by Domain</span>
                <span className="text-xs text-slate-400 font-normal">Available vs Selected</span>
              </h3>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                {dashboardData?.charts?.problems_by_domain?.map((d) => {
                  const total = d.total || 10;
                  const selected = d.selected || 0;
                  const available = d.available || 0;
                  const selectedPct = total > 0 ? (selected / total) * 100 : 0;

                  return (
                    <div key={d.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-white flex items-center gap-1.5 truncate max-w-[200px]">
                          <span>{d.icon}</span>
                          <span>{d.name}</span>
                        </span>
                        <div className="flex items-center gap-3 text-[11px] font-mono">
                          <span className="text-emerald-400">{available} avail</span>
                          <span className="text-amber-400">{selected} locked</span>
                          <span className="text-slate-400 font-bold">{total} total</span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                        <div
                          style={{ width: `${selectedPct}%` }}
                          className="h-full bg-amber-500 transition-all duration-500"
                        ></div>
                        <div
                          style={{ width: `${100 - selectedPct}%` }}
                          className="h-full bg-emerald-500 transition-all duration-500"
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Recent Audit Activities */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
                  <span>Live System Audit Stream</span>
                  <span className="text-xs text-indigo-400 font-medium">Real-Time Telemetry</span>
                </h3>

                <div className="space-y-2.5">
                  {dashboardData?.recent_activity?.slice(0, 7).map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                            {act.action}
                          </span>
                          <span className="text-slate-300 font-semibold">{act.user_name || 'System / Guest'}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 truncate max-w-sm">
                          {act.details || act.resource_type}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                        {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Protected administrative audit trail</span>
                <button
                  onClick={() => setActiveTab('logs')}
                  className="text-purple-400 font-bold hover:underline"
                >
                  View Full Audit Log →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROBLEM STATEMENTS MANAGEMENT */}
      {activeTab === 'problems' && (
        <div className="space-y-6">
          {/* Action & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter by title, code, or assignee..."
                  value={problemSearch}
                  onChange={(e) => setProblemSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchProblems()}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={problemStatusFilter}
                onChange={(e) => setProblemStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="AVAILABLE">AVAILABLE Only</option>
                <option value="ASSIGNED">ASSIGNED (Locked) Only</option>
                <option value="DISABLED">DISABLED Only</option>
              </select>

              {/* Domain Filter */}
              <select
                value={problemDomainFilter}
                onChange={(e) => setProblemDomainFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer max-w-[160px]"
              >
                <option value="ALL">All Domains</option>
                {domains.map((d) => (
                  <option key={d.id} value={d.code}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCreateClick}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Problem</span>
            </button>
          </div>

          {/* Problems Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Domain</th>
                  <th className="py-3.5 px-4">Problem Title</th>
                  <th className="py-3.5 px-4">Difficulty</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Locked By / Assignee</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {problems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No problem statements found matching current filters.
                    </td>
                  </tr>
                ) : (
                  problems.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                        {p.problem_code}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <span>{p.domain_icon || '📁'}</span>
                          <span className="truncate max-w-[120px]">{p.domain_name}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-white max-w-xs truncate" title={p.title}>
                        {p.title}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            p.difficulty === 'Easy'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : p.difficulty === 'Hard'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {p.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                            p.status === 'AVAILABLE'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : p.status === 'ASSIGNED'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {p.selected_by_name ? (
                          <div>
                            <span className="font-bold text-white block">{p.selected_by_name}</span>
                            <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                              {p.selected_by_email}
                            </span>
                            {(p.selected_by_niat || p.selected_by_participant_id) && (
                              <span className="text-[10px] text-indigo-400 font-mono font-semibold block">
                                NIAT: {p.selected_by_niat || p.selected_by_participant_id}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.status === 'ASSIGNED' && (
                            <button
                              onClick={() => setResetModalData(p)}
                              title="Reset Assignment (Admin Override)"
                              className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-950/40 border border-amber-800/40 transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleToggleStatus(p.id)}
                            title={p.status === 'AVAILABLE' ? 'Disable' : 'Enable'}
                            disabled={p.status === 'ASSIGNED'}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleEditClick(p)}
                            title="Edit Problem"
                            className="p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-950/40 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteProblem(p.id, p.problem_code)}
                            title="Delete Problem"
                            disabled={p.status === 'ASSIGNED'}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 disabled:opacity-30 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PARTICIPANTS TABLE */}
      {activeTab === 'participants' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search participants by name, NIAT ID, email, or college..."
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchParticipants()}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <select
                value={participantStatusFilter}
                onChange={(e) => setParticipantStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="ALL">All Participants</option>
                <option value="LOCKED">Problem Locked Only</option>
                <option value="UNASSIGNED">Unassigned Only</option>
              </select>
            </div>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Participants CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Participant Name</th>
                  <th className="py-3.5 px-4">NIAT ID</th>
                  <th className="py-3.5 px-4">Email & Phone</th>
                  <th className="py-3.5 px-4">College</th>
                  <th className="py-3.5 px-4">Assigned Problem</th>
                  <th className="py-3.5 px-4">Selection Time</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {participants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No participants found.
                    </td>
                  </tr>
                ) : (
                  participants.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">
                        {u.name}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                        {u.niat_id || u.participant_id || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-200 block">{u.email}</span>
                        {u.phone && <span className="text-[10px] text-slate-500 block">{u.phone}</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-[150px] truncate" title={u.college}>
                        {u.college || '—'}
                      </td>
                      <td className="py-3 px-4">
                        {u.problem_code ? (
                          <div>
                            <span className="font-mono text-xs font-bold text-amber-400 mr-1.5">
                              {u.problem_code}
                            </span>
                            <span className="text-[11px] text-slate-300 truncate max-w-[150px] inline-block align-bottom" title={u.problem_title}>
                              {u.problem_title}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px] font-mono">
                        {u.selected_at ? new Date(u.selected_at).toLocaleString() : '—'}
                      </td>
                      <td className="py-3 px-4">
                        {u.assignment_id ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            🟢 LOCKED
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                            UNASSIGNED
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: LOCKED ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">
              All Assigned Hackathon Problem Statements ({assignments.length})
            </h2>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Master Assignments CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Problem Code</th>
                  <th className="py-3.5 px-4">Challenge Title</th>
                  <th className="py-3.5 px-4">Domain</th>
                  <th className="py-3.5 px-4">Assigned Participant</th>
                  <th className="py-3.5 px-4">NIAT ID</th>
                  <th className="py-3.5 px-4">Selection Timestamp</th>
                  <th className="py-3.5 px-4 text-right">Reset Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No assignments have been locked yet.
                    </td>
                  </tr>
                ) : (
                  assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                        {a.problem_code}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white max-w-xs truncate" title={a.problem_title}>
                        {a.problem_title}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {a.domain_icon} {a.domain_name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{a.participant_name}</span>
                        <span className="text-[10px] text-slate-400 block">{a.participant_email}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                        {a.niat_id || a.participant_id || '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {new Date(a.selected_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setResetModalData({ ...a, assignment_id: a.id })}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Reset Assignment
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: BULK IMPORT (CSV) */}
      {activeTab === 'import' && (
        <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 mx-auto flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-white">Bulk Import Problem Statements</h2>
            <p className="text-xs text-slate-400 mt-1">Upload a CSV file containing hackathon problem statements</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
            <p className="font-bold text-white">Required CSV Columns:</p>
            <p className="font-mono text-purple-300 text-[11px]">
              problem_code, domain, title, description, difficulty, tags
            </p>
            <p className="text-[11px] text-slate-400">
              Duplicates by <code className="text-indigo-300 font-mono">problem_code</code> will be safely skipped.
            </p>
          </div>

          <form onSubmit={handleImportSubmit} className="space-y-4">
            <div className="p-8 rounded-2xl border-2 border-dashed border-slate-700 hover:border-purple-500/50 transition-colors text-center bg-slate-950/40">
              <input
                type="file"
                accept=".csv"
                id="csvUpload"
                onChange={(e) => setCsvFile(e.target.files[0] || null)}
                className="hidden"
              />
              <label htmlFor="csvUpload" className="cursor-pointer block">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <span className="text-xs font-bold text-white block">
                  {csvFile ? csvFile.name : 'Click to select CSV file from your computer'}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">Max size: 5MB</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!csvFile || importing}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              {importing ? 'Validating and Importing...' : 'Upload & Process CSV'}
            </button>
          </form>

          {importResult && (
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs space-y-2 animate-in fade-in">
              <p className="font-bold text-emerald-300">{importResult.message}</p>
              <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                <div className="p-2 bg-slate-950 rounded-lg">
                  <span className="text-slate-400 text-[10px] block">Imported</span>
                  <span className="font-bold text-emerald-400 text-sm">{importResult.stats.valid_records}</span>
                </div>
                <div className="p-2 bg-slate-950 rounded-lg">
                  <span className="text-slate-400 text-[10px] block">Duplicates</span>
                  <span className="font-bold text-amber-400 text-sm">{importResult.stats.duplicate_records}</span>
                </div>
                <div className="p-2 bg-slate-950 rounded-lg">
                  <span className="text-slate-400 text-[10px] block">Invalid</span>
                  <span className="font-bold text-rose-400 text-sm">{importResult.stats.invalid_records}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: EXPORT DATA */}
      {activeTab === 'export' && (
        <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Export Hackathon Allocation Records</h2>
            <p className="text-xs text-slate-400 mt-1">Download comprehensive CSV reports or print executive summaries</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 text-left space-y-2">
            <p className="font-bold text-white">Export CSV Format Specifications:</p>
            <p className="text-[11px] text-slate-400">
              Columns included: Participant Name, NIAT ID, Email, Phone, College, Course, Year, Problem ID, Problem Title, Domain, Selection Timestamp.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Master CSV File</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Executive Summary</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 7: HACKATHON SCHEDULE & SELECTION SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-xl mx-auto p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-6">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-400" />
              <span>Hackathon Selection Window Settings</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure master selection status and optional automatic start and end timers.
            </p>
          </div>

          <form onSubmit={handleSettingsSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Master Selection Status</label>
              <select
                value={settingsForm.selection_status}
                onChange={(e) => setSettingsForm({ ...settingsForm, selection_status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500 font-bold"
              >
                <option value="OPEN">🟢 OPEN — Participants can select problems</option>
                <option value="CLOSED">🔴 CLOSED — Selection is locked and disabled</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Selection Window Opening Time (Optional)</label>
              <input
                type="datetime-local"
                value={settingsForm.selection_start_time}
                onChange={(e) => setSettingsForm({ ...settingsForm, selection_start_time: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Leave empty to open immediately.</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Selection Window Closing Time (Optional)</label>
              <input
                type="datetime-local"
                value={settingsForm.selection_end_time}
                onChange={(e) => setSettingsForm({ ...settingsForm, selection_end_time: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Leave empty for no automatic expiration.</span>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="w-full mt-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              {savingSettings ? 'Saving Settings...' : 'Save & Broadcast Schedule Settings'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 8: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Full System Audit Trail ({auditLogs.length} Events)</span>
            </h2>
            <button
              onClick={fetchAuditLogs}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white"
            >
              Refresh Logs
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-indigo-400">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-4 text-slate-200">
                      {log.user_name || log.user_email || 'System'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">
                      {log.resource_type} {log.resource_id ? `#${log.resource_id}` : ''}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">
                      {log.ip_address}
                    </td>
                    <td className="py-2.5 px-4 text-slate-300 max-w-xs truncate" title={log.details}>
                      {log.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PROBLEM */}
      {problemModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setProblemModalOpen(false);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editingProblem ? `Edit Problem (${editingProblem.problem_code})` : 'Create New Problem Statement'}
              </h3>
              <button onClick={() => setProblemModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProblemFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Problem Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. AG-011 or SA11"
                    disabled={!!editingProblem}
                    value={problemForm.problem_code}
                    onChange={(e) => setProblemForm({ ...problemForm, problem_code: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white disabled:opacity-50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Domain *</label>
                  <select
                    value={problemForm.domain_id}
                    onChange={(e) => setProblemForm({ ...problemForm, domain_id: parseInt(e.target.value, 10) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    {domains.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Title *</label>
                <input
                  type="text"
                  placeholder="Problem Title"
                  value={problemForm.title}
                  onChange={(e) => setProblemForm({ ...problemForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description *</label>
                <textarea
                  rows={3}
                  placeholder="Context and background..."
                  value={problemForm.description}
                  onChange={(e) => setProblemForm({ ...problemForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Detailed Requirements</label>
                <textarea
                  rows={3}
                  placeholder="1. Requirements list..."
                  value={problemForm.detailed_requirements}
                  onChange={(e) => setProblemForm({ ...problemForm, detailed_requirements: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Expected Outcome</label>
                <textarea
                  rows={2}
                  placeholder="Deliverable specifications..."
                  value={problemForm.expected_outcome}
                  onChange={(e) => setProblemForm({ ...problemForm, expected_outcome: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Difficulty</label>
                  <select
                    value={problemForm.difficulty}
                    onChange={(e) => setProblemForm({ ...problemForm, difficulty: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="AI, IoT, Mobile"
                    value={problemForm.tags}
                    onChange={(e) => setProblemForm({ ...problemForm, tags: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProblemModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  {editingProblem ? 'Update Problem' : 'Create Problem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET ASSIGNMENT WORKFLOW (Section 30) */}
      {resetModalData && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !resetting) {
              setResetModalData(null);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
        >
          <div className="relative w-full max-w-lg rounded-3xl border border-amber-500/40 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Protected Admin Workflow
                </span>
                <h3 className="text-lg font-bold text-white">
                  Reset Assignment for {resetModalData.problem_code}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              You are about to revoke the assignment from participant{' '}
              <strong className="text-white">{resetModalData.participant_name || resetModalData.selected_by_name}</strong>.
              This problem statement will be re-enabled and made available again for other participants.
            </p>

            <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Administrative Reason (Required for Audit Log) *</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Participant requested reallocation or problem reassignment..."
                  value={resetReason}
                  onChange={(e) => setResetReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  required
                  minLength={5}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalData(null)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetting || resetReason.trim().length < 5}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-extrabold transition-all disabled:opacity-50"
                >
                  {resetting ? 'Resetting...' : 'Confirm Reset & Reopen Problem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
