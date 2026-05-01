import { useEffect, useState } from "react";

type ToastMsg = { id: number; text: string; tone: "default" | "green" | "red" };

let nextId = 1;
const listeners = new Set<(t: ToastMsg) => void>();

export function showToast(text: string, tone: ToastMsg["tone"] = "default") {
  const t = { id: nextId++, text, tone };
  listeners.forEach((l) => l(t));
}

export function Toast() {
  const [current, setCurrent] = useState<ToastMsg | null>(null);

  useEffect(() => {
    const l = (t: ToastMsg) => {
      setCurrent(t);
      setTimeout(() => setCurrent((c) => (c?.id === t.id ? null : c)), 2200);
    };
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  if (!current) return null;
  const border =
    current.tone === "green"
      ? "border-l-ok"
      : current.tone === "red"
      ? "border-l-danger"
      : "border-l-brand";

  return (
    <div
      className={`fixed bottom-[90px] left-1/2 -translate-x-1/2 z-[300] bg-ink text-white rounded-full px-5 py-3 text-[13px] font-bold border-l-[3px] ${border} max-w-[92vw] text-center pointer-events-none`}
    >
      {current.text}
    </div>
  );
}
