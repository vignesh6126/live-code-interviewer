import { VideoConference } from "@superviz/react-sdk";
import { useEffect } from "react";

const VideoRoom = () => {
  const collaborationMode = {
    enabled: true,
  };

  useEffect(() => {
    const html = document.getElementsByTagName("html")?.[0];

    if (!html) return;

    html.removeAttribute("style");
    html.removeAttribute("data-theme");
  }, []);

  return (
    <VideoConference
      participantType="host"
      collaborationMode={collaborationMode}
    />
  );
};

export default VideoRoom;
