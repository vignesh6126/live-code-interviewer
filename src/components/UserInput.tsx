import { useState } from "react";

const UserInput = ({ setUserID, setRoomID }: any) => {
  const [inputValue, setInputValue] = useState("");
  const [roomID, setInputRoomID] = useState("");

  const generateSimpleId = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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
    setUserID(inputValue);
    setRoomID(roomID); 
  };

  return (
    <div>
      <input
        type="text"
        placeholder="User ID"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <input
        type="text"
        placeholder="Room ID"
        value={roomID}
        onChange={(e) => setInputRoomID(e.target.value)} 
      />
      <button onClick={handleSubmit}>Iniciar</button>
      <button onClick={handleGenerateRoomID}>Gerar Room ID</button>
    </div>
  );
};

export default UserInput;
