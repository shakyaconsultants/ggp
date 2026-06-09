import { useEffect, useMemo, useState } from "react";
import { useNutritionist } from "../../context/NutritionistContext";
import { api } from "../../api/client";
import { useApiFeedback } from "../../hooks/useApiFeedback";

function formatSlotTime(slotTime) {
  if (!slotTime) return "";
  const raw = String(slotTime);
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return raw;

  const hours = Number(match[1]);
  const minutes = match[2];
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes} ${period}`;
}

export default function Slots() {
  const { notifyError, notifySuccess } = useApiFeedback();
  const { nutritionist } = useNutritionist();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const availableCount = useMemo(
    () => slots.filter((slot) => slot.availability && !slot.is_booked).length,
    [slots]
  );

  const load = async () => {
    if (!nutritionist?.id) return;
    setLoading(true);
    try {
      const response = await api.getSlots(nutritionist.id, date);
      setSlots(response.slots || []);
    } catch (err) {
      if (err.status === 404) {
        setSlots([]);
      } else {
        notifyError(err, "Could not load availability");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [nutritionist?.id, date]);

  const toggleSlot = (slotId) => {
    setSlots((current) =>
      current.map((slot) => {
        if (slot.SlotID !== slotId || slot.is_booked) return slot;
        return { ...slot, availability: !slot.availability };
      })
    );
  };

  const saveAll = async () => {
    if (!nutritionist?.id) return;
    setSaving(true);
    try {
      const response = await api.updateSlots({
        nutritionist_id: nutritionist.id,
        date,
        slots: slots.map((slot) => ({
          slot_id: slot.SlotID,
          available: Boolean(slot.availability),
        })),
      });
      setSlots(response.slots || slots);
      notifySuccess("Availability saved for this date.");
    } catch (err) {
      notifyError(err, "Could not save availability");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Consultation slots</h1>
        <p className="muted">
          Choose the times clients can book on each day. Booked slots stay locked until the call is
          cancelled or completed.
        </p>
      </header>

      <div className="card panel slots-toolbar">
        <label className="form-field">
          <span>Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <div className="slots-toolbar-actions">
          <button type="button" className="btn btn-outline" onClick={load} disabled={loading}>
            Refresh
          </button>
          <button type="button" className="btn btn-primary" onClick={saveAll} disabled={saving || loading}>
            {saving ? "Saving…" : "Save availability"}
          </button>
        </div>
      </div>

      <div className="card panel">
        <div className="slots-summary">
          <strong>{availableCount}</strong>
          <span className="muted">open slots on {date}</span>
        </div>

        {loading ? (
          <p className="muted">Loading times…</p>
        ) : slots.length === 0 ? (
          <p className="muted">
            No consultation times found. Run <code>npm run db:seed-slots</code> in the API project.
          </p>
        ) : (
          <div className="slot-grid">
            {slots.map((slot) => {
              const active = Boolean(slot.availability);
              const booked = Boolean(slot.is_booked);
              const className = booked
                ? "slot-chip slot-chip-booked"
                : active
                  ? "slot-chip slot-chip-open"
                  : "slot-chip slot-chip-closed";

              return (
                <button
                  key={slot.SlotID}
                  type="button"
                  className={className}
                  disabled={booked}
                  onClick={() => toggleSlot(slot.SlotID)}
                  title={booked ? "Booked by a client" : active ? "Click to close" : "Click to open"}
                >
                  <span>{formatSlotTime(slot.SlotTime)}</span>
                  <small>{booked ? "Booked" : active ? "Open" : "Closed"}</small>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
