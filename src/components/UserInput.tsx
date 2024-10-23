import { useState } from "react";
import { Input, Button } from "@chakra-ui/react";
import styles from "../styles/buttons.module.css";

const UserInput = ({ setUserID, setRoomID }: any) => {
  const [inputValue, setInputValue] = useState("");
  const [roomID, setInputRoomID] = useState("");

  const generateSimpleId = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const length = 4;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  const handleGenerateRoomID = () => {
    const newRoomID = generateSimpleId();
    setInputRoomID(newRoomID);
    setRoomID(newRoomID);
  };

  const handleSubmit = () => {
    setUserID(inputValue);
    setRoomID(roomID);
  };

  return (
    <div className={styles.groups}>
      <div className={styles.groupInputs}>
        <Input
          className={styles.defaultInputs}
          type="text"
          htmlSize={5}
          width="auto"
          placeholder="Username"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <Input
          type="text"
          className={styles.defaultInputs}
          htmlSize={4}
          width="auto"
          placeholder="Room ID"
          value={roomID}
          onChange={(e) => setInputRoomID(e.target.value)}
        />
      </div>
      <div className={styles.groupButtons}>
        <Button
          colorScheme="gray"
          className={styles.defaultButtons}
          onClick={handleSubmit}
        >
          Iniciar
        </Button>
        <Button
          colorScheme="gray"
          className={styles.defaultButtons}
          onClick={handleGenerateRoomID}
        >
          Gerar Room ID
        </Button>
      </div>
    </div>
  );
};

export default UserInput;
