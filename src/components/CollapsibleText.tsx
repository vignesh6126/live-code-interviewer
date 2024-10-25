import React, { ReactNode, useState } from "react";

interface CollapsibleTextProps {
  title: string;
  log?: string;
  status?: string;
  children?: ReactNode;
}

const CollapsibleText: React.FC<CollapsibleTextProps> = ({
  title,
  log,
  status,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ backgroundColor: "#999999", padding: 12, margin: 12 }}>
      {(log || children || status) && (
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "Hide" : "Show"} {title}
        </button>
      )}
      {isOpen && (log || children || status) && (
        <>
          {/* {children} <div dangerouslySetInnerHTML={{ __html: log.replace(/\n/g, "<br />") }} /> */}
          {children} <div> {log} </div>
        </>
      )}
      {status && <h4>Status: {status}</h4>}
      {/*TODO: change icon based on status... */}
    </div>
  );
};

export default CollapsibleText;
