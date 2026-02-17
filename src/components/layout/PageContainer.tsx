import { cn } from "@/lib/utils";

export default function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto max-w-[430px] min-h-screen bg-gray-50 pb-24",
        className
      )}
    >
      {children}
    </div>
  );
}
