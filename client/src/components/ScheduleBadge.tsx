import { cn } from "@/lib/utils";

interface ScheduleBadgeProps {
  type: "lab1" | "lab2" | "lec";
  children: React.ReactNode;
  className?: string;
}

const ScheduleBadge = ({ type, children, className }: ScheduleBadgeProps) => {
  const variants = {
    lab1: "bg-schedule-lab1 text-schedule-lab1-foreground",
    lab2: "bg-schedule-lab2 text-schedule-lab2-foreground",
    lec: "bg-schedule-lec text-schedule-lec-foreground",
  };

  return (
    <span
      className={cn(
        "inline-block px-2 py-1 text-xs font-medium rounded",
        variants[type],
        className
      )}
    >
      {children}
    </span>
  );
};

export default ScheduleBadge;