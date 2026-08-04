"use client";

import { useEffect, useState } from "react";

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
};

function diff(target: number): Remaining {
  const ms = target - Date.now();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: false,
  };
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-3xl font-bold tabular-nums text-broadcast sm:text-4xl">
        {value.toString().padStart(2, "0")}
      </span>
      <span className="text-[0.5rem] font-bold uppercase tracking-[0.2em] text-muted sm:text-[0.625rem]">
        {label}
      </span>
    </div>
  );
}

export default function Countdown({ deadlineIso }: { deadlineIso: string }) {
  const target = new Date(deadlineIso).getTime();
  // Start null to avoid SSR/client hydration mismatch; fill in after mount.
  const [rem, setRem] = useState<Remaining | null>(null);

  useEffect(() => {
    setRem(diff(target));
    const id = setInterval(() => setRem(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!rem) {
    // Reserve space before hydration so layout doesn't jump.
    return <div className="h-[52px] sm:h-[60px]" aria-hidden />;
  }

  if (rem.done) {
    return (
      <span className="rarity-badge">Registration closed</span>
    );
  }

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      {rem.days > 0 && (
        <>
          <Unit value={rem.days} label="Days" />
          <span className="font-display text-2xl text-accent">:</span>
        </>
      )}
      <Unit value={rem.hours} label="Hrs" />
      <span className="font-display text-2xl text-accent">:</span>
      <Unit value={rem.minutes} label="Min" />
      <span className="font-display text-2xl text-accent">:</span>
      <Unit value={rem.seconds} label="Sec" />
    </div>
  );
}
