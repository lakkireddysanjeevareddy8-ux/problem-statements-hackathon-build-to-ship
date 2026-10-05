let io = null;

function initSocket(serverIo) {
  io = serverIo;
  io.on('connection', (socket) => {
    // Participant / Admin room join or simple global broadcast
    socket.on('disconnect', () => {});
  });
}

function broadcastProblemLocked(problem, userId = null) {
  if (io) {
    const payload = {
      problemId: problem.id,
      problemCode: problem.problem_code,
      title: problem.title,
      status: 'ASSIGNED',
      assignedUserId: userId,
      timestamp: new Date().toISOString()
    };
    io.emit('problem_locked', payload);
    io.emit('problem_assigned', payload);
  }
}

function broadcastProblemUnlocked(problem) {
  if (io) {
    const payload = {
      problemId: problem.id,
      problemCode: problem.problem_code,
      title: problem.title,
      status: 'AVAILABLE',
      timestamp: new Date().toISOString()
    };
    io.emit('problem_unlocked', payload);
    io.emit('problem_updated', payload);
  }
}

function broadcastProblemUpdated(problem) {
  if (io) {
    io.emit('problem_updated', problem);
  }
}

function broadcastHackathonStatus(statusPayload) {
  if (io) {
    io.emit('hackathon_status_updated', statusPayload);
  }
}

module.exports = {
  initSocket,
  broadcastProblemLocked,
  broadcastProblemUnlocked,
  broadcastProblemUpdated,
  broadcastHackathonStatus
};

