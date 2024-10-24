import { useState } from "react";
import { Box, Button } from "@chakra-ui/react";
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

  return (
    <Box minH="100vh" bg="#0f0a19" color="gray.500" px={6} py={8}>
      {!userID && (
        <>
          <Button
            onClick={() => {
              window.location.href = `/interviewReport/index.html?roomId=XXXX`;
            }}>
            Go to /interviewReport/index.html?roomId=XXXX
          </Button>
          <UserInput setUserID={setUserID} setRoomID={setRoomID} />
        </>
      )}
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
      {roomID && (
        <>
          <Box
            position="fixed"
            top="0px"
            left="15px"
            zIndex="1000"
            borderRadius="full"
            p={4}
            boxShadow="lg">
            <Button
              colorScheme="teal"
              onClick={() => {
                const roomURL = `${window.location.origin}/index.html?roomId=${roomID}`;
                navigator.clipboard.writeText(roomURL);
              }}>
              Copy Room ID
            </Button>
          </Box>
          <Button
            colorScheme="teal"
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/interviewReport/index.html?roomId=${roomID}`
              );
            }}>
            Get Link for Later Report
          </Button>
        </>
      )}
    </Box>
  );
}

export default App;
