import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

import LandingPage from './pages/LandingPage';
import ParticipantDashboard from './pages/ParticipantDashboard';
import MyProblemStatement from './pages/MyProblemStatement';
import ProfilePage from './pages/ProfilePage';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function AppContent() {
  const { user, isAdmin, loading, refreshUser } = useAuth();
  const { subscribeToProblems } = useSocket();

  const getInitialView = () => {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    if (path === '/admin') return 'admin';
    if (path === '/admin-login') return 'admin-login';
    if (path === '/login') return 'login';
    if (path === '/problems') return 'problems';
    if (path === '/my-problem') return 'my-problem';
    if (path === '/register') return 'register';
    return 'landing';
  };

  const [currentView, setCurrentView] = useState(getInitialView);
  const [stats, setStats] = useState(null);
  const [domains, setDomains] = useState([]);
  const [initialDomainFilter, setInitialDomainFilter] = useState('ALL');
  const [hackathonMeta, setHackathonMeta] = useState(null);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(getInitialView());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch summary stats and domains helper
  const fetchGlobalData = () => {
    fetch('/api/problems/domains')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.domains) {
          setDomains(data.domains);
        }
      })
      .catch((err) => console.error(err));

    fetch('/api/problems')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.meta) {
          setHackathonMeta(data.meta);
          setStats({
            total_problems: data.meta.total ?? 160,
            available_problems: data.meta.available ?? 160,
            selected_problems: data.meta.assigned ?? 0
          });
        }
      })
      .catch((err) => console.error(err));
  };

  // Load summary stats and domains on startup & periodically
  useEffect(() => {
    fetchGlobalData();
    const interval = setInterval(fetchGlobalData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Real-time synchronization for landing dashboard counters and domain badges
  useEffect(() => {
    if (!subscribeToProblems) return;

    const unsubscribe = subscribeToProblems((event, data) => {
      if (!data) return;

      if (event === 'problem_locked' || event === 'problem_assigned') {
        // 1. Immediately update stats counter
        setStats((prev) => {
          const currentAvail = prev?.available_problems ?? 160;
          const currentSel = prev?.selected_problems ?? 0;
          return {
            total_problems: 160,
            available_problems: Math.max(0, currentAvail - 1),
            selected_problems: Math.min(160, currentSel + 1)
          };
        });

        // 2. Decrement available count in corresponding domain
        setDomains((prevDomains) =>
          prevDomains.map((d) => {
            const matches =
              (data.domainId && d.id === data.domainId) ||
              (data.domainCode && d.code === data.domainCode) ||
              (data.problemCode && d.code === data.problemCode.charAt(0));
            if (matches) {
              return {
                ...d,
                available_problems: Math.max(0, (d.available_problems ?? 10) - 1)
              };
            }
            return d;
          })
        );

        // 3. Refresh user session so account header and locked problem update live
        refreshUser();
      } else if (event === 'problem_unlocked' || event === 'problem_updated') {
        // 1. Immediately update stats counter
        setStats((prev) => {
          const currentAvail = prev?.available_problems ?? 160;
          const currentSel = prev?.selected_problems ?? 0;
          return {
            total_problems: 160,
            available_problems: Math.min(160, currentAvail + 1),
            selected_problems: Math.max(0, currentSel - 1)
          };
        });

        // 2. Increment available count in corresponding domain
        setDomains((prevDomains) =>
          prevDomains.map((d) => {
            const matches =
              (data.domainId && d.id === data.domainId) ||
              (data.domainCode && d.code === data.domainCode) ||
              (data.problemCode && d.code === data.problemCode.charAt(0));
            if (matches) {
              return {
                ...d,
                available_problems: Math.min(d.total_problems || 10, (d.available_problems ?? 0) + 1)
              };
            }
            return d;
          })
        );

        refreshUser();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribeToProblems, refreshUser]);

  const handleNavigate = (view, options = {}) => {
    if (options.domainCode) {
      setInitialDomainFilter(options.domainCode);
    }
    setCurrentView(view);
    const targetPath = view === 'landing' ? '/' : `/${view}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
          <span className="text-xs font-bold text-slate-400">Initializing Platform...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={handleNavigate}
        hackathonMeta={hackathonMeta}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onNavigate={handleNavigate}
            stats={stats}
            domains={domains}
          />
        )}

        {currentView === 'problems' && (
          <ParticipantDashboard
            onNavigate={handleNavigate}
            initialDomainFilter={initialDomainFilter}
            hackathonMeta={hackathonMeta}
          />
        )}

        {currentView === 'my-problem' && (
          <MyProblemStatement onNavigate={handleNavigate} />
        )}

        {currentView === 'profile' && (
          <ProfilePage onNavigate={handleNavigate} />
        )}

        {currentView === 'login' && (
          <Login onNavigate={handleNavigate} />
        )}

        {currentView === 'register' && (
          <Register onNavigate={handleNavigate} />
        )}

        {currentView === 'admin-login' && (
          <AdminLogin onNavigate={handleNavigate} />
        )}

        {currentView === 'admin' && (
          isAdmin ? (
            <AdminDashboard onNavigate={handleNavigate} />
          ) : (
            <div className="max-w-md mx-auto py-24 text-center px-4">
              <div className="p-8 rounded-3xl bg-slate-900 border border-rose-500/40">
                <h3 className="text-lg font-bold text-white mb-2">Access Restricted</h3>
                <p className="text-xs text-slate-400 mb-6">
                  You must be logged in as an administrator to view this console.
                </p>
                <button
                  onClick={() => setCurrentView('admin-login')}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
                >
                  Admin Login
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* Real-Time Toast Notifications */}
      <Toast />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-400 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">BUILD-TO-SHIP</span>
            <span>•</span>
            <span>Problem Statement Allocation Platform</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Atomic DB Locking Active</span>
            <span>•</span>
            <button
              onClick={() => setCurrentView('admin-login')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Organizer Access
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  );
}
