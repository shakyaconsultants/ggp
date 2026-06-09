export const CLIENT_TABS = [
  { id: "overview", label: "Overview" },
  { id: "profile", label: "Health profile" },
  { id: "diets", label: "Diet plans" },
  { id: "exercises", label: "Exercises" },
  { id: "messages", label: "Messages" },
];

export default function ClientProfileTabs({ active, onChange, counts = {} }) {
  return (
    <nav className="client-profile-tabs" aria-label="Client profile sections">
      {CLIENT_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={active === tab.id ? "client-tab active" : "client-tab"}
          onClick={() => onChange(tab.id)}
          aria-current={active === tab.id ? "page" : undefined}
        >
          {tab.label}
          {counts[tab.id] != null && (
            <span className="client-tab-count">{counts[tab.id]}</span>
          )}
        </button>
      ))}
    </nav>
  );
}
