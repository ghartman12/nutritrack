import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "ai" | "custom";
  className?: string;
  tooltip?: string;
}

export default function Badge({ children, variant = "default", className, tooltip }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    ai: "bg-purple-100 text-purple-800",
    custom: "bg-blue-100 text-blue-800",
  };

  return (
    <span
      className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant], className)}
      title={tooltip}
    >
      {children}
    </span>
  );
}
