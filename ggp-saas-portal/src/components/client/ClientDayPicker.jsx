export default function ClientDayPicker({ label = "Select day", days, selectedKey, onSelect }) {
  return (
    <div className="client-day-picker">
      {label && <p className="client-day-picker-label">{label}</p>}
      <div className="client-day-picker-strip" role="tablist" aria-label={label}>
        {days.map((day) => (
          <button
            key={day.key}
            type="button"
            role="tab"
            aria-selected={selectedKey === day.key}
            className={[
              "client-day-pill",
              selectedKey === day.key ? "active" : "",
              day.isToday ? "today" : "",
              day.count > 0 ? "filled" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onSelect(day.key)}
          >
            <span className="client-day-pill-short">{day.short}</span>
            <span className="client-day-pill-label">{day.label}</span>
            {day.sublabel && <span className="client-day-pill-sub">{day.sublabel}</span>}
            {day.count > 0 && (
              <span className="client-day-pill-count" aria-label={`${day.count} items`}>
                {day.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
