import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, minimumFractionDigits: 0 }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function statusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    draft: 'badge-draft',
    confirmed: 'badge-confirmed',
    delivered: 'badge-delivered',
    closed: 'badge-closed',
    cancelled: 'badge-cancelled',
    ordered: 'badge-ordered',
    received: 'badge-received',
    in_progress: 'badge-in_progress',
    completed: 'badge-completed',
    ready: 'badge-ready',
  };
  return map[status.toLowerCase()] || 'badge-draft';
}

export function truncate(str: string, maxLen = 30): string {
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}
