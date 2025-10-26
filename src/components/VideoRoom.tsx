import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

interface VideoRoomProps {
  roomId: string;
  socket: Socket | null;
}

const VideoRoom = ({ roomId, socket }: VideoRoomProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasRemoteUser, setHasRemoteUser] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!socket) return;

    console.log("VideoRoom: Setting up socket listeners");

    socket.on("user-joined", (userId: string) => {
      console.log("User joined:", userId);
      setHasRemoteUser(true);
      // Only create offer if we already have local stream
      if (localStream) {
        createOffer();
      }
    });

    socket.on("user-left", () => {
      console.log("User left");
      setHasRemoteUser(false);
      setRemoteStream(null);
      if (peerConnection) {
        peerConnection.close();
        setPeerConnection(null);
      }
    });

    socket.on("offer", async (data: any) => {
      console.log("Received offer from:", data.from);
      await handleOffer(data.offer, data.from);
    });

    socket.on("answer", async (data: any) => {
      console.log("Received answer from:", data.from);
      await handleAnswer(data.answer);
    });

    socket.on("ice-candidate", async (data: any) => {
      console.log("Received ICE candidate from:", data.from);
      await handleIceCandidate(data.candidate);
    });

    socket.on("user-ready", (userId: string) => {
      console.log("User ready for connection:", userId);
      if (localStream) {
        createOffer();
      }
    });

    return () => {
      // Clean up socket listeners
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-ready");
    };
  }, [socket, localStream, peerConnection, roomId]);

  useEffect(() => {
    initializeMedia();
  }, []);

  const initializeMedia = async () => {
    try {
      console.log("Initializing media...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });
      
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log("Media initialized successfully");

      // Notify that we're ready for peer connection
      if (socket) {
        socket.emit("ready", roomId);
      }

    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const createPeerConnection = () => {
    console.log("Creating peer connection...");
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const pc = new RTCPeerConnection(configuration);

    // Add local stream to peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log("Received remote stream");
      const [remoteStream] = event.streams;
      setRemoteStream(remoteStream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        console.log("Sending ICE candidate");
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          target: roomId
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        console.log("Peer connection established!");
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", pc.iceConnectionState);
    };

    setPeerConnection(pc);
    return pc;
  };

  const createOffer = async () => {
    if (!socket) {
      console.error("Socket is not available");
      return;
    }

    const pc = peerConnection || createPeerConnection();
    
    try {
      console.log("Creating offer...");
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      console.log("Sending offer...");
      socket.emit("offer", {
        offer: offer,
        target: roomId
      });
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit, from: string) => {
    if (!socket) {
      console.error("Socket is not available");
      return;
    }

    console.log("Handling offer from:", from);
    const pc = createPeerConnection();
    
    try {
      await pc.setRemoteDescription(offer);
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      console.log("Sending answer...");
      socket.emit("answer", {
        answer: answer,
        target: roomId
      });
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (peerConnection) {
      try {
        console.log("Handling answer...");
        await peerConnection.setRemoteDescription(answer);
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    }
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (peerConnection) {
      try {
        console.log("Adding ICE candidate...");
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Video Interview Room</h2>
        <div className={`px-3 py-1 rounded text-sm ${
          socket?.connected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {socket?.connected ? `Connected - Room: ${roomId}` : 'Connecting...'}
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        {/* Local Video */}
        <div className="flex-1 min-w-80">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">You</h3>
            {localStream && (
              <div className="flex gap-2">
                <button
                  onClick={toggleVideo}
                  className={`px-3 py-1 text-sm rounded ${
                    localStream.getVideoTracks()[0]?.enabled 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white`}
                >
                  {localStream.getVideoTracks()[0]?.enabled ? 'Stop Video' : 'Start Video'}
                </button>
                <button
                  onClick={toggleAudio}
                  className={`px-3 py-1 text-sm rounded ${
                    localStream.getAudioTracks()[0]?.enabled 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white`}
                >
                  {localStream.getAudioTracks()[0]?.enabled ? 'Mute' : 'Unmute'}
                </button>
              </div>
            )}
          </div>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-64 bg-gray-200 rounded-lg border-2 border-blue-500"
          />
          {!localStream && (
            <div className="text-sm text-gray-500 mt-2">Initializing camera...</div>
          )}
        </div>

        {/* Remote Video */}
        <div className="flex-1 min-w-80">
          <h3 className="text-lg font-semibold mb-2">
            Interviewer {remoteStream ? "(Connected)" : (hasRemoteUser ? "(Connecting...)" : "(Waiting)")}
          </h3>
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-64 bg-gray-200 rounded-lg border-2 border-green-500"
            />
          ) : (
            <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-gray-300 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">👤</div>
                <div>Waiting for interviewer to join</div>
                <div className="text-sm mt-1">Share room ID: <strong>{roomId}</strong></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoRoom;