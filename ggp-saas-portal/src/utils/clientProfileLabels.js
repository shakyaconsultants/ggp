export function formatValue(value) {
  if (value === null || value === undefined || value === "") return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

export function formatDate(value) {
  const text = formatValue(value);
  if (!text) return null;
  return text.length >= 10 ? text.slice(0, 10) : text;
}

export function isProfileComplete(profile) {
  if (!profile) return false;
  if (Number(profile.onboarded) === 1) return true;
  return Boolean(
    profile.gender &&
      profile.dob &&
      profile.height &&
      profile.weight &&
      profile.goal
  );
}

/** Every field the client can fill in the mobile app — flat list for the portal. */
export const CLIENT_PROFILE_FIELDS = [
  { key: "name", label: "Full name", source: "account", section: "personal" },
  { key: "email", label: "Email", source: "account", section: "personal" },
  { key: "gender", label: "Gender", section: "personal" },
  { key: "dob", label: "Date of birth", format: formatDate, section: "personal" },
  { key: "occupation", label: "Occupation", section: "personal" },
  { key: "height", label: "Height", suffix: " cm", section: "body" },
  { key: "weight", label: "Current weight", suffix: " kg", section: "body" },
  { key: "targetWeight", label: "Target weight", suffix: " kg", section: "body" },
  { key: "bodyfat", label: "Body fat", suffix: "%", section: "body" },
  { key: "workout", label: "Exercise frequency", section: "lifestyle" },
  { key: "food", label: "Diet preference", section: "lifestyle" },
  { key: "medical", label: "Medical conditions", multiline: true, section: "health" },
  { key: "goal", label: "Health goal", multiline: true, section: "health" },
];

export const PROFILE_SECTIONS = [
  {
    id: "personal",
    title: "Personal information",
    description: "Basic identity details from the mobile app.",
  },
  {
    id: "body",
    title: "Body metrics",
    description: "Measurements and composition targets.",
  },
  {
    id: "lifestyle",
    title: "Lifestyle",
    description: "Activity level and dietary preferences.",
  },
  {
    id: "health",
    title: "Goals & medical",
    description: "Health goals and conditions to consider in planning.",
  },
];

export function getProfileSections(profile) {
  return PROFILE_SECTIONS.map((section) => {
    const fields = CLIENT_PROFILE_FIELDS.filter((f) => f.section === section.id)
      .map((field) => ({
        ...field,
        value: fieldDisplayValue(profile, field),
      }))
      .filter((field) => field.value != null);
    return { ...section, fields };
  }).filter((section) => section.fields.length > 0);
}

export function profileCompletionPercent(profile) {
  if (!profile) return 0;
  const trackable = CLIENT_PROFILE_FIELDS.filter((f) => f.key !== "name" && f.key !== "email");
  const filled = trackable.filter((f) => fieldDisplayValue(profile, f) != null).length;
  return Math.round((filled / trackable.length) * 100);
}

export function fieldDisplayValue(profile, field) {
  const raw = profile?.[field.key];
  let base;
  if (field.format) {
    base = field.format(raw);
  } else {
    base = formatValue(raw);
  }
  if (!base) return null;
  if (field.suffix) return `${base}${field.suffix}`;
  return base;
}

/** Returns only fields the client has actually filled in. */
export function getFilledProfileFields(profile) {
  if (!profile) return [];
  return CLIENT_PROFILE_FIELDS.map((field) => ({
    ...field,
    value: fieldDisplayValue(profile, field),
  })).filter((field) => field.value != null);
}

export function clientInitials(name, email) {
  const n = (name || "").trim();
  if (n.length >= 2) return n.slice(0, 2).toUpperCase();
  if (n.length === 1) return n.toUpperCase();
  return (email || "?")[0].toUpperCase();
}
