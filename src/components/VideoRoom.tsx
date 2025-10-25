import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

interface VideoRoomProps {
  roomId: string;
}

const VideoRoom = ({ roomId }: VideoRoomProps) => {
  const [socket, setSocket] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasRemoteUser, setHasRemoteUser] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const SOCKET_URL = "http://localhost:3001";

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to signaling server");
      setIsConnected(true);
      newSocket.emit("join-room", roomId);
    });

    newSocket.on("user-joined", (userId) => {
      console.log("User joined:", userId);
      setHasRemoteUser(true);
      createOffer();
    });

    newSocket.on("user-left", () => {
      console.log("User left");
      setHasRemoteUser(false);
      setRemoteStream(null);
      if (peerConnection) {
        peerConnection.close();
        setPeerConnection(null);
      }
    });

    newSocket.on("offer", async (data) => {
      console.log("Received offer");
      await handleOffer(data.offer);
    });

    newSocket.on("answer", async (data) => {
      console.log("Received answer");
      await handleAnswer(data.answer);
    });

    newSocket.on("ice-candidate", async (data) => {
      console.log("Received ICE candidate");
      await handleIceCandidate(data.candidate);
    });

    return () => {
      newSocket.disconnect();
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnection) {
        peerConnection.close();
      }
    };
  }, [roomId]);

  useEffect(() => {
    initializeMedia();
  }, []);

  const initializeMedia = async () => {
    try {
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

    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const createPeerConnection = () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const pc = new RTCPeerConnection(configuration);
    setPeerConnection(pc);

    // Add local stream to peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log("Received remote stream");
      const remoteStream = event.streams[0];
      setRemoteStream(remoteStream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          target: roomId
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
    };

    return pc;
  };

  const createOffer = async () => {
    const pc = createPeerConnection();
    
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      socket.emit("offer", {
        offer: offer,
        target: roomId
      });
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  const handleOffer = async (offer) => {
    const pc = createPeerConnection();
    
    try {
      await pc.setRemoteDescription(offer);
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      socket.emit("answer", {
        answer: answer,
        target: roomId
      });
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  };

  const handleAnswer = async (answer) => {
    if (peerConnection) {
      try {
        await peerConnection.setRemoteDescription(answer);
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    }
  };

  const handleIceCandidate = async (candidate) => {
    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(candidate);
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
          isConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isConnected ? `Connected - Room: ${roomId}` : 'Connecting...'}
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