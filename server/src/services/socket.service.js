let io = null;

function initSocket(serverIo) {
  io = serverIo;
  io.on('connection', (socket) => {
    // Participant / Admin room join or simple global broadcast
    socket.on('disconnect', () => {});
  });
}

function broadcastProblemLocked(problem) {
  if (io) {
    io.emit('problem_locked', {
      problemId: problem.id,
      problemCode: problem.problem_code,
      title: problem.title,
      timestamp: new Date().toISOString()
    });
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
  broadcastProblemUpdated,
  broadcastHackathonStatus
};
