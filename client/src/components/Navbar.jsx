import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Code2,
  Lock,
  User,
  LogOut,
  ShieldAlert,
  ChevronDown,
  Layers,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, hackathonMeta }) {
  const { user, assignedProblem, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);

  // Close user dropdown pop-up when tapping/clicking anywhere outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setUserDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }

    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [userDropdownOpen]);

  const isSelectionOpen = hackathonMeta?.is_selection_open ?? true;

  return (
    <header className="sticky top-0 z-40 w-full glass-nav border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Hackathon Title */}
          <div
            onClick={() => setCurrentView('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Code2 className="w-5 h-5 text-indigo-400 group-hover:text-cyan-300 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-lg">
                  BUILD-TO-<span className="text-indigo-400">SHIP</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Allocation
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Challenge Selection Platform</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setCurrentView('landing')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentView === 'landing'
                  ? 'text-white bg-slate-800/80 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => setCurrentView('problems')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentView === 'problems'
                  ? 'text-white bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              Browse Problems
            </button>

            {user && (
              <button
                onClick={() => setCurrentView('my-problem')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  currentView === 'my-problem'
                    ? 'text-white bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                {assignedProblem ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <Lock className="w-4 h-4 text-emerald-400" />
                    My Problem ({assignedProblem.problem_code})
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    My Problem Statement
                  </>
                )}
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setCurrentView('admin')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  currentView === 'admin'
                    ? 'text-white bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-purple-500/20'
                    : 'text-purple-400 hover:text-purple-300 hover:bg-purple-950/40'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                Admin Console
              </button>
            )}
          </nav>

          {/* Right Status Badge & Auth Actions */}
          <div className="flex items-center gap-3">
            {/* Hackathon Status Live Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-slate-800 bg-slate-900/90">
              <span className={`w-2 h-2 rounded-full ${isSelectionOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
              <span className={isSelectionOpen ? 'text-emerald-400' : 'text-rose-400'}>
                {isSelectionOpen ? 'Selection OPEN' : 'Selection CLOSED'}
              </span>
            </div>

            {user ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800/80 transition-all text-left cursor-pointer"
                >
                  {user.profile_photo_url ? (
                    <img
                      src={user.profile_photo_url}
                      alt={user.name}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-700 shadow-sm"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
                      {user.name ? user.name.slice(0, 2) : 'US'}
                    </div>
                  )}
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-slate-200 truncate max-w-[120px]">{user.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {(user.niat_id || user.participant_id) ? (
                        <span className="font-mono text-indigo-400 font-semibold">{user.niat_id || user.participant_id}</span>
                      ) : assignedProblem ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Locked
                        </span>
                      ) : (
                        'No Selection'
                      )}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* User Dropdown / Account Menu (Section 23) */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-3 border-b border-slate-800 flex items-center gap-3">
                      {user.profile_photo_url ? (
                        <img
                          src={user.profile_photo_url}
                          alt={user.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold uppercase">
                          {user.name ? user.name.slice(0, 2) : 'US'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          {(user.niat_id || user.participant_id) && (
                            <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                              {user.niat_id || user.participant_id}
                            </span>
                          )}
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    {assignedProblem && (
                      <div className="m-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                        <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400 mb-0.5">
                          <span>SELECTED CHALLENGE</span>
                          <span>🔒 LOCKED</span>
                        </div>
                        <p className="text-xs font-bold text-white truncate">
                          {assignedProblem.problem_code} — {assignedProblem.title}
                        </p>
                      </div>
                    )}

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setCurrentView('my-problem');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
                      >
                        <Lock className="w-4 h-4 text-emerald-400" />
                        <span>My Problem</span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentView('profile');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Profile</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setCurrentView('admin');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-purple-400 hover:text-purple-300 hover:bg-purple-950/40 rounded-xl transition-colors cursor-pointer"
                        >
                          <ShieldAlert className="w-4 h-4 text-purple-400" />
                          <span>Admin Console</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          setCurrentView('landing');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => setCurrentView('register')}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 p-4 space-y-2 backdrop-blur-2xl">
          <button
            onClick={() => {
              setCurrentView('landing');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
          >
            Home
          </button>
          <button
            onClick={() => {
              setCurrentView('problems');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            Browse Problems
          </button>
          {user && (
            <button
              onClick={() => {
                setCurrentView('my-problem');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2"
            >
              <Lock className="w-4 h-4 text-emerald-400" />
              My Problem Statement
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => {
                setCurrentView('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-purple-300 hover:bg-purple-950/40 flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              Admin Console
            </button>
          )}
        </div>
      )}
    </header>
  );
}
