const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { initSocket } = require('./services/socket.service');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io with permissive CORS for all client origins
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: ['GET', 'POST']
  }
});

initSocket(io);

// Auto-seed official problems on startup if database is empty
try {
  const db = require('./db');
  const { migrateOfficialProblems } = require('./db/migrateProblems');
  const pCount = db.prepare('SELECT COUNT(*) as count FROM problem_statements').get();
  if (!pCount || pCount.count === 0) {
    console.log('🌱 Database is empty, auto-seeding official 160 problem statements...');
    migrateOfficialProblems();
  }
} catch (e) {
  console.warn('Auto-seed check notice:', e.message);
}

server.listen(PORT, () => {
  console.log(`======================================================`);
  console.log(`🚀 Hackathon Allocation Platform Server Running`);
  console.log(`📡 Port: http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO: Initialized`);
  console.log(`🌱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`======================================================`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});
