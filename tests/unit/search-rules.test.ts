import { describe, expect, it } from 'vitest';
import { getCompletedWeekRange, parseLocalDate } from '@/src/lib/dates';
import { isGhosted } from '@/src/lib/ghosted';
import { isInterviewType } from '@/src/lib/interview-types';
import { formatWorkSearchReport } from '@/src/lib/insights-report';

const now = new Date('2026-11-16T12:00:00');

function company(overrides: Partial<{
  id: string;
  status: string;
  status_changed_at: string | null;
  created_at: string | null;
}> = {}) {
  return {
    id: 'co',
    status: 'applied',
    status_changed_at: '2026-08-01T12:00:00.000Z',
    created_at: '2026-08-01T12:00:00.000Z',
    ...overrides,
  };
}

describe('isGhosted', () => {
  it('marks an applied company with no recent activity as ghosted', () => {
    expect(isGhosted(company(), [], [], now)).toBe(true);
  });

  it('does not mark a company that heard back within two months', () => {
    expect(
      isGhosted(
        company(),
        [{ company_id: 'co', date: '2026-11-01', type: 'screen' }],
        [],
        now
      )
    ).toBe(false);
  });

  it('treats a newer message as activity', () => {
    expect(
      isGhosted(
        company(),
        [{ company_id: 'co', date: '2026-08-02', type: 'application' }],
        [{ company_id: 'co', date: '2026-11-02' }],
        now
      )
    ).toBe(false);
  });

  it('ignores statuses that are not still in play', () => {
    expect(isGhosted(company({ status: 'rejected' }), [], [], now)).toBe(false);
    expect(isGhosted(company({ status: 'watchlist' }), [], [], now)).toBe(false);
  });

  it('does not call a company ghosted after a rejection was logged', () => {
    expect(
      isGhosted(
        company({ status: 'active' }),
        [{ company_id: 'co', date: '2026-08-01', type: 'rejection' }],
        [],
        now
      )
    ).toBe(false);
  });
});

describe('dates', () => {
  it('parses a date-only string as a local calendar day', () => {
    const date = parseLocalDate('2026-11-10');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(10);
    expect(date.getDate()).toBe(10);
  });

  it('uses Sunday–Saturday weeks, with weeksAgo=1 before the current week', () => {
    const previous = getCompletedWeekRange(1);
    const current = getCompletedWeekRange(0);

    expect(previous.start.getDay()).toBe(0);
    expect(previous.end.getDay()).toBe(6);
    expect(previous.end.getTime()).toBeGreaterThan(previous.start.getTime());
    expect(current.start.getTime()).toBe(previous.start.getTime() + 7 * 24 * 60 * 60 * 1000);
    expect(previous.label).toContain('–');
  });
});

describe('isInterviewType', () => {
  it('recognizes interview types and ignores other log entries', () => {
    expect(isInterviewType('Technical')).toBe(true);
    expect(isInterviewType('phone screen')).toBe(false);
    expect(isInterviewType('application')).toBe(false);
    expect(isInterviewType('screen')).toBe(true);
  });
});

describe('formatWorkSearchReport', () => {
  it('explains an empty week', () => {
    const text = formatWorkSearchReport('Nov 8, 2026 – Nov 14, 2026', []);
    expect(text).toContain('Week of Nov 8, 2026 – Nov 14, 2026');
    expect(text).toContain('No activities logged');
    expect(text.toLowerCase()).not.toContain('claim');
  });

  it('lists company, method, and who you talked to', () => {
    const text = formatWorkSearchReport('Nov 8, 2026 – Nov 14, 2026', [
      {
        id: '1',
        date: '2026-11-10',
        companyName: 'Gryzzl',
        companyId: 'g',
        role: 'Senior Software Engineer',
        activityType: 'Technical interview',
        method: 'Video/phone interview',
        detail: 'with Ben Wyatt',
      },
    ]);

    expect(text).toContain('Nov 10, 2026 — Gryzzl — Video/phone interview — Technical interview');
    expect(text).toContain('Senior Software Engineer');
    expect(text).toContain('with Ben Wyatt');
  });
});
