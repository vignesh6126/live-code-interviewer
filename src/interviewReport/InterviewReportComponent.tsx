import { useEffect, useState } from "react";

//Import services
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

//Import components
import ReportActionItemComponent from "../components/ReportActionItemComponent";

const InterviewReportComponent = () => {
  // Main identifiers, for the room and the record
  const [roomId, setRoomId] = useState<string | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);

  // Data of the interviews
  const [interviewsDataList, setInterviewsDataList] = useState<any | null>(null);
  const [selectedInterviewData, setSelectedInterviewData] = useState<any | null>(null);

  // Data of the selected interview
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [meetingTranscript, setMeetingTranscript] = useState<string>(
    "Waiting for transcription...(if it's the first time here, it could take up to 20 minutes). Try again later, reload the page or check the debug section."
  );
  const [actionItens, setActionItens] = useState([{ text: "Loading..." }]);
  const [followUps, setFollowUps] = useState([{ text: "Loading...", score: 0 }]);

  // TODO: update the transcription collapsable based on the status
  // const [transcriptStatus, setTranscriptStatus] = useState<number | null>(null);
  // 409 - loading; 404 - error;

  // Execute on first render
  useEffect(() => {
    // Get the URL params
    const params = new URLSearchParams(window.location.search);
    setRoomId(params.get("roomId"));
  }, []);

  // Execute when the roomId changes
  useEffect(() => {
    // Execute when the roomId changes
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

  // Execute when the selectedInterviewData changes - From the select view, for example
  useEffect(() => {
    if (!selectedInterviewData) {
      console.log("Interview data not available");
      return;
    }

    // Set the recordId and Video URL to the selectedInterviewData
    setRecordId(selectedInterviewData.uuid);
    console.log("selectedInterviewData", selectedInterviewData);
    setVideoURL(selectedInterviewData.url);
    console.log("Video URL", selectedInterviewData.url);
  }, [selectedInterviewData]);

  // Execute when the recordId changes - From the select view, but after the video URL and interview UUID is set
  useEffect(() => {
    if (!recordId) {
      console.log("Record ID not available");
      return;
    }
    console.log("Requesting transcript for interview ", recordId);

    //Function for transform into human format the transcript
    function transformTranscriptIntoHumanFormat(transcriptBrute: any) {
      let transcript = "";
      transcriptBrute.forEach((element: any) => {
        transcript +=
          new Date(element.startTime).toUTCString() +
          " - " +
          element.username +
          ": " +
          element.content +
          "\n";
      });
      return transcript;
    }

    // First it tries to get the transcript for all the interviews, if it fails, it requests all the transcripts
    interviewsDataList.forEach((interview: any) => {
      getTranscript(interview.uuid)
        .then((transcript) => {
          console.log("Transcript for interview ", interview.uuid, ": VALID!");

          // but shows only the selected interview transcript
          if (interview.uuid == recordId) {
            setMeetingTranscript(transformTranscriptIntoHumanFormat(transcript));
          }
        })
        .catch((error) => {
          console.error("Error getting transcript for interview ", interview.uuid, ": ", error);
          console.log("Requesting transcript for interview ", interview.uuid);
          requestGenerateTranscript(interview.uuid)
            .then(() => console.log("Transcript requested for interview ", interview.uuid))
            .catch((error) =>
              console.error(
                "Error generating transcript request for interview ",
                interview.uuid,
                ": ",
                error
              )
            );
        });
    });

    // Get the action itens
    getActionItems(recordId)
      .then((actionItens) => {
        console.log("Action itens for interview", recordId, ": VALID!");
        setActionItens(actionItens);
      })
      .catch((error) => {
        console.error("Error getting action itens for interview ", recordId, ": ", error);
      });

    // Get the follow-ups
    getFollowUps(recordId)
      .then((followUps) => {
        console.log("Follow-ups for interview", recordId, ": VALID!");
        setFollowUps(followUps);
      })
      .catch((error) => {
        console.error("Error getting follow-ups for interview ", recordId, ": ", error);
      });
  }, [recordId]);

  return (
    <>
      <div>
        {/* Title and recordings selector */}
        <h3>Room - {roomId}</h3>
        Room Id:
        <input
          type="text"
          value={roomId || ""}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter Room ID"
        />
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
              {interviewsDataList.map((interview: any) => (
                <option key={interview.uuid} value={interview.uuid}>
                  {new Date(interview.createdAt).toUTCString()} - {interview.uuid}
                </option>
              ))}
            </select>
          </>
        )}
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

      {/* TODO: The source code typed on the interview here */}

      {/* Meeting Transcript */}
      <CollapsibleText title="Meeting transcript">
        <textarea value={meetingTranscript} readOnly={true} style={{ width: 1000, height: 200 }} />
      </CollapsibleText>

      {/* Action itens */}
      <CollapsibleText title="Action itens">
        {actionItens.map((actionItem: any) => (
          <ReportActionItemComponent text={actionItem.text} score={actionItem.score} />
        ))}
      </CollapsibleText>

      {/* Follow-ups */}
      <CollapsibleText title="Follow-ups">
        {followUps.map((followUp: any) => (
          <p>
            {followUp.text} - {followUp.score}
          </p>
        ))}
      </CollapsibleText>

      <h1 style={{ marginTop: 200 }}>Debug</h1>
      <CollapsibleText title="Debug Section">
        <>
          <h3>_________________________________DEBUG______________________________________</h3>
          {/* Get all recordings */}
          <h3>Etapa 1 - Get all recordings</h3>
          <button
            onClick={() => {
              console.log("getting recordings...");
              getRecordings().then((recordings) => {
                const textarea = document.getElementById(
                  "textAreaRecordings"
                ) as HTMLTextAreaElement;
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
          <button
            onClick={() => {
              console.log("getting actions itens for recordingId:", recordId);
              getActionItems(recordId as string)
                .then((transcript) => {
                  const textarea = document.getElementById(
                    "textAreaGetActionsItens"
                  ) as HTMLTextAreaElement;
                  if (textarea) {
                    textarea.value = JSON.stringify(transcript, null, 2);
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
              console.log("getting follow-ups for recordingId:", recordId);
              getFollowUps(recordId as string)
                .then((followUps) => {
                  const textarea = document.getElementById(
                    "textAreaGetFollowUps"
                  ) as HTMLTextAreaElement;
                  if (textarea) {
                    textarea.value = JSON.stringify(followUps[0]);
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
          <input
            id="inputRecordingIDForGetTopics"
            placeholder="Recording ID for get topics"></input>
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
        </>
      </CollapsibleText>
    </>
  );
};

export default InterviewReportComponent;
