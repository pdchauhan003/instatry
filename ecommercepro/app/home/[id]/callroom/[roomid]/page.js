"use client";

import { useEffect, useRef, useState } from "react";
import socket from "@/lib/socket";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function CallPage() {
  const { id, roomid } = useParams();
  const router = useRouter();

  const [callStatus, setCallStatus] = useState("idle"); // idle, calling, connected, error
  const [errorMsg, setErrorMsg] = useState("");

  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peer = useRef(null);
  const pendingCandidates = useRef([]);

  useEffect(() => {
    // Create Peer Connection
    peer.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" } // free STUN
      ]
    });

    // Get User Media
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideo.current) {
          localVideo.current.srcObject = stream;
        }
        stream.getTracks().forEach((track) => {
          peer.current.addTrack(track, stream);
        });
      })
      .catch((err) => {
        console.error("Error accessing media devices:", err);
        setErrorMsg("Camera/Microphone permission denied or not found.");
        setCallStatus("error");
      });

    // Receive Remote Stream
    peer.current.ontrack = (event) => {
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = event.streams[0];
      }
    };

    // Send ICE Candidates
    peer.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          to: roomid,
          candidate: event.candidate
        });
      }
    };

    // Socket Handlers
    const handleIceCandidate = async (candidate) => {
      try {
        if (peer.current.remoteDescription) {
          await peer.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          pendingCandidates.current.push(candidate);
        }
      } catch (err) {
        console.error("ICE Error:", err);
      }
    };

    const handleIncomingCall = async ({ from, offer }) => {
      setCallStatus("connected");
      try {
        await peer.current.setRemoteDescription(new RTCSessionDescription(offer));
        
        // Process pending candidates
        for (const c of pendingCandidates.current) {
          await peer.current.addIceCandidate(new RTCIceCandidate(c)).catch(e => console.error(e));
        }
        pendingCandidates.current = [];

        const answer = await peer.current.createAnswer();
        await peer.current.setLocalDescription(answer);

        socket.emit("answer-call", { to: from, answer });
      } catch (error) {
        console.error("Error handling incoming call:", error);
      }
    };

    const handleCallAccepted = async ({ answer }) => {
      setCallStatus("connected");
      try {
        await peer.current.setRemoteDescription(new RTCSessionDescription(answer));

        // Process pending candidates
        for (const c of pendingCandidates.current) {
          await peer.current.addIceCandidate(new RTCIceCandidate(c)).catch(e => console.error(e));
        }
        pendingCandidates.current = [];
      } catch (error) {
        console.error("Error accepting call:", error);
      }
    };

    socket.on("ice-candidate", handleIceCandidate);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);

    return () => {
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);

      if (localVideo.current && localVideo.current.srcObject) {
        localVideo.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      
      peer.current?.close();
    };
  }, [id, roomid]);

  // Start Call
  const startCall = async () => {
    setCallStatus("calling");
    try {
      const offer = await peer.current.createOffer();
      await peer.current.setLocalDescription(offer);

      socket.emit("call-user", {
        to: roomid,
        offer
      });
    } catch (err) {
      console.error("Error starting call:", err);
      setErrorMsg("Failed to start call");
      setCallStatus("error");
    }
  };

  const endCall = () => {
    router.back();
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white p-4">
      <div className="flex items-center mb-6">
        <button onClick={endCall} className="p-2 mr-2 hover:bg-gray-800 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold">Video Call</h2>
      </div>

      {errorMsg && (
        <div className="bg-red-500/20 text-red-500 p-3 rounded-lg mb-4 text-center">
          {errorMsg}
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center w-full max-w-4xl">
          <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl w-full max-w-[400px] aspect-video">
            <h4 className="absolute top-2 left-3 bg-black/60 px-2 py-1 rounded text-xs font-semibold z-10">You</h4>
            <video
              ref={localVideo}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl w-full max-w-[400px] aspect-video">
            <h4 className="absolute top-2 left-3 bg-black/60 px-2 py-1 rounded text-xs font-semibold z-10">Remote</h4>
            <video
              ref={remoteVideo}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {callStatus !== "connected" && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                <p className="text-gray-400">Waiting for connection...</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="text-sm font-medium text-gray-400">
            Status: <span className="capitalize text-blue-400">{callStatus}</span>
          </p>

          <div className="flex gap-4">
            <button
              onClick={startCall}
              disabled={callStatus !== "idle"}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-400 rounded-full font-bold transition-all shadow-lg shadow-green-900/20"
            >
              Start Call
            </button>
            <button
              onClick={endCall}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full font-bold transition-all shadow-lg shadow-red-900/20"
            >
              End Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
