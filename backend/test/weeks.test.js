import { describe, expect, it } from 'vitest';
import { currentWeekNumber, wordCount, extractPlainText, weekDueDate } from '../src/utils/weeks.js';

describe('currentWeekNumber', () => {
  it('returns 1 on the course start date', () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(currentWeekNumber({ course_start_date: today, total_weeks: 12 })).toBe(1);
  });

  it('advances by one every 7 days', () => {
    const start = new Date();
    start.setUTCDate(start.getUTCDate() - 21);
    const course_start_date = start.toISOString().slice(0, 10);
    expect(currentWeekNumber({ course_start_date, total_weeks: 12 })).toBe(4);
  });

  it('clamps to total_weeks once the course is over', () => {
    const start = new Date();
    start.setUTCDate(start.getUTCDate() - 365);
    const course_start_date = start.toISOString().slice(0, 10);
    expect(currentWeekNumber({ course_start_date, total_weeks: 12 })).toBe(12);
  });

  it('never returns less than 1 for a future start date', () => {
    const start = new Date();
    start.setUTCDate(start.getUTCDate() + 30);
    const course_start_date = start.toISOString().slice(0, 10);
    expect(currentWeekNumber({ course_start_date, total_weeks: 12 })).toBe(1);
  });
});

describe('weekDueDate', () => {
  it('is the last day of that week\'s 7-day window', () => {
    expect(weekDueDate('2026-07-11', 1)).toBe('2026-07-17');
    expect(weekDueDate('2026-07-11', 2)).toBe('2026-07-24');
  });
});

describe('wordCount', () => {
  it('counts zero for empty or whitespace-only text', () => {
    expect(wordCount('')).toBe(0);
    expect(wordCount('   \n\t  ')).toBe(0);
    expect(wordCount(undefined)).toBe(0);
  });

  it('counts words separated by arbitrary whitespace', () => {
    expect(wordCount('hello world')).toBe(2);
    expect(wordCount('  hello   world  \n again ')).toBe(3);
  });
});

describe('extractPlainText', () => {
  it('returns empty string for an empty or missing document', () => {
    expect(extractPlainText(null)).toBe('');
    expect(extractPlainText({ type: 'doc', content: [] })).toBe('');
  });

  it('flattens nested TipTap nodes into plain text', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] },
        {
          type: 'bulletList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'world' }] }] },
          ],
        },
      ],
    };
    expect(extractPlainText(doc)).toBe('Hello world');
  });
});
