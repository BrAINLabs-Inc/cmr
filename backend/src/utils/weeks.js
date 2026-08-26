export function currentWeekNumber({ course_start_date, total_weeks }) {
  const start = new Date(`${course_start_date}T00:00:00Z`);
  const now = new Date();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const elapsed = Math.floor((now.getTime() - start.getTime()) / msPerWeek) + 1;
  return Math.min(Math.max(elapsed, 1), total_weeks);
}

export function wordCount(text) {
  const trimmed = (text || '').trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
}

export function weekDueDate(courseStartDate, weekNumber) {
  const start = new Date(`${courseStartDate}T00:00:00Z`);
  const due = new Date(start);
  due.setUTCDate(due.getUTCDate() + weekNumber * 7 - 1);
  return due.toISOString().slice(0, 10);
}

export function extractPlainText(doc) {
  if (!doc || typeof doc !== 'object') return '';
  if (typeof doc.text === 'string') return doc.text;
  if (Array.isArray(doc.content)) return doc.content.map(extractPlainText).join(' ');
  return '';
}
