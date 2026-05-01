import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/components/Toast";
import { Plus, Package, ShoppingBag, Trash2, Edit2, LogOut, X } from "lucide-react";

const ADMIN_EMAIL = 'sktstores37@gmail.com';

export function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'products' | 'orders'>('products');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: '', name: '', category: 'General', price: 0, stock: 0, emoji: '📦', tag: '', img: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: p } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    const { data: o } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (p) setProducts(p);
    if (o) setOrders(o);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, price: Number(formData.price), stock: Number(formData.stock) };
    
    let error;
    if (editingId) {
      const { error: err } = await supabase.from('products').update(payload).eq('id', editingId);
      error = err;
    } else {
      const { error: err } = await supabase.from('products').insert([payload]);
      error = err;
    }

    if (error) {
      showToast("Error: " + error.message, "red");
    } else {
      showToast(editingId ? "Updated!" : "Created!", "green");
      setModalOpen(false);
      fetchData();
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete product?")) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) showToast(error.message, "red");
    else fetchData();
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) showToast(error.message, "red");
    else fetchData();
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setFormData({ ...p });
    setModalOpen(true);
  };

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Store Management</h1>
          <p className="text-muted-text font-medium">Control inventory and fulfill orders</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setEditingId(null); setFormData({id:'', name:'', category:'General', price:0, stock:0, emoji:'📦', tag:'', img:''}); setModalOpen(true); }}
            className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-brand/20 transition-all active:scale-95"
          >
            <Plus size={20} /> Add Product
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-8 mb-8 border-b border-line">
        <button 
          onClick={() => setTab('products')}
          className={`pb-4 px-2 text-sm font-black transition-all ${tab === 'products' ? 'text-brand border-b-2 border-brand' : 'text-muted-text hover:text-foreground'}`}
        >
          Inventory
        </button>
        <button 
          onClick={() => setTab('orders')}
          className={`pb-4 px-2 text-sm font-black transition-all ${tab === 'orders' ? 'text-brand border-b-2 border-brand' : 'text-muted-text hover:text-foreground'}`}
        >
          Recent Orders
        </button>
      </div>

      {tab === 'products' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map(p => (
            <div key={p.id} className="bg-surface p-5 rounded-[24px] border border-line shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl bg-surface-muted w-14 h-14 flex items-center justify-center rounded-2xl shadow-inner">{p.emoji}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(p)} className="p-2.5 hover:bg-brand/10 text-brand rounded-xl transition-colors"><Edit2 size={18} /></button>
                  <button onClick={() => deleteProduct(p.id)} className="p-2.5 hover:bg-red-50 text-red-500 rounded-xl transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>
              <h3 className="font-black text-xl mb-1">{p.name}</h3>
              <div className="flex items-center justify-between">
                <span className="text-brand font-black text-lg">${Number(p.price).toFixed(2)}</span>
                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {p.stock} in stock
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface rounded-[32px] border border-line overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-surface-muted/50">
              <tr>
                <th className="p-6 text-xs font-black uppercase text-muted-text tracking-widest">Order</th>
                <th className="p-6 text-xs font-black uppercase text-muted-text tracking-widest">Customer</th>
                <th className="p-6 text-xs font-black uppercase text-muted-text tracking-widest">Total</th>
                <th className="p-6 text-xs font-black uppercase text-muted-text tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-surface-muted/30 transition-colors">
                  <td className="p-6 font-mono text-xs text-muted-text">#{o.id.slice(0,8)}</td>
                  <td className="p-6">
                    <div className="font-bold text-foreground">{o.customer_name}</div>
                    <div className="text-[10px] text-muted-text font-medium">{o.customer_email}</div>
                  </td>
                  <td className="p-6 font-black text-brand">${Number(o.total_amount).toFixed(2)}</td>
                  <td className="p-6">
                    <select 
                      value={o.status} 
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="bg-surface-muted text-[10px] font-black uppercase py-2 px-3 rounded-xl border-0 outline-none focus:ring-2 focus:ring-brand"
                    >
                      <option value="pending">Pending</option>
                      <option value="preparing">Preparing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
          <div className="bg-surface rounded-[32px] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black">{editingId ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-muted-text hover:text-foreground"><X /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="ID (pizza-1)" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="bg-surface-muted p-4 rounded-2xl font-bold border-0 focus:ring-2 focus:ring-brand outline-none" required disabled={!!editingId} />
                <input placeholder="Emoji (🍕)" value={formData.emoji} onChange={e => setFormData({...formData, emoji: e.target.value})} className="bg-surface-muted p-4 rounded-2xl font-bold border-0 focus:ring-2 focus:ring-brand outline-none" />
              </div>
              <input placeholder="Product Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-muted p-4 rounded-2xl font-bold border-0 focus:ring-2 focus:ring-brand outline-none" required />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.01" placeholder="Price" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="bg-surface-muted p-4 rounded-2xl font-bold border-0 focus:ring-2 focus:ring-brand outline-none" required />
                <input type="number" placeholder="Stock" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="bg-surface-muted p-4 rounded-2xl font-bold border-0 focus:ring-2 focus:ring-brand outline-none" required />
              </div>
              <button type="submit" className="w-full bg-brand hover:bg-brand-hover text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand/20 transition-all active:scale-95">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
