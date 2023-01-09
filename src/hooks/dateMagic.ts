export function epochToDate(epochDate: number): Date | null {
  if (epochDate === undefined) return null;
  let date = new Date(0);
  date.setUTCSeconds(epochDate);
  return date;
}

export function displayDate(date: Date): string {
  return date.toLocaleTimeString("hu", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
