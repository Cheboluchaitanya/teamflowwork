import { cn } from "@/utils/utils";
import {
  Clock, Loader2, CheckCircle2, XCircle, ClipboardCheck, Play,
} from "lucide-react";

const MAP = {
  pending:     { label: "Pending",     cls: "bg-status-pending/15 text-status-pending border-status-pending/30",       Icon: Clock },
  "in-progress":{ label: "In Progress", cls: "bg-status-progress/15 text-status-progress border-status-progress/30",  Icon: Loader2 },
  accepted:    { label: "Accepted",    cls: "bg-status-progress/15 text-status-progress border-status-progress/30",    Icon: Play },
  submitted:   { label: "Submitted",   cls: "bg-primary/15 text-primary border-primary/30",                            Icon: ClipboardCheck },
  completed:   { label: "Completed",   cls: "bg-status-completed/15 text-status-completed border-status-completed/30", Icon: CheckCircle2 },
  rejected:    { label: "Rejected",    cls: "bg-status-rejected/15 text-status-rejected border-status-rejected/30",    Icon: XCircle },
};

export default function StatusBadge({ status }) {
  const m = MAP[status] ?? MAP.pending;
  const Icon = m.Icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold flex-shrink-0", m.cls)}>
      <Icon className="h-3 w-3" />
      {m.label}
    </span>
  );
}
