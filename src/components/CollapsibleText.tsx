import React, { ReactNode, useState } from "react";

interface CollapsibleTextProps {
  title: string;
  log: string;
  status: string;
  children: ReactNode;
}

const CollapsibleText: React.FC<CollapsibleTextProps> = ({ title, log, status, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div style={{ backgroundColor: "#999999" }}>
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "Hide" : "Show"} {title}
      </button>
      {isOpen && (
        <>
          {children} <div dangerouslySetInnerHTML={{ __html: log.replace(/\n/g, "<br />") }} />
        </>
      )}
      <h4>Status: {status}</h4>
      {/*TODO: change icon based on status... */}
    </div>
  );
};

export default CollapsibleText;
