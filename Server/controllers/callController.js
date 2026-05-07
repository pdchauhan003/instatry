//if user can be call to someone then trigger it
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

//if answer then trigger
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


//create ice candidate for sharing public ip aderss
const handleIceCandidate = (io, socket) => ({ to, candidate }) => {
  try {
    const targetTo = to?.toString();
    if (!targetTo) return;

    io.to(targetTo).emit('ice-candidate', candidate);
  } catch (error) {
    console.error("ice-candidate error:", error);
  }
};


//decline then trigger
const handleDeclineCall = (io, socket) => ({ to }) => {
  try {
    const from = socket.userId?.toString();
    const targetTo = to?.toString();
    if (!from || !targetTo) return;

    io.to(targetTo).emit('call-declined', { by: from });
  } catch (error) {
    console.error("decline-call error:", error);
  }
};

const handleEndCall = (io, socket) => ({ to }) => {
  try {
    const from = socket.userId?.toString();
    const targetTo = to?.toString();
    if (!from || !targetTo) return;

    io.to(targetTo).emit('call-ended', { by: from });
  } catch (error) {
    console.error("end-call error:", error);
  }
};

module.exports = {
  handleCallUser,
  handleAnswerCall,
  handleIceCandidate,
  handleDeclineCall,
  handleEndCall
};
