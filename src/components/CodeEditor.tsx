import { useRef, useState, useEffect } from "react";
import { Box, HStack, Button, useToast, Alert, AlertIcon } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { io } from 'socket.io-client';
import { CODE_SNIPPETS } from "../constants";
import Output from "./Output";
import * as monaco from "monaco-editor";

let savedCodeCode = 0;

const CodeEditor = (props: { roomId: string }) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [value, setValue] = useState<string>("//Code goes here");
  const [language, setLanguage] = useState("javascript");
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [collabError, setCollabError] = useState<string>("");
  const toast = useToast();

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

  // Initialize Socket.io connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to collaboration server");
      setIsConnected(true);
      newSocket.emit("join-room", props.roomId);
      setCollabError("");
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from collaboration server");
      setIsConnected(false);
      setCollabError("Real-time collaboration disconnected");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setCollabError("Failed to connect to collaboration server");
    });

    // Listen for code changes from other users
    newSocket.on("code-change", (data) => {
      if (data.sender !== newSocket.id && data.roomId === props.roomId) {
        console.log("Received code change from:", data.sender);
        setValue(data.content);
        if (editorRef.current) {
          // Save current cursor position and selection
          const position = editorRef.current.getPosition();
          const selection = editorRef.current.getSelection();

          editorRef.current.setValue(data.content);

          // Restore cursor position and selection
          if (position) {
            editorRef.current.setPosition(position);
          }
          if (selection) {
            editorRef.current.setSelection(selection);
          }
        }
      }
    });

    // Listen for language changes from other users
    newSocket.on("language-change", (data) => {
      if (data.sender !== newSocket.id && data.roomId === props.roomId) {
        console.log("Received language change:", data.language);
        setLanguage(data.language);
        setValue(CODE_SNIPPETS[data.language] || "//Code goes here");
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [props.roomId, SOCKET_URL]);

  const onMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    editor.focus();

    // Listen for local changes and broadcast them
    let timeoutId: NodeJS.Timeout;
    editor.onDidChangeModelContent(() => {
      const content = editor.getValue();
      setValue(content);

      // Reduced debounce time for better real-time experience
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Broadcast code change to other users
        if (socket && socket.connected) {
          socket.emit("code-change", {
            content: content,
            sender: socket.id,
            roomId: props.roomId,
            timestamp: Date.now()
          });
        }
      }, 50); // Reduced from 100ms to 50ms for better responsiveness
    });
  };

  const onSelect = (newLanguage: string) => {
    setLanguage(newLanguage);
    setValue(CODE_SNIPPETS[newLanguage] || "//Code goes here");

    // Broadcast language change to other users
    if (socket && socket.connected) {
      socket.emit("language-change", {
        language: newLanguage,
        sender: socket.id,
        roomId: props.roomId,
        timestamp: Date.now()
      });
    }
  };

  async function saveCode() {
    toast({
      title: "Save Code",
      description: "This feature will be available when Firebase is configured.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  }

  return (
    <Box>
      {collabError && (
        <Alert status="warning" mb={4}>
          <AlertIcon />
          {collabError}
        </Alert>
      )}

      <HStack spacing={4} align="flex-start">
        <Box w="50%">
          <HStack justify="space-between" mb={4}>
            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              w="100%"
              justifyContent="space-between"
            >
              <LanguageSelector language={language} onSelect={onSelect} />
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                <span className="text-sm text-gray-500">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
                <Button
                  sx={{
                    color: "#ffffff",
                    marginTop: "1.6rem",
                    marginRight: "1.5rem",
                    fontSize: "1rem",
                    borderRadius: "6px",
                    transition: "background-color 0.2s ease-in-out",
                    _hover: {
                      bg: "rgba(248,248,255, 0.3)",
                    },
                  }}
                  onClick={saveCode}
                >
                  Save Code
                </Button>
              </div>
            </Box>
          </HStack>
          <Editor
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true
            }}
            height="70vh"
            theme="vs-dark"
            language={language}
            defaultValue={CODE_SNIPPETS[language]}
            onMount={onMount}
            value={value}
            onChange={(newValue: any) => setValue(newValue || "")}
          />
        </Box>
        <Output editorRef={editorRef} language={language} />
      </HStack>
    </Box>
  );
};

export default CodeEditor;