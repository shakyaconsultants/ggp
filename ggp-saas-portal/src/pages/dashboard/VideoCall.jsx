import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/client";
import { useNutritionist } from "../../context/NutritionistContext";
import JitsiMeetEmbed from "../../components/JitsiMeetEmbed";
import { useApiFeedback } from "../../hooks/useApiFeedback";

export default function VideoCall() {
  const { callId } = useParams();
  const navigate = useNavigate();
  const { nutritionist } = useNutritionist();
  const { runSafe } = useApiFeedback();
  const [joinInfo, setJoinInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadJoinInfo = useCallback(async () => {
    if (!nutritionist?.id || !callId) return;
    setLoading(true);
    await runSafe(async () => {
      const data = await api.callJoinInfo(nutritionist.id, callId);
      setJoinInfo(data);
    }, { fallback: "Could not start video call" });
    setLoading(false);
  }, [nutritionist?.id, callId, runSafe]);

  useEffect(() => {
    loadJoinInfo();
  }, [loadJoinInfo]);

  const handleLeave = () => {
    navigate("/dashboard/calls");
  };

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Preparing video call…</p>
      </div>
    );
  }

  if (!joinInfo) {
    return (
      <div className="page">
        <p>Could not start this call.</p>
        <Link to="/dashboard/calls" className="btn btn-secondary">
          Back to calls
        </Link>
      </div>
    );
  }

  return (
    <div className="page video-call-page">
      <div className="video-call-header">
        <div>
          <p className="topbar-eyebrow">Video consultation</p>
          <h2>{joinInfo.client_name || "Client call"}</h2>
          <p className="muted">Room: {joinInfo.room_name}</p>
        </div>
        <Link to="/dashboard/calls" className="btn btn-secondary">
          Leave
        </Link>
      </div>
      <JitsiMeetEmbed
        domain={joinInfo.domain}
        roomName={joinInfo.room_name}
        displayName={joinInfo.display_name}
        isModerator={joinInfo.is_moderator !== false}
        onLeave={handleLeave}
      />
    </div>
  );
}
