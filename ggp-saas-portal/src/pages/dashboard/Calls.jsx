import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { useNutritionist } from "../../context/NutritionistContext";
import { useApiFeedback } from "../../hooks/useApiFeedback";

function formatCallWhen(call) {
  const date = call.scheduled_date_label || call.scheduled_date || "";
  const time = call.scheduled_time_label || call.scheduled_time || "";
  if (typeof time === "string" && time.length >= 5 && !call.scheduled_time_label) {
    return `${date} · ${time.slice(0, 5)}`;
  }
  return `${date} · ${time}`.replace(/ · $/, "");
}

function isUpcoming(call) {
  return !["completed", "cancelled"].includes(call.status);
}

export default function Calls() {
  const { nutritionist } = useNutritionist();
  const { runSafe, notifySuccess, notifyError } = useApiFeedback();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCalls = useCallback(async () => {
    if (!nutritionist?.id) return;
    setLoading(true);
    await runSafe(async () => {
      const data = await api.nutritionistCalls(nutritionist.id);
      setCalls(data.calls || []);
    }, { fallback: "Could not load scheduled calls" });
    setLoading(false);
  }, [nutritionist?.id, runSafe]);

  useEffect(() => {
    loadCalls();
  }, [loadCalls]);

  const upcoming = useMemo(() => calls.filter(isUpcoming), [calls]);
  const past = useMemo(() => calls.filter((call) => !isUpcoming(call)), [calls]);

  const updateStatus = async (callId, status) => {
    try {
      await api.updateNutritionistCall(nutritionist.id, callId, { status });
      notifySuccess(status === "completed" ? "Call marked completed." : "Call cancelled.");
      loadCalls();
    } catch (err) {
      notifyError(err, "Could not update call");
    }
  };

  const renderCallRow = (call) => {
    const nutritionistCanJoin =
      call.in_join_window && isUpcoming(call);
    const showJoin = nutritionistCanJoin || call.can_join;

    return (
    <li key={call.id} className="call-list-item">
      <div>
        <strong>{call.client_name || `Client #${call.user_id}`}</strong>
        <p className="muted call-list-meta">
          {formatCallWhen(call)} · {call.status}
        </p>
        {call.waiting_for_nutritionist && isUpcoming(call) && (
          <p className="muted call-list-meta">You join first as host/moderator.</p>
        )}
        {!showJoin && call.join_window_message && isUpcoming(call) && (
          <p className="muted call-list-meta">{call.join_window_message}</p>
        )}
      </div>
      <div className="call-list-actions">
        {showJoin && isUpcoming(call) ? (
          <Link to={`/dashboard/calls/${call.id}`} className="btn btn-primary btn-sm">
            Join as host
          </Link>
        ) : (
          <span className="btn btn-outline btn-sm" aria-disabled="true">
            Join locked
          </span>
        )}
        {isUpcoming(call) && (
          <>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => updateStatus(call.id, "completed")}
            >
              Complete
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => updateStatus(call.id, "cancelled")}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </li>
    );
  };

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <h1>Consultation calls</h1>
          <p className="muted">
            Clients book from the mobile app. Join opens 15 minutes before the scheduled time.
          </p>
        </div>
        <button type="button" className="btn btn-outline" onClick={loadCalls}>
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="muted">Loading calls…</p>
      ) : calls.length === 0 ? (
        <div className="card panel">
          <p>No scheduled calls yet. Set open slots under Consultation slots, then have a client book from the app.</p>
        </div>
      ) : (
        <>
          <section className="card panel">
            <h2>Upcoming</h2>
            {upcoming.length === 0 ? (
              <p className="muted">No upcoming calls.</p>
            ) : (
              <ul className="simple-list">{upcoming.map(renderCallRow)}</ul>
            )}
          </section>

          {past.length > 0 && (
            <section className="card panel">
              <h2>Past</h2>
              <ul className="simple-list">{past.map(renderCallRow)}</ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
