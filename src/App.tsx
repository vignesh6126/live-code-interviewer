import { useState, useEffect } from "react";
import { Box, Button, useToast } from "@chakra-ui/react";
import { io, Socket } from "socket.io-client";
import UserInput from "./components/UserInput";
import VideoRoom from "./components/VideoRoom";
import CodeEditor from "./components/CodeEditor";
import Chat from "./Chat";

function App() {
  const [userID, setUserID] = useState<string | null>(null);
  const [roomID, setRoomID] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const toast = useToast();

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

  // Initialize Socket.io connection when user and room are set
  useEffect(() => {
    if (userID && roomID) {
      console.log("Initializing Socket.io connection...");
      const newSocket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
      });

      newSocket.on("connect", () => {
        console.log("Connected to server with ID:", newSocket.id);
        setIsConnected(true);
        // Join the room immediately after connection
        newSocket.emit("join-room", roomID);
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from server");
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Connection error:", error);
        setIsConnected(false);
        toast({
          title: "Connection Error",
          description: "Failed to connect to collaboration server",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });

      newSocket.on("existing-users", (users) => {
        console.log("Existing users in room:", users);
      });

      newSocket.on("user-joined", (userId) => {
        console.log("User joined:", userId);
        toast({
          title: "User Joined",
          description: "Another user has joined the room",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      });

      newSocket.on("user-left", (userId) => {
        console.log("User left:", userId);
        toast({
          title: "User Left",
          description: "A user has left the room",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      });

      setSocket(newSocket);

      // Cleanup on unmount or when roomID/userID changes
      return () => {
        console.log("Cleaning up socket connection");
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [userID, roomID, SOCKET_URL, toast]);

  const handleSetUserID = (id: string) => {
    setUserID(id);
  };

  const handleSetRoomID = (id: string) => {
    setRoomID(id);
  };

  return (
    <Box minH="100vh" bg="#0f0a19" color="gray.500" px={6} py={0}>
      {/* Show input for userID and roomID */}
      {!userID && (
        <UserInput 
          setUserID={handleSetUserID} 
          setRoomID={handleSetRoomID} 
        />
      )}

      {/* Show Video + CodeEditor + Chat once user and room are set */}
      {userID && roomID && (
        <>
          {/* Connection Status Indicator */}
          <Box 
            position="fixed" 
            top="4" 
            right="4" 
            zIndex="1000"
            display="flex"
            alignItems="center"
            gap="2"
            bg={isConnected ? "green.500" : "red.500"}
            color="white"
            px="3"
            py="1"
            borderRadius="md"
            fontSize="sm"
            fontWeight="medium"
          >
            <Box 
              w="2" 
              h="2" 
              borderRadius="full" 
              bg={isConnected ? "white" : "white"}
              animation={isConnected ? "pulse 2s infinite" : "none"}
            />
            {isConnected ? "Connected" : "Disconnected"}
          </Box>

          {/* Main Content Grid */}
          <Box display="grid" gridTemplateColumns="1fr 400px" gap="6" mt="6">
            {/* Left Column - Video and Code Editor */}
            <Box display="flex" flexDirection="column" gap="6">
              {/* Video Room */}
              <VideoRoom roomId={roomID} />
              
              {/* Code Editor */}
              <CodeEditor roomId={roomID} />
            </Box>

            {/* Right Column - Chat */}
            <Box>
              {socket && (
                <Chat 
                  roomId={roomID} 
                  socket={socket} 
                  userId={userID} 
                />
              )}
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box
            position="fixed"
            bottom="6"
            left="6"
            right="6"
            display="flex"
            justifyContent="center"
            gap="4"
            zIndex="100"
          >
            <Button
              sx={{
                color: "#ffffff",
                bg: "rgba(255,255,255,0.1)",
                fontSize: "1rem",
                borderRadius: "6px",
                transition: "background-color 0.2s ease-in-out",
                _hover: { bg: "rgba(248,248,255, 0.3)" },
              }}
              onClick={() => {
                const roomURL = `${window.location.origin}${window.location.pathname}?roomId=${roomID}`;
                navigator.clipboard.writeText(roomURL);
                toast({
                  title: "Room Link Copied",
                  description: "The room link has been copied to your clipboard.",
                  status: "success",
                  duration: 3000,
                  isClosable: true,
                });
              }}
            >
              📋 Copy Room Link
            </Button>

            <Button
              sx={{
                color: "#ffffff",
                bg: "rgba(255,255,255,0.1)",
                fontSize: "1rem",
                borderRadius: "6px",
                transition: "background-color 0.2s ease-in-out",
                _hover: { bg: "rgba(248,248,255, 0.3)" },
              }}
              onClick={() => {
                const reportURL = `${window.location.origin}/interviewReport/index.html?roomId=${roomID}`;
                navigator.clipboard.writeText(reportURL);
                toast({
                  title: "Report Link Copied",
                  description: "The report link has been copied to your clipboard.",
                  status: "success",
                  duration: 3000,
                  isClosable: true,
                });
              }}
            >
              📊 Get Report Link
            </Button>

            <Button
              sx={{
                color: "#ffffff",
                bg: "rgba(255,255,255,0.1)",
                fontSize: "1rem",
                borderRadius: "6px",
                transition: "background-color 0.2s ease-in-out",
                _hover: { bg: "rgba(248,248,255, 0.3)" },
              }}
              onClick={() => {
                // Reset the app
                setUserID(null);
                setRoomID(null);
                if (socket) {
                  socket.disconnect();
                  setSocket(null);
                }
                toast({
                  title: "Room Left",
                  description: "You have left the room.",
                  status: "info",
                  duration: 3000,
                  isClosable: true,
                });
              }}
            >
              🚪 Leave Room
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}

export default App;