import { Event } from '../../ui/cards';

// Expect Ok envelope: { ok: true, data: { items: [...] } }
export function mapCalendar(resp: any): Event[] {
  const items = resp?.data?.items || resp?.items || [];
  return items.map((it: any) => ({
    title: it.summary || it.title || 'Etkinlik',
    start: it.start?.dateTime || it.start || new Date().toISOString(),
    end: it.end?.dateTime || it.end,
    location: it.location,
  }));
}

