import ClientDayPicker from "./ClientDayPicker";
import ClientDayEditorPanel from "./ClientDayEditorPanel";

export default function ClientDayScheduleLayout({
  pickerLabel,
  days,
  selectedKey,
  onSelectDay,
  weekNav,
  editorTitle,
  editorSubtitle,
  editorCount,
  editorActions,
  editorEmptyHint,
  children,
}) {
  return (
    <div className="client-day-schedule">
      {weekNav && (
        <div className="client-week-nav card panel">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={weekNav.onPrev}
            aria-label="Previous week"
          >
            ← Prev
          </button>
          <span className="client-week-nav-label">{weekNav.label}</span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={weekNav.onNext}
            aria-label="Next week"
          >
            Next →
          </button>
          {weekNav.onToday && (
            <button type="button" className="btn btn-outline btn-sm" onClick={weekNav.onToday}>
              Today
            </button>
          )}
        </div>
      )}

      <ClientDayPicker
        label={pickerLabel}
        days={days}
        selectedKey={selectedKey}
        onSelect={onSelectDay}
      />

      <ClientDayEditorPanel
        title={editorTitle}
        subtitle={editorSubtitle}
        count={editorCount}
        actions={editorActions}
        emptyHint={editorEmptyHint}
      >
        {children}
      </ClientDayEditorPanel>
    </div>
  );
}
