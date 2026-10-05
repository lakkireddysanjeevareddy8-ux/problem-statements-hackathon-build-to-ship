const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth.routes');
const participantsRoutes = require('./routes/participants.routes');
const problemsRoutes = require('./routes/problems.routes');
const profileRoutes = require('./routes/profile.routes');
const adminRoutes = require('./routes/admin.routes');
const { authenticateToken } = require('./middleware/auth');
const db = require('./db');

const app = express();

// Middlewares
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// GET /api/me - Returns current authenticated participant and assigned problem (Section 15)
app.get('/api/me', authenticateToken, (req, res) => {
  try {
    const assignedProblem = db.prepare(`
      SELECT a.id as assignment_id, a.selected_at, a.status as assignment_status,
             p.id as problem_id, p.problem_code, p.title, p.description, p.detailed_requirements,
             p.expected_outcome, p.difficulty, p.tags,
             d.name as domain_name, d.code as domain_code, d.icon as domain_icon
      FROM problem_assignments a
      JOIN problem_statements p ON a.problem_statement_id = p.id
      JOIN domains d ON p.domain_id = d.id
      WHERE a.user_id = ?
    `).get(req.user.id);

    return res.json({
      success: true,
      user: req.user,
      assignedProblem: assignedProblem || null
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
});

// Direct Shortcut for GET /api/my-problem (Section 14 & 28)
app.get('/api/my-problem', authenticateToken, (req, res) => {
  try {
    const assignment = db.prepare(`
      SELECT
        a.id as assignment_id,
        a.selected_at,
        a.status as assignment_status,
        p.id as problem_id,
        p.problem_code,
        p.title,
        p.description,
        p.detailed_requirements,
        p.expected_outcome,
        p.difficulty,
        p.tags,
        d.id as domain_id,
        d.name as domain_name,
        d.code as domain_code,
        d.icon as domain_icon,
        u.id as user_id,
        u.name as participant_name,
        u.email as participant_email,
        u.phone as participant_phone,
        u.college,
        u.course,
        u.year,
        u.team_name,
        u.participant_id,
        u.niat_id
      FROM problem_assignments a
      JOIN problem_statements p ON a.problem_statement_id = p.id
      JOIN domains d ON p.domain_id = d.id
      JOIN users u ON a.user_id = u.id
      WHERE a.user_id = ?
    `).get(req.user.id);

    if (!assignment) {
      return res.json({
        success: true,
        hasSelected: false,
        message: 'No problem statement has been selected yet.'
      });
    }

    return res.json({
      success: true,
      hasSelected: true,
      assignment: {
        id: assignment.assignment_id,
        selected_at: assignment.selected_at,
        status: assignment.assignment_status,
        problem: {
          id: assignment.problem_id,
          code: assignment.problem_code,
          title: assignment.title,
          description: assignment.description,
          detailed_requirements: assignment.detailed_requirements,
          expected_outcome: assignment.expected_outcome,
          difficulty: assignment.difficulty,
          tags: assignment.tags,
          domain: {
            id: assignment.domain_id,
            name: assignment.domain_name,
            code: assignment.domain_code,
            icon: assignment.domain_icon
          }
        },
        participant: {
          name: assignment.participant_name,
          email: assignment.participant_email,
          phone: assignment.participant_phone,
          college: assignment.college,
          course: assignment.course,
          year: assignment.year,
          team_name: assignment.team_name,
          participant_id: assignment.participant_id,
          niat_id: assignment.niat_id
        }
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve assignment.' });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/participants', participantsRoutes);
app.use('/api/problems', problemsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);

// Serve static build in production if client/dist exists
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found.' });
});

// SPA fallback for non-API routes
if (fs.existsSync(clientDistPath)) {
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    code: err.code || 'INTERNAL_ERROR',
    message: err.message || 'An unexpected server error occurred.'
  });
});

module.exports = app;
