import { Email } from '../../ui/cards';

export function mapGmailSummary(resp: any): Email[] {
  const items = resp?.data?.items || resp?.items || [];
  return items.map((it: any) => ({
    subject: it.subject || it.snippet?.slice(0, 64) || 'E-posta',
    from: it.from || it.sender || 'unknown',
    date: it.date || it.internalDate,
    preview: it.preview || it.snippet,
  }));
}

