const handleCallUser = (io, socket) => ({ to, offer }) => {
  try {
    const from = socket.userId?.toString();
    const targetTo = to?.toString();
    if (!from || !targetTo) return;

    io.to(targetTo).emit('incoming-call', { from, offer });
  } catch (error) {
    console.error("call-user error:", error);
  }
};

const handleAnswerCall = (io, socket) => ({ to, answer }) => {
  try {
    const from = socket.userId?.toString();
    const targetTo = to?.toString();
    if (!from || !targetTo) return;

    io.to(targetTo).emit('call-accepted', { by: from, answer });
  } catch (error) {
    console.error("answer-call error:", error);
  }
};

const handleIceCandidate = (io, socket) => ({ to, candidate }) => {
  try {
    const targetTo = to?.toString();
    if (!targetTo) return;

    io.to(targetTo).emit('ice-candidate', candidate);
  } catch (error) {
    console.error("ice-candidate error:", error);
  }
};

module.exports = {
  handleCallUser,
  handleAnswerCall,
  handleIceCandidate
};
