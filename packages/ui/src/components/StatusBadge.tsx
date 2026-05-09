type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

const toneClasses: Record<StatusTone, string> = {
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  danger: 'bg-red-500/15 text-red-300 border-red-500/30',
  neutral: 'bg-lv-slate text-lv-mist border-lv-slate'
};

export function StatusBadge({ label, tone = 'neutral' }: { label: string; tone?: StatusTone }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}>{label}</span>;
}
