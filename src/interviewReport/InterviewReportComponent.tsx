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
import { get, set } from "lodash";

const InterviewReportComponent = () => {
  const [recordId, setRecordId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [interviewData, setInterviewData] = useState<any | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);

  // Execute on firsto render
  useEffect(() => {
    // Get the URL params
    const params = new URLSearchParams(window.location.search);
    //setRecordId(params.get("recordId")); // TODO: Only if there's more than one record per room
    setRoomId(params.get("roomId"));
  }, []);

  // Execute when the roomId changes
  useEffect(() => {
    // Get the info from the last recorded interview for the roomId get from params
    async function geLastInterviewDataForThisRoomId(room_id: string | null) {
      console.log(`Requesting last interview data for this roomId: ${room_id}`);
      try {
        const request = await getRecordings();
        function getInterviewData(recordingsList: any) {
          let interviewData = null;
          recordingsList.forEach((recording: any) => {
            if (recording.roomId == room_id) {
              interviewData = recording;
              console.log(
                `Interview data found for roomId ${room_id}: ${JSON.stringify(interviewData)}`
              );
              return;
            }
          });
          setInterviewData(interviewData);
        }
        getInterviewData(request.data);
      } catch (error) {
        console.error("Error getting interview data: ", error);
      }
    }
    setInterviewData(geLastInterviewDataForThisRoomId(roomId));
  }, [roomId]);

  // Execute when the interviewData changes
  useEffect(() => {
    if (!interviewData) {
      console.log("Interview data not available");
      return;
    }

    // Set the recordId to the interviewData
    setRecordId(interviewData.uuid);

    // Get video from interview and controls it's features
    async function getInterviewVideo() {
      console.log("Requesting video...");
      try {
        setVideoURL(interviewData.url);
      } catch (error) {
        console.error("Error getting video from interview: ", error);
      }
    }
    getInterviewVideo();
  }, [interviewData]);

  // Execute when the recordId changes
  useEffect(() => {
    console.log("recordId changed to: ", recordId);
  }, [recordId]);

  return (
    <>
      <div>
        <h3>
          Interview {recordId} report <br></br> From Room {roomId}
        </h3>
      </div>
      {/* Interview Video */}
      <CollapsibleText title="Interview Video">
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

      <div style={{ marginTop: 450 }}>
        <h1>Debug</h1>
        <h3>_________________________________DEBUG______________________________________</h3>
        {/* Get all recordings */}
        <h3>Etapa 1 - Get all recordings</h3>
        <button
          onClick={() => {
            console.log("getting recordings...");
            getRecordings().then((recordings) => {
              const textarea = document.getElementById("textAreaRecordings") as HTMLTextAreaElement;
              if (textarea) {
                textarea.value = JSON.stringify(recordings, null, 2);
              }
            });
          }}>
          Get all recordings
        </button>
        <textarea
          style={{ height: 50, width: 1000 }}
          id="textAreaRecordings"
          placeholder="Recordings..."></textarea>
        <br></br>
        <br></br>
        {/*  */}
        {/* Generate transcript - it has to wait */}
        <h3>Etapa 2 - Solicitar transcrição - tem que esperar o processo terminar</h3>
        <input id="inputRecordingID" placeholder="Recording ID"></input>
        <button
          onClick={() => {
            const recordingId = (document.getElementById("inputRecordingID") as HTMLInputElement)
              .value;
            console.log("generating transcript for recordingId:", recordingId);
            requestGenerateTranscript(recordingId)
              .then(() => console.log("Transcript requested"))
              .catch((error) => console.error("Error generating transcript request:", error));
          }}>
          Request to generate transcript
        </button>
        <br></br>
        <br></br>
        {/*  */}
        {/* Get recordings with transcription ready */}
        <h3>Etapa 3 - Solicitar todas as gravações, com transcrição</h3>
        <button
          onClick={() => {
            console.log("getting recordings with transcription ready...");
            getRecordingsWithTranscriptionReady().then((recordings) => {
              const textarea = document.getElementById(
                "textAreaRecordingsWithTranscriptionReady"
              ) as HTMLTextAreaElement;
              if (textarea) {
                textarea.value = JSON.stringify(recordings, null, 2);
              }
            });
          }}>
          Get recordings with transcription ready
        </button>
        <textarea
          style={{ height: 50, width: 1000 }}
          id="textAreaRecordingsWithTranscriptionReady"
          placeholder="Recordings with transcription ready..."
          readOnly></textarea>
        <br></br>
        <br></br>
        {/*  */}
        {/* get Transcript */}
        <h3>Etapa 4 - Solicitar transcrição da gravação</h3>
        <input
          id="inputRecordingIDForGetTranscript"
          placeholder="Recording ID for get transcript"></input>
        <button
          onClick={() => {
            const recordingId = (
              document.getElementById("inputRecordingIDForGetTranscript") as HTMLInputElement
            ).value;
            console.log("getting transcript for recordingId:", recordingId);
            getTranscript(recordingId)
              .then((transcript) => {
                const textarea = document.getElementById(
                  "textAreaTranscript"
                ) as HTMLTextAreaElement;
                if (textarea) {
                  textarea.value = JSON.stringify(transcript, null, 2);
                }
              })
              .catch((error) => console.error("Error getting transcript:", error));
          }}>
          Get transcript
        </button>
        <textarea
          style={{ height: 50, width: 1000 }}
          id="textAreaTranscript"
          placeholder="Transcript..."
        />
        {/*  */}
        {/* get Questions */}
        <h3>Etapa 5 - Get Questions</h3>
        <input
          id="inputRecordingIDForGetQuestions"
          placeholder="Recording ID for get questions"></input>
        <button
          onClick={() => {
            const recordingId = (
              document.getElementById("inputRecordingIDForGetQuestions") as HTMLInputElement
            ).value;
            console.log("getting questions for recordingId:", recordingId);
            getQuestions(recordingId)
              .then((transcript) => {
                const textarea = document.getElementById(
                  "textAreaGetQuestions"
                ) as HTMLTextAreaElement;
                if (textarea) {
                  textarea.value = JSON.stringify(transcript.questions, null, 2);
                }
              })
              .catch((error) => console.error("Error getting questions:", error));
          }}>
          Get questions
        </button>
        <textarea
          style={{ height: 50, width: 1000 }}
          id="textAreaGetQuestions"
          placeholder="Questions..."
        />
        {/*  */}
        {/* get Action itens */}
        <h3>Etapa 6 - Get Actions Itens</h3>
        <input
          id="inputRecordingIDForGetActionsItens"
          placeholder="Recording ID for get actions itens"></input>
        <button
          onClick={() => {
            const recordingId = (
              document.getElementById("inputRecordingIDForGetActionsItens") as HTMLInputElement
            ).value;
            console.log("getting actions itens for recordingId:", recordingId);
            getActionItems(recordingId)
              .then((transcript) => {
                const textarea = document.getElementById(
                  "textAreaGetActionsItens"
                ) as HTMLTextAreaElement;
                if (textarea) {
                  textarea.value = JSON.stringify(transcript.actionItems, null, 2);
                }
              })
              .catch((error) => console.error("Error getting action itens:", error));
          }}>
          Get actions itens
        </button>
        <textarea
          style={{ height: 50, width: 1000 }}
          id="textAreaGetActionsItens"
          placeholder="Actions Itens..."
        />
        {/*  */}
        {/* get Follow Ups */}
        <h3>Etapa 7 - Get Follow-ups</h3>
        <input
          id="inputRecordingIDForGetFollowUps"
          placeholder="Recording ID for get follow-ups"></input>
        <button
          onClick={() => {
            const recordingId = (
              document.getElementById("inputRecordingIDForGetFollowUps") as HTMLInputElement
            ).value;
            console.log("getting follow-ups for recordingId:", recordingId);
            getFollowUps(recordingId)
              .then((transcript) => {
                const textarea = document.getElementById(
                  "textAreaGetFollowUps"
                ) as HTMLTextAreaElement;
                if (textarea) {
                  textarea.value = JSON.stringify(transcript.followUps, null, 2);
                }
              })
              .catch((error) => console.error("Error getting follow-ups:", error));
          }}>
          Get follow-ups
        </button>
        <textarea
          style={{ height: 50, width: 1000 }}
          id="textAreaGetFollowUps"
          placeholder="Follow ups..."
        />
        {/*  */}
        {/* get Topics */}
        <h3>Etapa 8 - Get Topics</h3>
        <input id="inputRecordingIDForGetTopics" placeholder="Recording ID for get topics"></input>
        <button
          onClick={() => {
            const recordingId = (
              document.getElementById("inputRecordingIDForGetTopics") as HTMLInputElement
            ).value;
            console.log("getting topics for recordingId:", recordingId);
            getTopics(recordingId)
              .then((transcript) => {
                const textarea = document.getElementById(
                  "textAreaGetTopics"
                ) as HTMLTextAreaElement;
                if (textarea) {
                  textarea.value = JSON.stringify(transcript.topics, null, 2);
                }
              })
              .catch((error) => console.error("Error getting topics:", error));
          }}>
          Get topics
        </button>
        <textarea
          style={{ height: 50, width: 1000 }}
          id="textAreaGetTopics"
          placeholder="Topics..."
        />
        {/*  */}
        {/* get Summary */}
        <h3>Etapa 9 - Get Summary</h3>
        <input
          id="inputRecordingIDForGetSummary"
          placeholder="Recording ID for get summary"></input>
        <button
          onClick={() => {
            const recordingId = (
              document.getElementById("inputRecordingIDForGetSummary") as HTMLInputElement
            ).value;
            console.log("getting summary for recordingId:", recordingId);
            getSummary(recordingId)
              .then((transcript) => {
                const textarea = document.getElementById(
                  "textAreaGetSummary"
                ) as HTMLTextAreaElement;
                if (textarea) {
                  textarea.value = JSON.stringify(transcript.summary);
                }
              })
              .catch((error) => console.error("Error getting summary:", error));
          }}>
          Get summary
        </button>
        <textarea
          style={{ height: 50, width: 1000 }}
          id="textAreaGetSummary"
          placeholder="Summary..."
        />
        <h1>END OF DEBUG</h1>
      </div>
    </>
  );
};

export default InterviewReportComponent;
