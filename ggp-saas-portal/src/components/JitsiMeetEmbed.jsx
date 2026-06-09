import { useEffect, useRef, useState } from "react";

function getEmbedHeight() {
  return Math.max(560, window.innerHeight - 240);
}

/**
 * Embeds a Jitsi Meet room using the IFrame API:
 * https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe/
 */
export default function JitsiMeetEmbed({
  domain,
  roomName,
  displayName,
  isModerator = false,
  onLeave,
}) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const [embedHeight, setEmbedHeight] = useState(getEmbedHeight);

  useEffect(() => {
    const onResize = () => setEmbedHeight(getEmbedHeight());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const mountMeeting = () => {
      if (cancelled || !containerRef.current || !window.JitsiMeetExternalAPI) {
        return;
      }

      const height = getEmbedHeight();
      const width = containerRef.current.clientWidth || window.innerWidth - 48;

      const api = new window.JitsiMeetExternalAPI(domain, {
        roomName,
        parentNode: containerRef.current,
        width,
        height,
        userInfo: { displayName: displayName || "Guest" },
        configOverwrite: {
          prejoinPageEnabled: false,
          enableWelcomePage: false,
          disableDeepLinking: true,
          disableGrantModerator: true,
        },
        interfaceConfigOverwrite: {
          MOBILE_APP_PROMO: false,
          SHOW_JITSI_WATERMARK: false,
        },
      });

      apiRef.current = api;

      if (isModerator) {
        api.addListener("videoConferenceJoined", () => {
          try {
            api.executeCommand("toggleLobby", false);
          } catch {
            // optional
          }
        });
      }

      api.addListener("readyToClose", () => {
        onLeave?.();
      });
    };

    if (window.JitsiMeetExternalAPI) {
      mountMeeting();
    } else {
      const script = document.createElement("script");
      script.src = `https://${domain}/external_api.js`;
      script.async = true;
      script.onload = mountMeeting;
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [domain, roomName, displayName, isModerator, onLeave]);

  return (
    <div
      ref={containerRef}
      className="jitsi-meet-container"
      style={{ height: embedHeight }}
    />
  );
}
