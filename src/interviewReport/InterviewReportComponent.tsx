import { useEffect, useState } from "react";
import getRecordings from "../services/getRecording";
import requestGenerateTranscript from "../services/requestGenerateTranscript";
import getRecordingsWithTranscriptionReady from "../services/getRecordingsWithTranscriptionReady";
import getTranscript from "../services/getTranscript";
import getQuestions from "../services/reportGetQuestions";
import getActionItems from "../services/reportGetActionItens";
import getFollowUps from "../services/reportGetFollowUps";
import getTopics from "../services/reportGetTopics";
import getSummary from "../services/reportGetSummary";
import CollapsibleText from "../components/CollapsibleText";

const InterviewReportComponent = () => {
  const [recordId, setRecordId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  const [interviewsDataList, setInterviewsDataList] = useState<any | null>(null);
  const [selectedInterviewData, setSelectedInterviewData] = useState<any | null>(null);

  const [videoURL, setVideoURL] = useState<string | null>(null);

  // Estados de carregamento
  const [videoStatus, setVideoStatus] = useState<string>("loading");

  // Execute on first render
  useEffect(() => {
    // Get the URL params
    const params = new URLSearchParams(window.location.search);
    setRoomId(params.get("roomId"));
  }, []);

  // Execute when the roomId changes
  useEffect(() => {
    // Execute wehn the roomId changes
    async function getInterviewsDataList(room_id: string | null) {
      console.log("Requesting interviews data list...");
      try {
        const request = await getRecordings();
        const filteredData = request.data.filter((recording: any) => recording.roomId == room_id);
        setInterviewsDataList(filteredData);
      } catch (error) {
        console.error("Error getting interviews data list: ", error);
      }
    }
    getInterviewsDataList(roomId);
  }, [roomId]);

  //Exectue when the interviewsDataList changes
  useEffect(() => {
    if (!interviewsDataList) {
      console.log("Interviews data list not available");
      return;
    }
    // Set the selectedInterviewData to the first interview
    setSelectedInterviewData(interviewsDataList[0]);
  }, [interviewsDataList]);

  // Execute when the interviewData changes
  useEffect(() => {
    if (!selectedInterviewData) {
      console.log("Interview data not available");
      return;
    }

    // Set the recordId and Video URL to the selectedInterviewData
    setRecordId(selectedInterviewData.uuid);
    setVideoURL(selectedInterviewData.url);
  }, [selectedInterviewData]);

  // Execute when the recordId changes
  useEffect(() => {
    console.log("recordId changed to: ", recordId);
  }, [recordId]);

  // Atualizar o status do vídeo
  useEffect(() => {
    if (videoURL) {
      setVideoStatus("success");
    } else {
      setVideoStatus("failed");
    }
  }, [videoURL]);

  return (
    <>
      <div>
        <h3>Room - {roomId}</h3>
        {interviewsDataList && (
          <>
            - Record Id:
            <select
              onChange={(e) => {
                console.log("selectedInterviewData", e.target.value);
                setSelectedInterviewData(
                  interviewsDataList.find((interview: any) => interview.uuid === e.target.value)
                );
              }}
              value={recordId || ""}>
              <option value="" disabled>
                Select an interview
              </option>
            ))}
          </select>
        )}
      </div>
      {/* Interview Video */}
      <CollapsibleText title="Interview Video" status={videoStatus}>
        {videoURL ? (
          <video controls width="1000">
            <source src={videoURL} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <p>Video not available</p>
        )}
      </CollapsibleText>

      {/* TODO: The source code here */}

      {/* Meeting Transcript */}
      <CollapsibleText title="Meeting transcript">
        <textarea value={meetingTranscript} readOnly={true} style={{ width: 1000, height: 200 }} />
      </CollapsibleText>

      {/* Action itens */}
      <CollapsibleText title="Action itens">
        {actionItens.map((actionItem: any) => (
          <ReportActionItemComponent text={actionItem.text} />
        ))}
      </CollapsibleText>

      {/* Follow-ups */}
      <CollapsibleText title="Follow-ups">
        {followUps.map((followUp: any) => (
          <p>{followUp.text}</p>
        ))}
      </CollapsibleText>

      {/* Questions */}
      <CollapsibleText title="Questions">
        {questionsReport.map((question: any) => (
          <p>{question.text}</p>
        ))}
      </CollapsibleText>

      {/* Topics */}
      <CollapsibleText title="Topics">
        {topics.map((topic: any) => (
          <p>{topic.text}</p>
        ))}
      </CollapsibleText>

      {/* Summary */}
      <CollapsibleText title="Summary">
        {summary.map((summaryItem: any) => (
          <p>{summaryItem.text}</p>
        ))}
      </CollapsibleText>
    </>
  );
};

export default InterviewReportComponent;
