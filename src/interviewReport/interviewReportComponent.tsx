import { useEffect, useState } from "react";

const InterviewReportComponent = () => {
  const [recordId, setRecordId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const recordId = params.get("recordId");
    setRecordId(recordId);
  }, []);

  return (
    <div>
      <h3>Interview Report</h3>
      <p>Record ID: {recordId}</p>
      <button>button</button>
    </div>
  );
};

export default InterviewReportComponent;
