import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Plus, 
  Minus, 
  ArrowRight, 
  Check, 
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  User,
  Search,
  Home
} from 'lucide-react'

// DETAILED PRODUCT CATALOG - RENAME BRAND VALUE STRICTLY TO BARIGA057
const PRODUCTS = [
  {
    id: 1,
    brand: "BARIGA057",
    model: "MINIMALIST TITANIUM WATCH",
    price: 120,
    size: "40MM",
    cond: "9.5/10",
    kit: "Full set",
    images: [
      "/images/item1.png",
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    id: 2,
    brand: "BARIGA057",
    model: "HEAVY COTTON HOODIE",
    price: 85,
    size: "L",
    cond: "10/10",
    kit: "No bag",
    images: [
      "/images/item2.png",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    id: 3,
    brand: "BARIGA057",
    model: "MATTE LEATHER BACKPACK",
    price: 195,
    size: "M",
    cond: "VNDS",
    kit: "Full set",
    images: [
      "/images/item3.png",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    id: 4,
    brand: "BARIGA057",
    model: "ALUMINUM WIRELESS EARBUDS",
    price: 140,
    size: "ONE SIZE",
    cond: "9/10",
    kit: "Box & cables",
    images: [
      "/images/item4.png",
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?q=80&w=600&auto=format&fit=crop"
    ]
  }
];

// Product Card Component with uniform 24px roundings, CAPS brand names, and price/add row
function ProductCard({ product, onAddToCart, onOpenGallery }) {
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    setIsAdded(true);
    onAddToCart(product);
    setTimeout(() => {
      setIsAdded(false);
    }, 800);
  };

  return (
    <div className="flex flex-col bg-[#1c1c1c] rounded-[24px] overflow-hidden border border-neutral-800/10 shadow-lg relative select-none">
      {/* Product Image & Counter */}
      <div className="aspect-[4/5] bg-neutral-950 overflow-hidden relative cursor-pointer">
        <img 
          src={product.images[0]} 
          alt={product.model}
          className="w-full h-full object-cover"
          onClick={() => onOpenGallery(product)}
          draggable="false"
          onContextMenu={(e) => e.preventDefault()}
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop";
          }}
        />
        
        {/* Photo index indicator */}
        <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[8px] font-semibold tracking-wider px-2 py-0.5 rounded-full select-none">
          1/{product.images.length}
        </span>
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          {/* Brand - Caps & Bold, White color */}
          <span className="text-[10px] tracking-wider text-white font-bold uppercase block">
            {product.brand}
          </span>
          {/* Model Name */}
          <h3 className="text-xs text-neutral-400 font-light mt-0.5 tracking-wider truncate uppercase">
            {product.model}
          </h3>
          
          {/* Light Gray Small Metadata line */}
          <p className="text-[9px] text-neutral-500 tracking-wider font-light mt-1.5 uppercase leading-relaxed">
            SIZE: {product.size} • COND: {product.cond} • {product.kit}
          </p>
        </div>

        {/* Price & Add (+) Button in the same row */}
        <div className="mt-3.5 pt-2.5 border-t border-neutral-850 flex justify-between items-center">
          <span className="text-xs text-[#e5e5e5] font-semibold tracking-wider">
            ${product.price}
          </span>
          
          <button
            type="button"
            onClick={handleAdd}
            className={`w-7 h-7 rounded-[10px] flex items-center justify-center transition-all duration-300 shadow-md ${
              isAdded 
                ? 'bg-emerald-600 text-white animate-pop' 
                : 'bg-[#e5e5e5] text-black hover:bg-white active:scale-90'
            }`}
          >
            {isAdded ? (
              <Check size={12} strokeWidth={3} />
            ) : (
              <Plus size={12} strokeWidth={3} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('Home'); // 'Home', 'Cart', 'Profile'
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tgUser, setTgUser] = useState(null);
  
  // Fullscreen photo gallery modal states
  const [galleryProduct, setGalleryProduct] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Checkout states
  const [checkoutStep, setCheckoutStep] = useState('idle');

  // Initialize Telegram WebApp SDK
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      webApp.ready();
      webApp.expand();
      
      // Force Deep Dark Mode styles on WebApp container
      webApp.setHeaderColor('#000000');
      webApp.setBackgroundColor('#000000');
      
      if (webApp.initDataUnsafe?.user) {
        setTgUser(webApp.initDataUnsafe.user);
      }
      
      webApp.enableClosingConfirmation();
    }
  }, []);

  // Get dynamic registration date simulation: DD.MM.YYYY, HH:MM
  const getRegDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year}, ${hours}:${minutes}`;
  };

  // Cart Functions
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });

    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  };

  const updateQuantity = (id, delta) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });

    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  // Real-time Brand Search Filtering
  const getFilteredProducts = () => {
    if (searchQuery.trim() === '') return PRODUCTS;
    const query = searchQuery.toLowerCase();
    return PRODUCTS.filter(p => 
      p.brand.toLowerCase().includes(query) ||
      p.model.toLowerCase().includes(query)
    );
  };

  // Telegram SDK sendData Checkout and Close App
  const handleCheckout = () => {
    if (cart.length === 0) return;

    const orderPayload = {
      items: cart.map(item => ({
        id: item.id,
        name: item.model,
        price: item.price,
        quantity: item.quantity,
        size: item.size
      })),
      total: getCartTotal()
    };

    if (window.Telegram?.WebApp?.sendData) {
      if (window.Telegram.WebApp.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      window.Telegram.WebApp.sendData(JSON.stringify(orderPayload));
      
      // Close the Telegram Mini App immediately after sending order data
      setTimeout(() => {
        window.Telegram.WebApp.close();
      }, 150);
    } else {
      console.log('Telegram WebApp.sendData triggered:', orderPayload);
      setCheckoutStep('processing');
      setTimeout(() => {
        setCheckoutStep('success');
        setCart([]);
      }, 1500);
    }
  };

  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    if (!galleryProduct) return;
    setGalleryIndex(prev => 
      prev === 0 ? galleryProduct.images.length - 1 : prev - 1
    );
  };

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    if (!galleryProduct) return;
    setGalleryIndex(prev => 
      prev === galleryProduct.images.length - 1 ? 0 : prev + 1
    );
  };

  const openGallery = (product) => {
    setGalleryProduct(product);
    setGalleryIndex(0);
  };

  const closeGallery = () => {
    setGalleryProduct(null);
  };

  return (
    <div className="w-full max-w-md min-h-screen bg-[#000000] text-[#e5e5e5] flex flex-col mx-auto relative select-none pb-24 px-6 pt-6">
      
      {/* HEADER LOGO: Centered brand title on all tabs */}
      <header className="flex justify-center py-4 relative z-20">
        <span className="text-xl font-black tracking-[0.3em] text-[#e5e5e5] uppercase font-sans">
          bariga057
        </span>
      </header>

      {/* MAIN VIEWPORT WITH SMOOTH TAB TRANSITIONS */}
      <main className="flex-grow flex flex-col z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="w-full flex flex-col"
          >
            {/* VIEW 1: CATALOG (HOME) */}
            {activeTab === 'Home' && (
              <div className="flex flex-col">
                {/* Search Bar (24px rounded-2xl) */}
                <div className="relative mt-2 z-20">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="SEARCH BRANDS..."
                    className="w-full bg-[#1c1c1c] text-xs text-[#e5e5e5] rounded-[24px] py-3.5 pl-10 pr-9 placeholder-neutral-500 border border-neutral-800/10 focus:outline-none focus:border-neutral-750 transition-all font-light uppercase tracking-wider"
                  />
                  <Search size={14} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                    >
                      <X size={14} strokeWidth={1.5} />
                    </button>
                  )}
                </div>

                {/* Catalog Grid */}
                <div className="grid grid-cols-2 gap-4 mt-6 pb-8">
                  {getFilteredProducts().map((product) => (
                    <ProductCard 
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                      onOpenGallery={openGallery}
                    />
                  ))}
                </div>

                {getFilteredProducts().length === 0 && (
                  <div className="py-20 text-center text-neutral-500 font-light tracking-widest text-xs uppercase">
                    No items found
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: CART */}
            {activeTab === 'Cart' && (
              <div className="py-2 space-y-6">
                <h2 className="text-xs tracking-[0.2em] text-neutral-400 font-semibold uppercase border-b border-neutral-800/30 pb-3">
                  Корзина ({getCartCount()})
                </h2>

                {checkoutStep === 'success' ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-12 h-12 bg-neutral-200 text-black rounded-[24px] flex items-center justify-center mx-auto shadow-lg">
                      <Check size={20} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-sm font-light tracking-widest text-[#e5e5e5] uppercase">ORDER TRANSMITTED</h3>
                    <p className="text-xs text-neutral-400 font-light max-w-xs mx-auto leading-relaxed">
                      Your order payload has been sent back to the bot.
                    </p>
                    <button 
                      type="button"
                      onClick={() => {
                        setCheckoutStep('idle');
                        setActiveTab('Home');
                      }}
                      className="mt-6 bg-[#e5e5e5] text-black rounded-[24px] px-6 py-3 text-[10px] tracking-widest font-bold hover:bg-white active:scale-95 transition-transform uppercase"
                    >
                      Return to Catalog
                    </button>
                  </div>
                ) : checkoutStep === 'processing' ? (
                  <div className="py-16 text-center space-y-4">
                    <div className="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-[24px] animate-spin mx-auto"></div>
                    <p className="text-xs text-neutral-500 font-light tracking-widest uppercase">TRANSMITTING SECURE PAYLOAD...</p>
                  </div>
                ) : cart.length === 0 ? (
                  <div className="py-16 text-center space-y-4">
                    <ShoppingCart size={22} strokeWidth={1} className="text-neutral-550 mx-auto" />
                    <p className="text-xs text-neutral-500 font-light tracking-widest uppercase">YOUR CART IS VACANT</p>
                    <button 
                      type="button"
                      onClick={() => setActiveTab('Home')}
                      className="mt-4 bg-[#1c1c1c] border border-neutral-800/10 text-neutral-300 rounded-[24px] px-5 py-2.5 text-[10px] tracking-widest font-bold hover:bg-[#2c2c2c] active:scale-95 transition-all uppercase"
                    >
                      Go to Catalog
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-4 divide-y divide-neutral-800/20">
                      {cart.map((item) => (
                        <div key={item.id} className="flex gap-4 pt-4 first:pt-0">
                          <div className="w-14 h-18 bg-neutral-950 border border-neutral-800/20 rounded-[24px] overflow-hidden flex-shrink-0">
                            <img src={item.images[0]} alt={item.model} className="w-full h-full object-cover" draggable="false" onContextMenu={(e) => e.preventDefault()} />
                          </div>
                          
                          <div className="flex-grow flex flex-col justify-between py-0.5">
                            <div>
                              <span className="text-[9px] tracking-wider text-neutral-500 font-bold uppercase block">{item.brand}</span>
                              <h4 className="text-xs text-[#e5e5e5] font-light tracking-wide uppercase truncate max-w-[160px]">{item.model}</h4>
                              <span className="text-[8px] text-neutral-400 font-semibold bg-neutral-900/60 px-1.5 py-0.5 rounded-[5px] border border-neutral-800/20 uppercase mt-1 inline-block">
                                Size: {item.size} • {item.cond}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2 mt-2">
                              <button 
                                type="button"
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-5 h-5 bg-[#1c1c1c] border border-neutral-800/40 rounded-[5px] flex items-center justify-center hover:bg-neutral-800 active:scale-90"
                              >
                                <Minus size={9} strokeWidth={2} />
                              </button>
                              <span className="text-[11px] font-semibold px-2 text-neutral-300">{item.quantity}</span>
                              <button 
                                type="button"
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-5 h-5 bg-[#1c1c1c] border border-neutral-800/40 rounded-[5px] flex items-center justify-center hover:bg-neutral-800 active:scale-90"
                              >
                                <Plus size={9} strokeWidth={2} />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-col justify-between items-end py-0.5">
                            <button 
                              type="button"
                              onClick={() => updateQuantity(item.id, -item.quantity)}
                              className="text-neutral-600 hover:text-neutral-450 p-1 transition-colors"
                            >
                              <X size={14} strokeWidth={1.5} />
                            </button>
                            <span className="text-xs text-neutral-450 font-light">
                              ${item.price * item.quantity}.00
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-neutral-800/20 pt-4 space-y-2">
                      <div className="flex justify-between text-[11px] tracking-wider text-neutral-500 font-light">
                        <span>SUBTOTAL</span>
                        <span>${getCartTotal()}.00</span>
                      </div>
                      <div className="flex justify-between text-[11px] tracking-wider text-neutral-500 font-light">
                        <span>DELIVERY</span>
                        <span className="text-[9px] tracking-widest text-neutral-500 uppercase font-bold">FREE</span>
                      </div>
                      <div className="flex justify-between text-xs tracking-widest text-[#e5e5e5] border-t border-neutral-800/20 pt-3 font-semibold">
                        <span>TOTAL</span>
                        <span>${getCartTotal()}.00</span>
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={handleCheckout}
                      className="w-full bg-[#e5e5e5] text-black py-3.5 rounded-[24px] text-[10px] font-bold tracking-[0.2em] flex items-center justify-center gap-2 transition-colors uppercase active:scale-[0.98] mt-6"
                    >
                      Оформить заявку <ArrowRight size={12} strokeWidth={3} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 3: PROFILE - REBUILT TO MATCH USER SPECIFIED LAYOUT AND DATE */}
            {activeTab === 'Profile' && (
              <div className="py-2 space-y-6">
                <h2 className="text-xs tracking-[0.2em] text-neutral-400 font-semibold uppercase border-b border-neutral-800/30 pb-3">
                  Профиль
                </h2>

                {/* Dark Rounded User Card bg-[#1c1c1c] rounded-2xl */}
                <div className="bg-[#1c1c1c] rounded-2xl p-5 flex items-center gap-4 border border-neutral-800/10 shadow-lg">
                  {/* Left: Round Avatar */}
                  <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-neutral-800 border border-neutral-700/30 flex items-center justify-center shadow-inner">
                    {tgUser?.photo_url ? (
                      <img 
                        src={tgUser.photo_url} 
                        alt="Profile Avatar" 
                        className="w-full h-full object-cover" 
                        draggable="false" 
                        onContextMenu={(e) => e.preventDefault()} 
                      />
                    ) : (
                      <span className="text-white text-xl font-bold uppercase select-none">
                        {tgUser?.first_name?.[0] || tgUser?.username?.[0] || 'S'}
                      </span>
                    )}
                  </div>

                  {/* Right: Username, full name and dynamic date */}
                  <div className="flex-grow min-w-0">
                    <h3 className="text-sm font-bold text-white truncate uppercase tracking-wider">
                      {tgUser ? `${tgUser.first_name} ${tgUser.last_name || ''}` : 'SENSE VISITOR'}
                    </h3>
                    <p className="text-[10px] text-neutral-500 font-light mt-0.5 tracking-wide truncate">
                      {tgUser?.username ? `@${tgUser.username}` : '@guest_account'}
                    </p>
                    <p className="text-[9px] text-neutral-450 font-light mt-2.5 uppercase tracking-widest leading-none">
                      В магазине с {getRegDate()}
                    </p>
                  </div>
                </div>

                {/* SDK Diagnostics details */}
                <div className="bg-[#1c1c1c] rounded-[24px] border border-neutral-800/15 p-5 space-y-2.5 text-[10px] font-light tracking-wider text-neutral-500">
                  <div className="text-[8px] tracking-[0.2em] text-neutral-400 font-bold uppercase mb-1">SDK DIAGNOSTICS</div>
                  <div className="flex justify-between">
                    <span>Platform</span>
                    <span className="uppercase text-neutral-300">{window.Telegram?.WebApp?.platform || 'Browser Simulator'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SDK Version</span>
                    <span className="text-neutral-300">{window.Telegram?.WebApp?.version || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FIXED BOTTOM NAVIGATION BAR: 3 Tabs (Главная, Корзина, Профиль) */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-16 bg-[#000000]/95 backdrop-blur-md border-t border-neutral-800/60 flex justify-around items-center z-40">
        <button 
          type="button"
          onClick={() => setActiveTab('Home')} 
          className={`flex-1 h-full flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors duration-300 ${
            activeTab === 'Home' ? 'text-white' : 'text-neutral-500 hover:text-neutral-400'
          }`}
        >
          <Home size={18} strokeWidth={activeTab === 'Home' ? 1.8 : 1.3} />
          <span className="text-[8px] font-light tracking-wider uppercase">Главная</span>
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab('Cart')} 
          className={`flex-1 h-full flex flex-col items-center justify-center space-y-1 relative cursor-pointer transition-colors duration-300 ${
            activeTab === 'Cart' ? 'text-white' : 'text-neutral-500 hover:text-neutral-400'
          }`}
        >
          <ShoppingCart size={18} strokeWidth={activeTab === 'Cart' ? 1.8 : 1.3} />
          <span className="text-[8px] font-light tracking-wider uppercase">Корзина</span>
          {cart.length > 0 && (
            <span className="absolute top-2.5 right-[33%] w-2 h-2 bg-white rounded-full flex items-center justify-center text-[6px] font-black text-black scale-90">
              {getCartCount()}
            </span>
          )}
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab('Profile')} 
          className={`flex-1 h-full flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors duration-300 ${
            activeTab === 'Profile' ? 'text-white' : 'text-neutral-500 hover:text-neutral-400'
          }`}
        >
          <User size={18} strokeWidth={activeTab === 'Profile' ? 1.8 : 1.3} />
          <span className="text-[8px] font-light tracking-wider uppercase">Профиль</span>
        </button>
      </nav>

      {/* FULLSCREEN IMAGE GALLERY MODAL WITH SPRING ZOOM TRANSITIONS */}
      <AnimatePresence>
        {galleryProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black flex flex-col justify-between py-12 px-6"
          >
            {/* Header Block */}
            <div className="flex justify-between items-center w-full relative z-10">
              <span className="text-[10px] tracking-[0.2em] font-semibold text-neutral-400 uppercase">
                {galleryIndex + 1} / {galleryProduct.images.length}
              </span>
              <button 
                type="button"
                onClick={closeGallery}
                className="text-neutral-400 hover:text-white p-2 bg-neutral-900/60 rounded-full border border-neutral-800/30 transition-colors cursor-pointer"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Center Swipeable Image Wrapper */}
            <div className="relative flex-grow flex items-center justify-center py-6 w-full">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", stiffness: 150, damping: 18 }}
                className="relative w-full max-w-sm aspect-[4/5] bg-neutral-950 rounded-[24px] overflow-hidden border border-neutral-800/10 shadow-2xl"
              >
                <img 
                  src={galleryProduct.images[galleryIndex]} 
                  alt="Fullscreen View" 
                  className="w-full h-full object-cover"
                  draggable="false"
                  onContextMenu={(e) => e.preventDefault()}
                />
              </motion.div>

              {/* Left Arrow */}
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-0 top-1/2 -translate-y-1/2 p-3 rounded-full bg-neutral-900/80 text-white hover:bg-neutral-800 transition-colors border border-neutral-800/20 active:scale-90"
              >
                <ChevronLeft size={18} strokeWidth={2} />
              </button>

              {/* Right Arrow */}
              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-3 rounded-full bg-neutral-900/80 text-white hover:bg-neutral-800 transition-colors border border-neutral-800/20 active:scale-90"
              >
                <ChevronRight size={18} strokeWidth={2} />
              </button>
            </div>

            {/* Bottom Metadata Block */}
            <div className="text-center space-y-2 relative z-10">
              <span className="text-[9px] tracking-[0.25em] text-neutral-500 font-bold uppercase block">
                {galleryProduct.brand}
              </span>
              <h4 className="text-xs text-white/90 font-light tracking-widest uppercase">
                {galleryProduct.model}
              </h4>
              <p className="text-[9px] text-neutral-450 tracking-wider font-light uppercase">
                SIZE: {galleryProduct.size} • COND: {galleryProduct.cond} • {galleryProduct.kit}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;
