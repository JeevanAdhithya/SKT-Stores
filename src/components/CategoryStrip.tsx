export const CAT_IC: Record<string, string> = {
  All: "🍽️",
  Burgers: "🍔",
  Pizza: "🍕",
  Drinks: "🥤",
  Salads: "🥗",
  Desserts: "🍰",
  Snacks: "🍟",
  Sandwiches: "🥪",
  Wraps: "🌯",
  "Rice & Biryani": "🍛",
  "South Indian": "🥘",
  Beverages: "☕",
  Other: "🍴",
};

type Props = { categories: string[]; current: string; onChange: (c: string) => void };

export function CategoryStrip({ categories, current, onChange }: Props) {
  return (
    <div className="flex gap-3 px-4 md:px-0 pb-6 overflow-x-auto scrollbar-none snap-x snap-mandatory">
      {categories.map((c) => {
        const active = c === current;
        return (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`group flex flex-col items-center gap-1.5 rounded-[18px] px-4 py-2.5 cursor-pointer flex-shrink-0 min-w-[72px] border transition-all duration-300 snap-center ${
              active
                ? "bg-gradient-to-br from-brand to-brand-glow border-brand shadow-[0_8px_16px_-6px_rgba(232,69,10,0.4)] text-white scale-105"
                : "bg-surface/80 backdrop-blur-md border-line/50 text-muted-text hover:border-brand/40 hover:bg-surface hover:-translate-y-0.5 hover:shadow-sm"
            }`}
          >
            <span className={`text-[24px] transform transition-transform duration-300 ${active ? "scale-110 drop-shadow-md" : "group-hover:scale-110"}`}>
              {CAT_IC[c] || "🍴"}
            </span>
            <span className={`text-[11px] font-bold whitespace-nowrap tracking-wide ${active ? "text-white" : "group-hover:text-foreground"}`}>
              {c}
            </span>
          </button>
        );
      })}
    </div>
  );
}
