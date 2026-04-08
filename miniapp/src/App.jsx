// src/App.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, QrCode, LogOut } from 'lucide-react';

const App = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [activeTab, setActiveTab] = useState('shop');
  const [checkoutStatus, setCheckoutStatus] = useState(null); // 'checking', 'success', 'error'
  const [loading, setLoading] = useState(true);

  const tg = window.Telegram.WebApp;

  useEffect(() => {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#000000');
    fetchProducts();
  }, [tg]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*');
    if (data) setProducts(data);
    setLoading(false);
  };

  const addToCart = (productId) => {
    setCart(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  };

  const removeFromCart = (productId) => {
    if (!cart[productId]) return;
    setCart(prev => {
      const next = { ...prev };
      next[productId] -= 1;
      if (next[productId] === 0) delete next[productId];
      return next;
    });
  };

  const calculateTotal = () => {
    return products.reduce((acc, p) => acc + (cart[p.id] || 0) * p.price, 0);
  };

  const handleCheckout = async () => {
    if (!calculateTotal()) return;
    
    setCheckoutStatus('checking');
    
    // Simulyatsiya (Payment bo'lmagani uchun)
    await new Promise(res => setTimeout(res, 2500)); 

    const { error } = await supabase.from('orders').insert({
      user_id: tg.initDataUnsafe.user?.id || 12345,
      user_name: tg.initDataUnsafe.user?.first_name || 'Sinovchi Foydalanuvchi',
      total_amount: calculateTotal(),
      status: 'completed',
      items: Object.entries(cart).map(([id, qty]) => ({ id, qty }))
    });

    if (error) {
      setCheckoutStatus('error');
    } else {
      setCheckoutStatus('success');
      setCart({});
    }
  };

  // UI Animatsiyalari
  const pageVars = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  const cardVars = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } };

  return (
    <motion.div initial="hidden" animate="visible" variants={pageVars} className="min-h-screen bg-black text-white p-5 font-sans pb-28">
      {/* Header with Glassmorphism */}
      <motion.header className="flex justify-between items-center bg-white/5 backdrop-blur-lg border border-white/10 p-4 rounded-2xl mb-8 sticky top-0 z-50 shadow-lg">
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">SmartPoint</h1>
          <p className="text-xs text-zinc-500">Toshkent, Shahrisabz ko'chasi, 2a</p>
        </div>
        <motion.div whileTap={{ scale: 0.9 }} className="bg-white/10 p-3 rounded-xl border border-white/10 shadow-neumorphic cursor-pointer relative">
          <QrCode size={20} className="text-zinc-300" />
          {Object.keys(cart).length > 0 && <span className="absolute -top-1.5 -right-1.5 bg-cyan-500 text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{calculateTotal().toLocaleString()}</span>}
        </motion.div>
      </motion.header>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-3 mb-8 bg-zinc-900 rounded-xl p-1 shadow-inner-neumorphic">
        {['shop', 'orders'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === tab ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-500'}`}>
            {tab === 'shop' ? "Mahsulotlar" : "Buyurtmalarim"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-zinc-600 mt-10">Yuklanmoqda...</div>
      ) : activeTab === 'shop' ? (
        <AnimatePresence>
          <div className="grid grid-cols-2 gap-5">
            {products.map(p => (
              <motion.div key={p.id} variants={cardVars} whileTap={{ scale: 0.98 }} className="bg-zinc-900/50 backdrop-blur-xs border border-zinc-800 rounded-3xl p-4 shadow-xl flex flex-col justify-between">
                <div>
                  <img src={p.image_url} alt={p.name} className="h-32 w-full object-contain mb-3" />
                  <h3 className="font-semibold text-base text-zinc-100">{p.name}</h3>
                  <p className="text-xs text-zinc-500">{p.category}</p>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-lg font-bold text-cyan-400">{(p.price/1000).toFixed(1)}K</span>
                  <div className="flex gap-1.5 items-center">
                    {cart[p.id] ? (
                      <>
                        <motion.button onClick={() => removeFromCart(p.id)} whileTap={{ rotate: -90 }} className="bg-zinc-700 rounded-full w-7 h-7 flex items-center justify-center">-</motion.button>
                        <span className="text-sm font-bold w-4 text-center">{cart[p.id]}</span>
                        <motion.button onClick={() => addToCart(p.id)} whileTap={{ rotate: 90 }} className="bg-zinc-700 rounded-full w-7 h-7 flex items-center justify-center">+</motion.button>
                      </>
                    ) : (
                      <motion.button onClick={() => addToCart(p.id)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="bg-white text-black font-bold text-lg rounded-full w-8 h-8 flex items-center justify-center">+</motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      ) : (
        <div className="text-center text-zinc-600">Buyurtmalar ro'yxati hozircha bo'sh.</div>
      )}

      {/* Modern Checkout Button */}
      <AnimatePresence>
        {calculateTotal() > 0 && activeTab === 'shop' && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-6 left-5 right-5 z-40 bg-zinc-900 rounded-2xl p-5 border border-zinc-700 shadow-2xl backdrop-blur-lg">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium text-zinc-400">Jami summasi:</span>
              <span className="text-2xl font-black text-cyan-300">{calculateTotal().toLocaleString()} UZS</span>
            </div>
            <motion.button onClick={handleCheckout} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`w-full ${checkoutStatus === 'checking' ? 'bg-zinc-600' : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600'} text-black py-4 rounded-xl text-lg font-black shadow-lg shadow-cyan-950/30 flex items-center justify-center`}>
              {checkoutStatus === 'checking' ? <><span className="animate-spin mr-3">🌀</span> Yakunlanmoqda...</> : "Buyurtmani yakunlash"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Modal */}
      <AnimatePresence>
        {checkoutStatus && checkoutStatus !== 'checking' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCheckoutStatus(null)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] p-10 flex items-center justify-center">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className={`bg-zinc-900 border ${checkoutStatus === 'success' ? 'border-green-600/50' : 'border-red-600/50'} rounded-3xl p-10 shadow-2xl text-center w-full max-w-sm relative`}>
              <button onClick={() => setCheckoutStatus(null)} className="absolute top-4 right-4 text-zinc-700 hover:text-white transition"><X /></button>
              {checkoutStatus === 'success' ? (
                <>
                  <CheckCircle2 size={70} className="text-green-500 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-2">Buyurtma qabul qilindi!</h2>
                  <p className="text-zinc-500 mb-8">Ushbu SmartPoint nuqtasidagi eshik hozir ochilishi kerak. Rahmat!</p>
                </>
              ) : (
                <>
                  <LogOut size={70} className="text-red-500 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-2">Xatolik yuz berdi!</h2>
                  <p className="text-zinc-500 mb-8">Nimadir xato ketdi, iltimos qaytadan urinib ko'ring yoki botga yozing.</p>
                </>
              )}
              <motion.button whileTap={{ y: 2 }} className={`w-full ${checkoutStatus === 'success' ? 'bg-green-600' : 'bg-red-600'} py-3 rounded-xl font-bold`}>Yopish</motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default App;
