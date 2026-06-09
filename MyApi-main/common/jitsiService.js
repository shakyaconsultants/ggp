function getJitsiDomain() {
  return (process.env.JITSI_DOMAIN || "meet.jit.si").replace(/^https?:\/\//, "");
}

function buildRoomName(callId) {
  const prefix = process.env.JITSI_ROOM_PREFIX || "goodgut-call";
  return `${prefix}-${callId}`;
}

function buildMeetUrl(roomName, { displayName, isModerator = false } = {}) {
  const domain = getJitsiDomain();
  const base = `https://${domain}/${encodeURIComponent(roomName)}`;
  const params = new URLSearchParams();

  params.set("config.prejoinPageEnabled", "false");
  params.set("config.enableWelcomePage", "false");
  params.set("config.disableDeepLinking", "true");
  // Prevent participants from claiming moderator after nutritionist joins.
  params.set("config.disableGrantModerator", "true");

  if (!isModerator) {
    params.set("config.startSilent", "false");
  }

  if (displayName) {
    params.set("userInfo.displayName", displayName);
  }

  return `${base}#${params.toString()}`;
}

function buildJoinPayload(callId, displayName, { isModerator = false } = {}) {
  const roomName = buildRoomName(callId);
  const domain = getJitsiDomain();

  return {
    call_id: Number(callId),
    room_name: roomName,
    domain,
    display_name: displayName || "Guest",
    is_moderator: isModerator,
    role: isModerator ? "moderator" : "participant",
    meet_url: buildMeetUrl(roomName, { displayName, isModerator }),
  };
}

module.exports = {
  getJitsiDomain,
  buildRoomName,
  buildMeetUrl,
  buildJoinPayload,
};
