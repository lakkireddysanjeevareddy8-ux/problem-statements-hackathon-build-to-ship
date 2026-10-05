import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [assignedProblem, setAssignedProblem] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('hackathon_token') || null);
  const [loading, setLoading] = useState(true);

  // Load user profile and current assignment on mount
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          setAssignedProblem(data.assignedProblem || null);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Failed to load user session:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = (userData, userToken, assignment = null) => {
    setUser(userData);
    setToken(userToken);
    setAssignedProblem(assignment);
    localStorage.setItem('hackathon_token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAssignedProblem(null);
    localStorage.removeItem('hackathon_token');
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setAssignedProblem(data.assignedProblem || null);
      }
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  };

  const setAssignedProblemDirect = (problem) => {
    setAssignedProblem(problem);
  };

  const loginWithNiat = async (name, niatId) => {
    try {
      const res = await fetch('/api/participants/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, niatId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        login(data.user, data.token, data.assignedProblem);
        return { success: true, user: data.user, assignedProblem: data.assignedProblem };
      }
      return { success: false, message: data.message || 'Login failed.' };
    } catch (err) {
      return { success: false, message: 'Failed to connect to the server. Please try again.' };
    }
  };

  const loginAdmin = async (email) => {
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email ? email.trim().toLowerCase() : '' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        login(data.user, data.token, null);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'This email is not authorized for administrator access.' };
    } catch (err) {
      return { success: false, message: 'Failed to connect to the server. Please try again.' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      assignedProblem,
      token,
      loading,
      login,
      loginWithNiat,
      loginAdmin,
      logout,
      refreshUser,
      setAssignedProblemDirect,
      isAdmin: user?.role === 'ADMIN',
      hasLockedProblem: !!assignedProblem
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
