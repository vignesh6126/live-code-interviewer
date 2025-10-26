import { useState, useEffect } from "react";
import { Input, Button } from "@chakra-ui/react";
import styles from "../styles/buttons.module.css";

interface UserInputProps {
  setUserID: (id: string) => void;
  setRoomID: (id: string) => void;
}

const UserInput = ({ setUserID, setRoomID }: UserInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [roomID, setInputRoomID] = useState<string>("");

  // Get the roomID from the URL on the first render
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRoomId = params.get("roomId");
    if (urlRoomId) {
      setInputRoomID(urlRoomId);
      setRoomID(urlRoomId); // Set roomID immediately if present in URL
    }
  }, [setRoomID]);

  const generateSimpleId = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const length = 4;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handleGenerateRoomID = () => {
    const newRoomID = generateSimpleId();
    setInputRoomID(newRoomID);
    setRoomID(newRoomID);
  };

  const handleSubmit = () => {
    if (!inputValue.trim()) {
      alert("Please enter your name");
      return;
    }
    
    if (!roomID.trim()) {
      alert("Please enter or generate a room ID");
      return;
    }
    
    setUserID(inputValue);
    setRoomID(roomID);
  };

  return (
    <div className={styles.groups}>
      <div className={styles.groupInputs}>
        <h2 style={{ color: "white", fontSize: 24, marginBottom: 24 }}>Live Code Interviewer</h2>
        
        <Input
          className={styles.defaultInputs}
          type="text"
          width="auto"
          placeholder="Your Name"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
        />
        
        <Input
          type="text"
          className={styles.defaultInputs}
          width="auto"
          placeholder="Room ID"
          value={roomID}
          onChange={(e) => {
            const newRoomId = e.target.value;
            setInputRoomID(newRoomId);
            setRoomID(newRoomId); // Update roomID in parent immediately
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
        />
      </div>
      
      <div className={styles.groupButtons}>
        <Button colorScheme="blue" className={styles.defaultButtons} onClick={handleSubmit}>
          Join Room
        </Button>
        
        <Button colorScheme="green" className={styles.defaultButtons} onClick={handleGenerateRoomID}>
          Generate Room ID
        </Button>
        
        <Button
          className={styles.defaultButtons}
          onClick={() => {
            if (roomID) {
              window.location.href = `/interviewReport/index.html?roomId=${roomID}`;
            } else {
              alert("Please enter a room ID first");
            }
          }}>
          Interview Reports
        </Button>
      </div>
    </div>
  );
};

export default UserInput;