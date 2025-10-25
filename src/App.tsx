import { useState } from "react";
import { Box, Button, useToast } from "@chakra-ui/react";
import UserInput from "./components/UserInput";
import VideoRoom from "./components/VideoRoom";
import CodeEditor from "./components/CodeEditor";

function App() {
  const [userID, setUserID] = useState<string | null>(null);
  const [roomID, setRoomID] = useState<string | null>(null);
  const toast = useToast();

  return (
    <Box minH="100vh" bg="#0f0a19" color="gray.500" px={6} py={0}>
      {/* Show input for userID and roomID */}
      {!userID && <UserInput setUserID={setUserID} setRoomID={setRoomID} />}

      {/* Show Video + CodeEditor once user and room are set */}
      {userID && roomID && (
        <>
          {/* Agora-powered video room */}
          <VideoRoom channelName={roomID} />
          <CodeEditor roomId={roomID} />
        </>
      )}

      {/* Buttons to copy links */}
      {roomID && userID && (
        <Box
          style={{ paddingBottom: 24 }}
          position="relative"
          borderRadius="full"
          p={4}
          boxShadow="lg"
        >
          <Button
            sx={{
              color: "#ffffff",
              marginRight: "1.5rem",
              fontSize: "1rem",
              borderRadius: "6px",
              transition: "background-color 0.2s ease-in-out",
              _hover: { bg: "rgba(248,248,255, 0.3)" },
            }}
            onClick={() => {
              const roomURL = `${window.location.origin}/index.html?roomId=${roomID}`;
              navigator.clipboard.writeText(roomURL);
              toast({
                title: "Room ID Copied.",
                description: "The room link has been copied to your clipboard.",
                status: "success",
                duration: 3000,
                isClosable: true,
              });
            }}
          >
            Copy Room ID
          </Button>

          <Button
            sx={{
              color: "#ffffff",
              marginRight: "1.5rem",
              fontSize: "1rem",
              borderRadius: "6px",
              transition: "background-color 0.2s ease-in-out",
              _hover: { bg: "rgba(248,248,255, 0.3)" },
            }}
            onClick={() => {
              const reportURL = `${window.location.origin}/interviewReport/index.html?roomId=${roomID}`;
              navigator.clipboard.writeText(reportURL);
              toast({
                title: "Report Link Copied.",
                description: "The report link has been copied to your clipboard.",
                status: "success",
                duration: 3000,
                isClosable: true,
              });
            }}
          >
            Get Report Link
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default App;
