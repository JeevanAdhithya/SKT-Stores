import { useEffect, useState } from "react";

type Tone = "default" | "green" | "red" | "black" | "blue";
type ToastMsg = { id: number; text: string; tone: Tone };

let nextId = 1;
const listeners = new Set<(t: ToastMsg) => void>();

export function showToast(text: string, tone: Tone = "default") {
  const t = { id: nextId++, text, tone };
  listeners.forEach((l) => l(t));
}

export function Toast() {
  const [current, setCurrent] = useState<ToastMsg | null>(null);

  useEffect(() => {
    const l = (t: ToastMsg) => {
      setCurrent(t);
      setTimeout(() => setCurrent((c) => (c?.id === t.id ? null : c)), 3000);
    };
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);

  if (!current) return null;

  const styles: Record<Tone, string> = {
    green:   "bg-green-600 text-white border-l-green-400",
    red:     "bg-red-600 text-white border-l-red-400",
    black:   "bg-gray-900 text-white border-l-gray-500",
    blue:    "bg-blue-600 text-white border-l-blue-400",
    default: "bg-gray-800 text-white border-l-brand",
  };

  return (
    <div className={`fixed bottom-[90px] left-1/2 -translate-x-1/2 z-[300] rounded-2xl px-6 py-3.5 text-[13px] font-bold border-l-4 max-w-[92vw] text-center shadow-2xl animate-in slide-in-from-bottom-4 duration-200 ${styles[current.tone]}`}>
      {current.text}
    </div>
  );
}
