import { locale } from '../locale';

const t = locale.it;

export type ItTicket = {
  id: number;
  category: string;
  title: string;
  details: string;
  status: string;
  source?: 'it' | 'portal-support';
};

export const IT_TICKETS_KEY = 'portal_plus1_it_tickets';

function isValidTicket(item: ItTicket): boolean {
  return Boolean(item.title?.trim() && item.details?.trim());
}

function demoTickets(): ItTicket[] {
  return [
    {
      id: 1,
      category: t.categories.access,
      title: t.demoTickets.accessTitle,
      details: t.demoTickets.accessDetails,
      status: t.statusInProgress,
      source: 'it',
    },
    {
      id: 2,
      category: t.categories.hardware,
      title: t.demoTickets.hardwareTitle,
      details: t.demoTickets.hardwareDetails,
      status: t.statusClosed,
      source: 'it',
    },
  ];
}

export function loadItTickets(): ItTicket[] {
  try {
    const raw = localStorage.getItem(IT_TICKETS_KEY);
    if (!raw) {
      const seed = demoTickets();
      localStorage.setItem(IT_TICKETS_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as ItTicket[];
    const valid = parsed.filter(isValidTicket);
    if (valid.length !== parsed.length) {
      localStorage.setItem(IT_TICKETS_KEY, JSON.stringify(valid));
    }
    return valid;
  } catch {
    return demoTickets();
  }
}

export function saveItTickets(tickets: ItTicket[]) {
  localStorage.setItem(IT_TICKETS_KEY, JSON.stringify(tickets));
}

export function addItTicket(input: Omit<ItTicket, 'id'>): ItTicket {
  const ticket: ItTicket = { ...input, id: Date.now() };
  const next = [ticket, ...loadItTickets()];
  saveItTickets(next);
  return ticket;
}

export function categoryLabel(category: string): string {
  if (category === 'access') return t.categories.access;
  if (category === 'hardware') return t.categories.hardware;
  if (category === 'software') return t.categories.software;
  if (category === 'portal') return t.categories.portal;
  return t.categories.software;
}
