import { useState } from "react";
import { Box } from "@chakra-ui/react";
import UserInput from "./components/UserInput";
import VideoRoom from "./components/VideoRoom";
import CodeEditor from "./components/CodeEditor";
import { SuperVizRoomProvider } from "@superviz/react-sdk";

const DEVELOPER_API_KEY = import.meta.env.DEV
  ? import.meta.env.VITE_SUPERVIZ_DEVELOPER_KEY
  : import.meta.env.VITE_SUPERVIZ_PRODUCTION_KEY;

const groupId = "your-group-id";
const groupName = "your-group-name";

function App() {
  const [userID, setUserID] = useState(null);

  return (
    <Box minH="100vh" bg="#0f0a19" color="gray.500" px={6} py={8}>
      <UserInput setUserID={setUserID} />
      {userID && (
        <SuperVizRoomProvider
          developerKey={DEVELOPER_API_KEY}
          group={{ id: groupId, name: groupName }}
          participant={{ id: userID, name: "userName" }}
          roomId="ROOM_ID">
          <CodeEditor />
          <VideoRoom />
        </SuperVizRoomProvider>
      )}
    </Box>
  );
}

export default App;
