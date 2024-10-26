import { useState } from "react";
import { Box, Button, useToast } from "@chakra-ui/react";
import UserInput from "./components/UserInput";
import VideoRoom from "./components/VideoRoom";
import CodeEditor from "./components/CodeEditor";
import { SuperVizRoomProvider } from "@superviz/react-sdk";

const DEVELOPER_API_KEY = import.meta.env.DEV
  ? import.meta.env.VITE_SUPERVIZ_DEVELOPER_KEY
  : import.meta.env.VITE_SUPERVIZ_PRODUCTION_KEY;

function App() {
  const [userID, setUserID] = useState<string | null>(null);
  const [roomID, setRoomID] = useState<string | null>(null);
  const toast = useToast(); 

  return (
    <Box minH="100vh" bg="#0f0a19" color="gray.500" px={6} py={8}>
      {!userID && <UserInput setUserID={setUserID} setRoomID={setRoomID} />}
      {userID && roomID && (
        <SuperVizRoomProvider
          developerKey={DEVELOPER_API_KEY}
          group={{ id: roomID, name: "Your Group Name" }}
          participant={{ id: userID, name: userID }}
          roomId={roomID}>
          <CodeEditor roomId={roomID} />
          <VideoRoom />
        </SuperVizRoomProvider>
      )}
      {roomID && userID && (
        <Box style={{ margin: 24 }} position="relative" borderRadius="full" p={4} boxShadow="lg">
          <Button
            style={{ marginRight: 24 }}
            colorScheme="teal"
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
            }}>
            Copy Room ID
          </Button>
          <Button
            colorScheme="teal"
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
            }}>
            Get Report Link
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default App;
