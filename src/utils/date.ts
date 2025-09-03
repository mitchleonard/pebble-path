export function todayISO(): string {
  const tzOffsetMs = new Date().getTimezoneOffset() * 60 * 1000;
  const localISO = new Date(Date.now() - tzOffsetMs).toISOString().slice(0, 10);
  return localISO;
}

export function startOfWeekISO(dateISO: string): string {
  const d = new Date(dateISO + 'T00:00:00');
  const day = d.getDay();
  const diff = (day + 6) % 7; // Monday=0
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}

export function toDisplay(dateISO: string): string {
  const d = new Date(dateISO + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function isTuesdayISO(dateISO: string): boolean {
  const d = new Date(dateISO + 'T00:00:00');
  return d.getDay() === 2; // 0=Sun, 1=Mon, 2=Tue
}

export function isWednesdayISO(dateISO: string): boolean {
  const d = new Date(dateISO + 'T00:00:00');
  return d.getDay() === 3; // 0=Sun, 1=Mon, 2=Tue, 3=Wed
}

export function isTuesdayOrWednesdayISO(dateISO: string): boolean {
  const d = new Date(dateISO + 'T00:00:00');
  const day = d.getDay();
  return day === 2 || day === 3; // Tuesday or Wednesday
}

export function toFormattedDate(dateISO: string): string {
  const d = new Date(dateISO + 'T00:00:00');
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  };
  return d.toLocaleDateString(undefined, options);
}

export function addDaysISO(dateISO: string, deltaDays: number): string {
  const d = new Date(dateISO + 'T00:00:00');
  d.setDate(d.getDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}


