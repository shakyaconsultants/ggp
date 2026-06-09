export default function ClientDayEditorPanel({
  title,
  subtitle,
  count,
  actions,
  children,
  emptyHint,
}) {
  return (
    <section className="card panel client-day-editor">
      <header className="client-day-editor-head">
        <div>
          <h3>{title}</h3>
          {subtitle && <p className="muted client-day-editor-sub">{subtitle}</p>}
        </div>
        <div className="client-day-editor-meta">
          {count != null && (
            <span className="client-day-editor-count">
              {count} item{count !== 1 ? "s" : ""}
            </span>
          )}
          {actions}
        </div>
      </header>
      <div className="client-day-editor-body">
        {children || (emptyHint && <p className="muted">{emptyHint}</p>)}
      </div>
    </section>
  );
}
