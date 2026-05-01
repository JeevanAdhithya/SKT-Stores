type Tab = "shop" | "cart" | "orders" | "profile";

type Props = {
  active: Tab;
  cartCount: number;
  onChange: (t: Tab) => void;
};

export function BottomNav({ active, cartCount, onChange }: Props) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 z-[100] md:hidden">
      <div className="flex items-center justify-around">
        <NavBtn 
          active={active === "shop"} 
          onClick={() => onChange("shop")} 
          icon="🏪" 
          label="Menu" 
        />
        <NavBtn 
          active={active === "cart"} 
          onClick={() => onChange("cart")} 
          icon="🛒" 
          label="Cart" 
          badge={cartCount} 
        />
        <NavBtn 
          active={active === "orders"} 
          onClick={() => onChange("orders")} 
          icon="📦" 
          label="Orders" 
        />
      </div>
    </footer>
  );
}

function NavBtn({ active, onClick, icon, label, badge }: { active: boolean; onClick: () => void; icon: string; label: string; badge?: number }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all relative ${active ? 'text-brand' : 'text-gray-400'}`}
    >
      <div className="text-2xl relative">
        {icon}
        {badge ? (
          <span className="absolute -top-1 -right-2 bg-brand text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
            {badge}
          </span>
        ) : null}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-brand' : 'text-gray-500'}`}>
        {label}
      </span>
    </button>
  );
}
