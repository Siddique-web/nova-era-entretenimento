import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { ReservationStatus } from '../types';

const MAP = {
  pendente: { label: 'Pendente', cls: 'bg-[#FFB703] text-black', Icon: Clock },
  confirmado: { label: 'Confirmado', cls: 'bg-[#13A750] text-white', Icon: CheckCircle2 },
  rejeitado: { label: 'Recusado', cls: 'bg-black text-white', Icon: XCircle },
} as const;

export default function StatusBadge({ status, large = false }: { status: ReservationStatus; large?: boolean }) {
  const { label, cls, Icon } = MAP[status];
  return (
    <span
      className={`inline-flex items-center gap-2 font-extrabold uppercase tracking-wider ${cls} ${
        large ? 'px-4 py-2 text-base' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <Icon size={large ? 20 : 14} aria-hidden="true" />
      {label}
    </span>
  );
}
