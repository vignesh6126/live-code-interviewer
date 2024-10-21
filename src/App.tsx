import { VideoConference } from "@superviz/react-sdk";
import "./App.css";
import { SuperVizRoomProvider, useYjsProvider, YjsProvider } from "@superviz/react-sdk";
import { sampleInfo } from "./projectInfo";
import * as Y from "yjs";
import { Editor } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { MonacoBinding } from "y-monaco";

const DEVELOPER_API_KEY = import.meta.env.VITE_SUPERVIZ_DEVELOPER_KEY;

const groupId = sampleInfo.id;
const groupName = sampleInfo.name;
// Sample participant ID (0-100)
// const participant = Math.floor(Math.random() * 100)
//   .toString()
//   .padStart(3, "0");

const ydoc = new Y.Doc();

const style = document.createElement("style");
style.id = "sv-yjs-monaco";
document.head.appendChild(style);

function EditorRoom() {
  const { provider } = useYjsProvider();
  const [editor, setEditor] = useState<any>(null);

  useEffect(() => {
    if (!provider || editor == null) return;

    const binding = new MonacoBinding(
      ydoc.getText("monaco"),
      editor.getModel()!,
      new Set([editor]),
      provider.awareness
    );

    return () => {
      binding.destroy();
    };
  }, [ydoc, provider, editor]);

  return (
    <>
      <YjsProvider doc={ydoc} />
      <Editor
        defaultValue="// Connect to the room to start collaborating"
        defaultLanguage="typescript"
        onMount={(editor) => {
          setEditor(editor);
        }}
        options={{
          padding: {
            top: 32,
          },
        }}
        theme="vs-dark"
      />
    </>
  );
}

function VideoRoom() {
  const collaborationMode = {
    enabled: true,
  };
  return <VideoConference participantType="host" collaborationMode={collaborationMode} />;
}

function App() {
  const [userID, setUserID] = useState<string | null>(null);

  return (
    <>
      <input type="text" placeholder="userID" />
      <button
        onClick={() => {
          const input = document.querySelector('input[type="text"]');
          if (input) {
            setUserID(input.value);
          }
        }}>
        Iniciar
      </button>
      {userID ? (
        <SuperVizRoomProvider
          developerKey={DEVELOPER_API_KEY}
          group={{
            id: groupId,
            name: groupName,
          }}
          participant={{
            id: userID,
            name: "userName",
          }}
          roomId="ROOM_ID">
          <EditorRoom />
        </SuperVizRoomProvider>
      ) : null}
      {userID ? (
        <SuperVizRoomProvider
          developerKey={DEVELOPER_API_KEY}
          group={{
            id: groupId,
            name: groupName,
          }}
          participant={{
            id: userID.toString() + "video",
            name: "userName",
          }}
          roomId="ROOM_ID">
          <VideoRoom />
        </SuperVizRoomProvider>
      ) : null}
    </>
  );
}

export default App;
