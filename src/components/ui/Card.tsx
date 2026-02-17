import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "sm" | "md" | "lg";
}

export default function Card({ className, padding = "md", children, ...props }: CardProps) {
  const paddings = { sm: "p-4", md: "p-6", lg: "p-8" };
  return (
    <div
      className={cn("rounded-2xl bg-white shadow-sm border border-gray-100 transition-shadow duration-200 hover:shadow-md", paddings[padding], className)}
      {...props}
    >
      {children}
    </div>
  );
}
