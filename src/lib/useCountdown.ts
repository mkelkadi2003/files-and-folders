import { useCallback, useEffect, useRef, useState } from "react";

/** Simple countdown timer. Calls onEnd once when reaching 0. */
export function useCountdown(seconds: number, onEnd?: () => void) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  const endRef = useRef(onEnd);
  endRef.current = onEnd;

  useEffect(() => {
    if (!running) return;
    if (left <= 0) {
      setRunning(false);
      endRef.current?.();
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [running, left]);

  const start = useCallback((s?: number) => {
    setLeft(s ?? seconds);
    setRunning(true);
  }, [seconds]);
  const stop = useCallback(() => setRunning(false), []);
  const resume = useCallback(() => setRunning(true), []);

  return { left, running, start, stop, resume, setLeft };
}

export function fmt(s: number) {
  const m = Math.floor(Math.max(0, s) / 60);
  const r = Math.max(0, s) % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
