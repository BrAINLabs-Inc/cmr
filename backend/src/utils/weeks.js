/**
 * Derives the current course week (1-indexed, clamped to total_weeks) from
 * course_settings.course_start_date, and the word count of free-text content.
 */
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
