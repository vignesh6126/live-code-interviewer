import { useRef, useState, useEffect } from "react";
import { Box, HStack } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "../constants";
import Output from "./Output";
import { YjsProvider, useYjsProvider } from "@superviz/react-sdk";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import * as monaco from "monaco-editor";
// import postCode from "../services/postCode";
// import { getFirestore } from "firebase/firestore";
// import { initializeApp } from "firebase/app";
// initializeApp();
// const dbFirestore = getFirestore();

const ydoc = new Y.Doc();

const CodeEditor = (props: { roomId: string }) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [value, setValue] = useState<string>("//Code goes here");
  const [language, setLanguage] = useState("javascript");
  const { provider } = useYjsProvider();

  // test TODO: remove
  props.roomId = "test";

  const onMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelect = (language: any) => {
    setLanguage(language);
  };

  useEffect(() => {
    if (!provider || !editorRef.current) return;

    const model = editorRef.current.getModel();
    if (!model) return;

    const binding = new MonacoBinding(
      ydoc.getText("monaco"),
      model,
      new Set([editorRef.current]),
      provider.awareness
    );

    return () => {
      binding.destroy();
    };
  }, [provider]);

  // async function saveCode() {
  //   const docRef = dbFirestore.collection("codes").doc(props.roomId);

  //   await docRef.set({
  //     code: value,
  //   });
  // }

  return (
    <YjsProvider doc={ydoc}>
      <Box>
        <HStack spacing={4}>
          <Box w="50%">
            <LanguageSelector language={language} onSelect={onSelect} />
            <button
              onClick={() => {
                //postCode(props.roomId, value);
              }}>
              Save this code
            </button>
            <Editor
              options={{
                minimap: {
                  enabled: false,
                },
              }}
              height="75vh"
              theme="vs-dark"
              language={language}
              defaultValue={CODE_SNIPPETS[language]}
              onMount={onMount}
              value={value}
              onChange={(newValue: any) => setValue(newValue)}
            />
          </Box>
          <Output editorRef={editorRef} language={language} />
        </HStack>
      </Box>
    </YjsProvider>
  );
};

export default CodeEditor;
