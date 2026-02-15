import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatNumber(n: number, decimals = 0): string {
  return n.toFixed(decimals);
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function todayDateString(): string {
  return formatDate(new Date());
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}
