type Tab = "shop" | "cart" | "orders" | "profile";
type Props = { active: Tab; cartCount: number; onChange: (t: Tab) => void };

const items: { id: Tab; ic: string; lb: string }[] = [
  { id: "shop", ic: "🏪", lb: "Menu" },
  { id: "cart", ic: "🛒", lb: "Cart" },
  { id: "orders", ic: "📦", lb: "Orders" },
  { id: "profile", ic: "👤", lb: "Profile" },
];

export function BottomNav({ active, cartCount, onChange }: Props) {
  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[400px] z-[100]">
      <nav className="bg-surface/80 dark:bg-black/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] rounded-full flex p-1.5">
        {items.map((it) => {
          const isActive = it.id === active;
          return (
            <button
              key={it.id}
              onClick={() => onChange(it.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-full border-0 transition-all duration-300 relative ${
                isActive ? "bg-white dark:bg-white/10 shadow-sm text-brand scale-105" : "bg-transparent text-soft-text hover:text-foreground"
              }`}
            >
              <span className={`text-[22px] transition-transform duration-300 ${isActive ? "scale-110 drop-shadow-md" : ""}`}>{it.ic}</span>
              <span className={`text-[10px] font-black tracking-wide ${isActive ? "opacity-100" : "opacity-70"}`}>{it.lb}</span>
              {it.id === "cart" && cartCount > 0 && (
                <span className="absolute top-1 right-[calc(50%-24px)] bg-brand text-brand-fg rounded-full min-w-[20px] px-1 h-[20px] text-[11px] font-black flex items-center justify-center shadow-md animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
