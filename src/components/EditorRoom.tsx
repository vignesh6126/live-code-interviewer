import React, { useEffect, useState, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import AgoraRTM from 'agora-rtm-sdk';

const EditorRoom: React.FC<{ roomId: string }> = ({ roomId }) => {
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [value, setValue] = useState<string>("// Connect to the room to start collaborating");
  const [rtmClient, setRtmClient] = useState<any>(null);
  const [channel, setChannel] = useState<any>(null);

  const APP_ID = import.meta.env.VITE_AGORA_APP_ID;

  useEffect(() => {
    const initRTM = async () => {
      if (!APP_ID) {
        console.error("Agora App ID is missing");
        return;
      }

      const client = AgoraRTM.createInstance(APP_ID);
      await client.login({ uid: `user-${Date.now()}` });
      
      const rtmChannel = await client.createChannel(roomId);
      await rtmChannel.join();
      
      // Listen for code changes from other users
      rtmChannel.on('ChannelMessage', (message, memberId) => {
        if (message.messageType === 'TEXT') {
          const data = JSON.parse(message.text);
          if (data.type === 'CODE_CHANGE' && data.sender !== client.connectionId) {
            setValue(data.content);
            if (editor) {
              editor.setValue(data.content);
            }
          }
        }
      });

      setRtmClient(client);
      setChannel(rtmChannel);
    };

    initRTM();

    return () => {
      if (channel) {
        channel.leave();
      }
      if (rtmClient) {
        rtmClient.logout();
      }
    };
  }, [APP_ID, roomId, editor]);

  const onMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    setEditor(editor);
    
    // Listen for local changes and broadcast them
    editor.onDidChangeModelContent(() => {
      const content = editor.getValue();
      setValue(content);
      
      // Broadcast code change to other users
      if (channel) {
        channel.sendMessage({ 
          text: JSON.stringify({
            type: 'CODE_CHANGE',
            content: content,
            sender: rtmClient?.connectionId,
            timestamp: Date.now()
          })
        });
      }
    });
  };

  return (
    <Editor
      value={value}
      defaultLanguage="typescript"
      onMount={onMount}
      options={{ padding: { top: 32 } }}
      theme="vs-dark"
    />
  );
};

export default EditorRoom;