export function updateWorkDraft(work, fields, language) {
  const descriptions = work.short && typeof work.short === 'object' ? work.short : {};
  return { ...work, ...fields, short: { ...descriptions, [language]: fields.short } };
}
