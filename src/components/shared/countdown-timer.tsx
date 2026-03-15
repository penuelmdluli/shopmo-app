"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  endsAt: string;
  className?: string;
}

export function CountdownTimer({ endsAt, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(endsAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(endsAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  if (timeLeft.total <= 0) {
    return <span className={cn("text-sm text-red-500 font-medium", className)}>Expired</span>;
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <TimeBlock value={timeLeft.hours} label="h" />
      <span className="text-primary font-bold">:</span>
      <TimeBlock value={timeLeft.minutes} label="m" />
      <span className="text-primary font-bold">:</span>
      <TimeBlock value={timeLeft.seconds} label="s" />
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-0.5">
      <span className="bg-gray-900 text-white text-sm font-mono font-bold px-2 py-1 rounded min-w-[2rem] text-center">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function getTimeLeft(endsAt: string) {
  const total = new Date(endsAt).getTime() - Date.now();
  if (total <= 0) return { total: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    total,
    hours: Math.floor(total / (1000 * 60 * 60)),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}
