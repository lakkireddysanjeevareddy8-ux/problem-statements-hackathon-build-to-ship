const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { initSocket } = require('./services/socket.service');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST']
  }
});

initSocket(io);

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
