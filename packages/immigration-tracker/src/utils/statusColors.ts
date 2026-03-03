import type { CaseStatus } from '@mycircle/shared';

const STATUS_COLORS: Record<string, { bg: string; darkBg: string; text: string; darkText: string }> = {
  'Case Was Received': { bg: 'bg-blue-100', darkBg: 'dark:bg-blue-900/30', text: 'text-blue-800', darkText: 'dark:text-blue-200' },
  'Case Was Approved': { bg: 'bg-green-100', darkBg: 'dark:bg-green-900/30', text: 'text-green-800', darkText: 'dark:text-green-200' },
  'Case Was Denied': { bg: 'bg-red-100', darkBg: 'dark:bg-red-900/30', text: 'text-red-800', darkText: 'dark:text-red-200' },
  'Case Was Transferred': { bg: 'bg-yellow-100', darkBg: 'dark:bg-yellow-900/30', text: 'text-yellow-800', darkText: 'dark:text-yellow-200' },
  'Request for Evidence Was Sent': { bg: 'bg-orange-100', darkBg: 'dark:bg-orange-900/30', text: 'text-orange-800', darkText: 'dark:text-orange-200' },
  'Response To RFE Was Received': { bg: 'bg-teal-100', darkBg: 'dark:bg-teal-900/30', text: 'text-teal-800', darkText: 'dark:text-teal-200' },
  'Card Was Mailed To Me': { bg: 'bg-indigo-100', darkBg: 'dark:bg-indigo-900/30', text: 'text-indigo-800', darkText: 'dark:text-indigo-200' },
  'Card Was Picked Up By The United States Postal Service': { bg: 'bg-indigo-100', darkBg: 'dark:bg-indigo-900/30', text: 'text-indigo-800', darkText: 'dark:text-indigo-200' },
  'Card Was Delivered To Me': { bg: 'bg-green-100', darkBg: 'dark:bg-green-900/30', text: 'text-green-800', darkText: 'dark:text-green-200' },
  'Case Is Ready To Be Scheduled For An Interview': { bg: 'bg-purple-100', darkBg: 'dark:bg-purple-900/30', text: 'text-purple-800', darkText: 'dark:text-purple-200' },
  'Interview Was Scheduled': { bg: 'bg-purple-100', darkBg: 'dark:bg-purple-900/30', text: 'text-purple-800', darkText: 'dark:text-purple-200' },
  'Interview Was Completed': { bg: 'bg-cyan-100', darkBg: 'dark:bg-cyan-900/30', text: 'text-cyan-800', darkText: 'dark:text-cyan-200' },
  'New Card Is Being Produced': { bg: 'bg-emerald-100', darkBg: 'dark:bg-emerald-900/30', text: 'text-emerald-800', darkText: 'dark:text-emerald-200' },
  'Case Was Updated To Show Fingerprints Were Taken': { bg: 'bg-sky-100', darkBg: 'dark:bg-sky-900/30', text: 'text-sky-800', darkText: 'dark:text-sky-200' },
  'Expedite Request Received': { bg: 'bg-amber-100', darkBg: 'dark:bg-amber-900/30', text: 'text-amber-800', darkText: 'dark:text-amber-200' },
  'Unknown': { bg: 'bg-gray-100', darkBg: 'dark:bg-gray-800', text: 'text-gray-800', darkText: 'dark:text-gray-200' },
};

export function getStatusColors(status: CaseStatus) {
  return STATUS_COLORS[status] ?? STATUS_COLORS['Unknown'];
}

export function getStatusBadgeClass(status: CaseStatus): string {
  const colors = getStatusColors(status);
  return `${colors.bg} ${colors.darkBg} ${colors.text} ${colors.darkText}`;
}
