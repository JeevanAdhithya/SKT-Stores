import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-6 md:px-10 w-full mt-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <h2 className="text-2xl font-black text-[#e8450a] tracking-tighter mb-4">ShopEase</h2>
          <p className="text-gray-400 font-bold text-sm leading-relaxed">
            Premium shopping experience with a curated collection of high-end products. Quality guaranteed.
          </p>
        </div>
        
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 mb-6">Shopping</h4>
          <ul className="space-y-4 text-sm font-bold text-gray-400">
            <li><button className="hover:text-brand transition-colors">Electronics</button></li>
            <li><button className="hover:text-brand transition-colors">Fashion</button></li>
            <li><button className="hover:text-brand transition-colors">Home & Living</button></li>
            <li><button className="hover:text-brand transition-colors">New Arrivals</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 mb-6">Company</h4>
          <ul className="space-y-4 text-sm font-bold text-gray-400">
            <li><button className="hover:text-brand transition-colors">About Us</button></li>
            <li><button className="hover:text-brand transition-colors">Privacy Policy</button></li>
            <li><button className="hover:text-brand transition-colors">Terms of Service</button></li>
            <li><button className="hover:text-brand transition-colors">Contact</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 mb-6">Follow Us</h4>
          <div className="flex gap-4">
            <SocialIcon icon="📸" />
            <SocialIcon icon="🐦" />
            <SocialIcon icon="📘" />
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">
        <span>© 2026 SKT STORES. ALL RIGHTS RESERVED.</span>
        <div className="flex gap-8">
          <span>SECURE PAYMENTS</span>
          <span>FAST DELIVERY</span>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon }: { icon: string }) {
  return (
    <button className="w-10 h-10 bg-[#f4f7f9] border border-[#e4e9ed] rounded-full flex items-center justify-center hover:bg-brand hover:text-white hover:border-brand transition-all shadow-sm">
      {icon}
    </button>
  );
}
