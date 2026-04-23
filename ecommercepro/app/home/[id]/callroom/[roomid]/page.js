"use client";

import { useEffect, useRef } from "react";
import socket from "@/lib/socket";
import { useParams } from "next/navigation";

export default function CallPage() {
  const { id } = useParams();

  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peer = useRef(null);

  useEffect(() => {

    //Create Peer Connection
    peer.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" } // free STUN
      ]
    });

    //Get User Media
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideo.current.srcObject = stream;

        stream.getTracks().forEach((track) => {
          peer.current.addTrack(track, stream);
        });
      });

    //Receive Remote Stream
    peer.current.ontrack = (event) => {
      remoteVideo.current.srcObject = event.streams[0];
    };

    //Send ICE Candidates
    peer.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          to: id,
          candidate: event.candidate
        });
      }
    };

    // Receive ICE Candidates
    socket.on("ice-candidate", async (candidate) => {
      try {
        await peer.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (err) {
        console.error("ICE Error:", err);
      }
    });

    //  Incoming Call
    socket.on("incoming-call", async ({ from, offer }) => {
      await peer.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer = await peer.current.createAnswer();
      await peer.current.setLocalDescription(answer);

      socket.emit("answer-call", {
        to: from,
        answer
      });
    });

    //  Call Accepted
    socket.on("call-accepted", async ({ answer }) => {
      await peer.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    return () => {
      socket.disconnect();
      peer.current?.close();
    };
  }, [id]);

  // Start Call
  const startCall = async () => {
    const offer = await peer.current.createOffer();
    await peer.current.setLocalDescription(offer);

    socket.emit("call-user", {
      to: id,
      offer
    });
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Video Call</h2>

      <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
        <div>
          <h4>Local</h4>
          <video
            ref={localVideo}
            autoPlay
            muted
            playsInline
            width="300"
            style={{ border: "2px solid black" }}
          />
        </div>

        <div>
          <h4>Remote</h4>
          <video
            ref={remoteVideo}
            autoPlay
            playsInline
            width="300"
            style={{ border: "2px solid black" }}
          />
        </div>
      </div>

      <br />

      <button
        onClick={startCall}
        style={{
          padding: "10px 20px",
          background: "green",
          color: "white",
          border: "none",
          cursor: "pointer"
        }}
      >
        Start Call
      </button>
    </div>
  );
}
