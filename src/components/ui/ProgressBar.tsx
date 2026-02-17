import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  label?: string;
  unit?: string;
  showValue?: boolean;
  className?: string;
}

export default function ProgressBar({
  value,
  max,
  color = "bg-emerald-500",
  label,
  unit,
  showValue = true,
  className,
}: ProgressBarProps) {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm text-gray-600">{label}</span>}
          {showValue && (
            <span className="text-sm font-medium text-gray-900">
              {Math.round(value)} / {Math.round(max)}{unit ? unit : ""}
            </span>
          )}
        </div>
      )}
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
