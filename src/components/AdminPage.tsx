import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/components/Toast";
import { Plus, Package, ShoppingBag, Trash2, Edit2, X, Upload, Link as LinkIcon, CheckCircle, XCircle } from "lucide-react";

const ADMIN_EMAIL = 'sktstores37@gmail.com';

export function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'add' | 'completed'>('inventory');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageType, setImageType] = useState<'url' | 'upload'>('url');
  
  const [formData, setFormData] = useState({
    id: '', name: '', category: 'Electronics', price: 0, stock: 0, 
    emoji: '📦', tag: '', img: ''
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) {
      showToast("Upload failed: " + uploadError.message, "red");
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    setFormData({ ...formData, img: publicUrl });
    showToast("Image uploaded!", "green");
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) showToast(error.message, "red");
    else fetchData();
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setFormData({ ...p });
    setImageType(p.img?.startsWith('http') ? 'url' : 'upload');
    setModalOpen(true);
  };

  if (loading) return <div className="p-10 text-center">Loading Admin Panel...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Simplified Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 p-6 flex flex-col gap-8">
        <div>
          <h2 className="text-2xl font-black text-brand">SKT Admin</h2>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1">Management Portal</p>
        </div>
        
        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === 'inventory' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Package size={20} /> Inventory
          </button>
          <button 
            onClick={() => { setEditingId(null); setFormData({id:'', name:'', category:'Electronics', price:0, stock:0, emoji:'📦', tag:'', img:''}); setModalOpen(true); }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
          >
            <Plus size={20} /> Add Product
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === 'completed' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <CheckCircle size={20} /> Completed
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {activeTab === 'inventory' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-8">
              <h1 className="text-3xl font-black">Product Inventory</h1>
              <p className="text-gray-500">Manage your active listings and stock</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                  <div className="relative aspect-square rounded-[24px] bg-gray-50 overflow-hidden mb-4 flex items-center justify-center">
                    {p.img ? (
                      <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <span className="text-6xl">{p.emoji}</span>
                    )}
                    {p.tag && <span className="absolute top-4 left-4 bg-brand text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{p.tag}</span>}
                  </div>
                  <h3 className="text-lg font-black mb-1">{p.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-black text-brand">₹{p.price}</span>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><Edit2 size={18} /></button>
                      <button onClick={async () => { if(confirm("Delete?")) await supabase.from('products').delete().eq('id', p.id); fetchData(); }} className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="animate-in fade-in duration-500">
            <header className="mb-8">
              <h1 className="text-3xl font-black">Completed Orders</h1>
              <p className="text-gray-500">Archive of successful deliveries</p>
            </header>
            
            <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    <th className="p-6">Order ID</th>
                    <th className="p-6">Customer</th>
                    <th className="p-6">Items</th>
                    <th className="p-6">Total</th>
                    <th className="p-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.filter(o => o.status === 'delivered').map(o => (
                    <tr key={o.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="p-6 font-mono text-[10px] text-gray-400">#{o.id.slice(0,8)}</td>
                      <td className="p-6">
                        <div className="font-bold">{o.customer_name}</div>
                        <div className="text-[10px] text-gray-400">{o.customer_email}</div>
                      </td>
                      <td className="p-6 text-xs text-gray-500">{o.items.length} items</td>
                      <td className="p-6 font-black text-green-600">₹{o.total_amount}</td>
                      <td className="p-6">
                        <span className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1 rounded-full uppercase">Success</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Product Modal with Dual Image Option */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-xl p-10 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black">{editingId ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unique ID</label>
                  <input placeholder="e.g. phone-01" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl font-bold border-0 focus:ring-2 focus:ring-brand outline-none" required disabled={!!editingId} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Emoji Icon</label>
                  <input placeholder="📦" value={formData.emoji} onChange={e => setFormData({...formData, emoji: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl font-bold border-0 focus:ring-2 focus:ring-brand outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Name</label>
                <input placeholder="Name of your product" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl font-bold border-0 focus:ring-2 focus:ring-brand outline-none" required />
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 border-b border-gray-100 pb-2">
                  <button type="button" onClick={() => setImageType('url')} className={`text-xs font-black uppercase tracking-widest pb-2 px-2 transition-all ${imageType === 'url' ? 'text-brand border-b-2 border-brand' : 'text-gray-400'}`}>Image URL</button>
                  <button type="button" onClick={() => setImageType('upload')} className={`text-xs font-black uppercase tracking-widest pb-2 px-2 transition-all ${imageType === 'upload' ? 'text-brand border-b-2 border-brand' : 'text-gray-400'}`}>Upload File</button>
                </div>
                
                {imageType === 'url' ? (
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input placeholder="https://image.url/photo.jpg" value={formData.img} onChange={e => setFormData({...formData, img: e.target.value})} className="w-full bg-gray-50 p-4 pl-12 rounded-2xl font-bold border-0 focus:ring-2 focus:ring-brand outline-none" />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 hover:border-brand hover:bg-brand/5 cursor-pointer transition-all">
                    <Upload className="text-gray-400 mb-2" />
                    <span className="text-sm font-bold text-gray-500">Click to upload image</span>
                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                    {formData.img && <span className="mt-2 text-[10px] text-green-600 font-bold">✓ Ready</span>}
                  </label>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (₹)</label>
                  <input type="number" placeholder="0.00" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-gray-50 p-4 rounded-2xl font-bold border-0 focus:ring-2 focus:ring-brand outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stock</label>
                  <input type="number" placeholder="0" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full bg-gray-50 p-4 rounded-2xl font-bold border-0 focus:ring-2 focus:ring-brand outline-none" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl font-bold border-0 focus:ring-2 focus:ring-brand outline-none">
                    <option>Electronics</option><option>Fashion</option><option>Home</option><option>Gadgets</option><option>Beauty</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tag (Sale, New)</label>
                  <input placeholder="e.g. 20% OFF" value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl font-bold border-0 focus:ring-2 focus:ring-brand outline-none" />
                </div>
              </div>

              <button type="submit" className="w-full bg-brand hover:bg-brand-hover text-white py-5 rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-brand/30 transition-all active:scale-95">
                {editingId ? 'Update Product' : 'Add to Catalog'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
