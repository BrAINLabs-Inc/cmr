const TITLE_WORDS = new Set(['prof', 'dr', 'mr', 'ms', 'mrs', 'emeritus', 'vidya', 'jyothi'])

// Fallback initials for an Avatar when a photo fails to load: strips
// common titles/honorifics so e.g. "Prof. Dilshani Dissanayake" becomes
// "DD" rather than "PD".
export function getInitials(fullName: string): string {
  const words = fullName
    .split(/\s+/)
    .map((w) => w.replace(/[.,]/g, ''))
    .filter((w) => w && !TITLE_WORDS.has(w.toLowerCase()) && w.length > 1)

  const initials = words
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  return initials || fullName.slice(0, 2).toUpperCase()
}
