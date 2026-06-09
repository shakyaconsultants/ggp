import { getProfileSections } from "../../utils/clientProfileLabels";

export default function ClientHealthTab({ profile }) {
  const sections = getProfileSections(profile);

  if (sections.length === 0) {
    return (
      <div className="client-tab-panel">
        <div className="client-empty-state card panel">
          <h3>No health profile yet</h3>
          <p>
            When your client completes their profile in the Good Gut mobile app, every field
            they fill will appear here — grouped by personal info, body metrics, lifestyle,
            and health goals.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-tab-panel client-health-sections">
      {sections.map((section) => (
        <section key={section.id} className="card panel client-health-section">
          <header className="client-section-head">
            <h3>{section.title}</h3>
            <p className="muted">{section.description}</p>
          </header>
          <div className="table-wrap">
            <table className="data-table client-details-table">
              <tbody>
                {section.fields.map((field) => (
                  <tr key={field.key}>
                    <td className="client-field-label">{field.label}</td>
                    <td className={field.multiline ? "client-field-value-multiline" : ""}>
                      {field.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
