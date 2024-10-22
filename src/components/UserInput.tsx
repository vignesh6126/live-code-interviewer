import { useState } from "react";

const UserInput = ({ setUserID }: any) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = () => {
    setUserID(inputValue);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="userID"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button onClick={handleSubmit}>Iniciar</button>
    </div>
  );
};

export default UserInput;
