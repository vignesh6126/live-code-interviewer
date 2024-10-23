import { useState } from "react";
import { Box } from "@chakra-ui/react";
import UserInput from "./components/UserInput";
import VideoRoom from "./components/VideoRoom";
import CodeEditor from "./components/CodeEditor";
import { SuperVizRoomProvider } from "@superviz/react-sdk";

const DEVELOPER_API_KEY = import.meta.env.DEV
  ? import.meta.env.VITE_SUPERVIZ_DEVELOPER_KEY
  : import.meta.env.VITE_SUPERVIZ_PRODUCTION_KEY;

//const DEMO_RECORD_ID = import.meta.env.VITE_DEMO_RECORD_ID as string; //DEBUG only

function App() {
  const [userID, setUserID] = useState<string | null>(null);
  const [roomID, setRoomID] = useState<string | null>(null);

  return (
    <Box minH="100vh" bg="#0f0a19" color="gray.500" px={6} py={8}>
      <button
        onClick={() => {
          window.location.href = `/interviewReport/index.html?recordId=XXXX&roomId=XXXX`;
        }}>
        Go to /interviewReport/index.html?recordId=XXXX&roomId=XXXX
      </button>
      <UserInput setUserID={setUserID} setRoomID={setRoomID} />
      {userID && roomID && (
        <SuperVizRoomProvider
          developerKey={DEVELOPER_API_KEY}
          group={{ id: roomID, name: "Your Group Name" }}
          participant={{ id: userID, name: userID }}
          roomId={roomID}>
          <CodeEditor />
          <VideoRoom />
        </SuperVizRoomProvider>
      )}
    </Box>
  );
}

export default App;
