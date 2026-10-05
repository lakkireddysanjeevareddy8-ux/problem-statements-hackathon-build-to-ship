import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Building,
  GraduationCap,
  Users,
  Phone,
  Lock,
  KeyRound,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function ProfilePage({ onNavigate }) {
  const { user, assignedProblem, token, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    college: user?.college || '',
    course: user?.course || '',
    year: user?.year || '',
    team_name: user?.team_name || '',
    participant_id: user?.participant_id || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  const [changingPass, setChangingPass] = useState(false);
  const [passMsg, setPassMsg] = useState(null);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
        refreshUser();
      } else {
        setProfileMsg({ type: 'error', text: data.message || 'Failed to update profile.' });
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: 'Error connecting to server.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPassMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setChangingPass(true);
    setPassMsg(null);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setPassMsg({ type: 'success', text: 'Password changed successfully.' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPassMsg({ type: 'error', text: data.message || 'Failed to change password.' });
      }
    } catch (err) {
      setPassMsg({ type: 'error', text: 'Error connecting to server.' });
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Profile Header */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-black uppercase shadow-lg shadow-indigo-500/20">
            {user?.name ? user.name.slice(0, 2) : 'US'}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{user?.name}</h1>
            <p className="text-xs text-slate-400 font-medium">{user?.email}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {user?.role}
              </span>
              {assignedProblem && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Locked: {assignedProblem.problem_code}
                </span>
              )}
            </div>
          </div>
        </div>

        {assignedProblem && (
          <button
            onClick={() => onNavigate('my-problem')}
            className="px-4 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            View Selected Problem →
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Information Form */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            <span>Participant Information</span>
          </h2>

          {profileMsg && (
            <div className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${profileMsg.type === 'success' ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300' : 'bg-rose-950/60 border border-rose-500/30 text-rose-300'}`}>
              {profileMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Email (Locked)</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Team Name</label>
              <input
                type="text"
                placeholder="e.g. AlgoWarriors"
                value={formData.team_name}
                onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">College / University</label>
              <input
                type="text"
                placeholder="e.g. Stanford University"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Course / Major</label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech CS"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Graduation Year</label>
                <input
                  type="text"
                  placeholder="e.g. 2026"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+1-555-0199"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingProfile ? 'Saving Changes...' : 'Save Profile Details'}</span>
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl h-fit">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-purple-400" />
            <span>Change Account Password</span>
          </h2>

          {passMsg && (
            <div className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${passMsg.type === 'success' ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300' : 'bg-rose-950/60 border border-rose-500/30 text-rose-300'}`}>
              {passMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{passMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={changingPass}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{changingPass ? 'Updating...' : 'Update Password'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
