"use client";
import Link from "next/link";

export default function QuickLogButtons() {
  const buttons = [
    { href: "/log?tab=food", label: "Log Food", icon: "🍽️" },
    { href: "/log?tab=exercise", label: "Log Exercise", icon: "🏃" },
    { href: "/log?tab=weight", label: "Log Weight", icon: "⚖️" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {buttons.map((btn) => (
        <Link
          key={btn.href}
          href={btn.href}
          className="flex flex-col items-center gap-1.5 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all duration-200 hover:shadow-md"
        >
          <span className="text-2xl">{btn.icon}</span>
          <span className="text-xs font-medium text-gray-700">{btn.label}</span>
        </Link>
      ))}
    </div>
  );
}
