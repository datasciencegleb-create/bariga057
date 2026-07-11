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
  Home,
  SlidersHorizontal
} from 'lucide-react'

// A simple yet robust CSV parser to extract fields correctly, handling quoted values (like images list)
const parseCSV = (csvText) => {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const parsedData = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const row = [];
    let insideQuote = false;
    let currentField = '';

    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const char = line[charIdx];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        row.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    row.push(currentField.trim());

    // Skip empty lines or mismatching columns
    if (row.length < headers.length) continue;

    // Map headers to row fields
    const obj = {};
    headers.forEach((header, idx) => {
      let val = row[idx] || '';
      // Clean up surrounding quotes if any
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
      }
      obj[header] = val;
    });

    // Parse image urls into array — URLs are separated by semicolons (;) in Google Sheets
    if (obj.images) {
      obj.images = obj.images.split(';')
        .map(url => url.trim().replace(/^"|"$/g, ''))
        .filter(Boolean);
    } else {
      obj.images = [];
    }

    // Parse numeric price
    obj.price = parseFloat(obj.price) || 0;
    
    // Parse numeric ID
    obj.id = parseInt(obj.id, 10) || i;

    parsedData.push(obj);
  }
  return parsedData;
};

// Utility helper to convert condition text to numeric values for sorting
const parseCondition = (cond) => {
  if (!cond) return 0;
  const upper = cond.toUpperCase().trim();
  if (upper === 'VNDS' || upper === '10/10' || upper === '10') return 10.0;
  if (upper.includes('/10')) {
    const val = parseFloat(upper.split('/10')[0]);
    return isNaN(val) ? 0 : val;
  }
  return parseFloat(cond) || 0;
};

// Format price in Ukrainian hryvnia with dot as thousands separator (e.g. 16300 → "16.300 ₴")
const formatPrice = (price) =>
  Number(price).toLocaleString('ru-RU').replace(/\s/g, '.') + ' ₴';

// Product Card Component with uniform 24px roundings, CAPS brand names, and price/add row
function ProductCard({ product, isInCart, onAddToCart, onOpenGallery }) {
  const handleAdd = () => {
    if (isInCart) return;
    onAddToCart(product);
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
          {/* Brand tag — small neutral grey */}
          <span className="text-[10px] tracking-wider text-neutral-500 font-bold uppercase block">
            BARIGA057
          </span>
          {/* Full title: Brand + Model — white, medium weight */}
          <h3 className="text-xs text-white font-medium mt-0.5 tracking-wider truncate uppercase">
            {product.brand} {product.model}
          </h3>
          
          {/* Light Gray Small Metadata line */}
          <p className="text-[9px] text-neutral-500 tracking-wider font-light mt-1.5 uppercase leading-relaxed">
            SIZE: {product.size} • COND: {product.cond} • {product.kit}
          </p>
        </div>

        {/* Price & Add (+) Button in the same row */}
        <div className="mt-3.5 pt-2.5 border-t border-neutral-850 flex justify-between items-center">
          <span className="text-xs text-[#e5e5e5] font-semibold tracking-wider">
            {formatPrice(product.price)}
          </span>
          
          <button
            type="button"
            onClick={handleAdd}
            disabled={isInCart}
            className={`w-7 h-7 rounded-[10px] flex items-center justify-center transition-all duration-300 ${
              isInCart 
                ? 'bg-neutral-800 text-neutral-500 border border-neutral-750/30' 
                : 'bg-[#e5e5e5] text-black hover:bg-white active:scale-90 shadow-md'
            }`}
          >
            {isInCart ? (
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

// Skeleton Grid loader during fetch operation
function SkeletonLoader() {
  return (
    <div className="grid grid-cols-2 gap-4 mt-6 pb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col bg-[#1c1c1c] rounded-[24px] overflow-hidden border border-neutral-800/10 shadow-lg relative animate-pulse select-none">
          <div className="aspect-[4/5] bg-neutral-900 w-full" />
          <div className="p-4 flex flex-col space-y-3 flex-grow justify-between">
            <div className="space-y-2">
              <div className="h-2.5 bg-neutral-800 rounded-full w-2/3" />
              <div className="h-3 bg-neutral-850 rounded-full w-4/5" />
              <div className="h-2 bg-neutral-900 rounded-full w-1/2" />
            </div>
            <div className="pt-2.5 border-t border-neutral-850 flex justify-between items-center">
              <div className="h-3.5 bg-neutral-800 rounded-full w-1/3" />
              <div className="w-7 h-7 bg-neutral-800 rounded-[10px]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('Home'); // 'Home', 'Cart', 'Profile'
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  // Telegram user object — populated once SDK confirms it is ready
  const [user, setUser] = useState(null);
  
  // Real-time catalog products state loaded from Google Sheets CSV pub format
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fullscreen photo gallery modal states
  const [galleryProduct, setGalleryProduct] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(0); // -1 for prev, 1 for next
  const [imageLoaded, setImageLoaded] = useState(false);

  // Sorting Bottom Sheet States (Support combined multi-sorting)
  const [showFilters, setShowFilters] = useState(false);
  const [sortByPrice, setSortByPrice] = useState('none'); // 'none', 'price_asc', 'price_desc'
  const [sortByCond, setSortByCond] = useState('none');   // 'none', 'cond_desc', 'cond_asc'

  // Checkout states
  const [checkoutStep, setCheckoutStep] = useState('idle');

  // Initialize Telegram WebApp SDK & Load Catalog Data from CSV
  useEffect(() => {
    // --- Telegram WebApp init ---
    // IMPORTANT: call ready() FIRST so the SDK fires its own init chain,
    // then read initDataUnsafe AFTER it has been populated.
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();

      // Force deep dark theme
      try { tg.setHeaderColor('#000000'); } catch (_) {}
      try { tg.setBackgroundColor('#000000'); } catch (_) {}
      try { tg.enableClosingConfirmation(); } catch (_) {}

      // Primary read: immediately after ready()
      const tgUser = tg.initDataUnsafe?.user;
      if (tgUser) {
        setUser(tgUser);
      }
    }

    // Load data from Google Sheets CSV Pub link
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        // Using output=csv for direct spreadsheet exports
        const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vSw-OmLbLzeU932U3kcRChJGPRibjGnuAnjYGrftq1ODnr5vtWLFJdwuq9R7XgT1H1Aju7grysAKedg/pub?output=csv');
        if (!response.ok) {
          throw new Error('Failed to retrieve spreadsheet payload');
        }
        const csvText = await response.text();
        const parsedProducts = parseCSV(csvText);
        setProducts(parsedProducts);
      } catch (err) {
        console.error('Spreadsheet loading failure:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  // Preload next & previous gallery images in background to remove visual latency
  useEffect(() => {
    if (!galleryProduct) return;
    setImageLoaded(false);

    const len = galleryProduct.images.length;
    if (len <= 1) return;

    const nextIndex = (galleryIndex + 1) % len;
    const prevIndex = (galleryIndex - 1 + len) % len;

    const imgNext = new Image();
    imgNext.src = galleryProduct.images[nextIndex];

    const imgPrev = new Image();
    imgPrev.src = galleryProduct.images[prevIndex];
  }, [galleryIndex, galleryProduct]);

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

  // Cart Functions (Restricted to unique unit copies)
  const addToCart = (product) => {
    setCart(prevCart => {
      const exists = prevCart.some(item => item.id === product.id);
      if (exists) return prevCart;
      return [...prevCart, product];
    });

    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  };

  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  // Real-time Brand Search Filtering & Combined Multi-level Sorting
  const getFilteredProducts = () => {
    let list = [...products];
    
    // 1. Search Query filtering (checks brand or model field)
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      list = list.filter(p => 
        (p.brand && p.brand.toLowerCase().includes(query)) ||
        (p.model && p.model.toLowerCase().includes(query))
      );
    }
    
    // 2. Combined Sorting Criteria evaluation
    list.sort((a, b) => {
      // First Level: Sort by Condition if selected
      if (sortByCond !== 'none') {
        const scoreA = parseCondition(a.cond);
        const scoreB = parseCondition(b.cond);
        if (scoreA !== scoreB) {
          return sortByCond === 'cond_desc' ? scoreB - scoreA : scoreA - scoreB;
        }
      }
      
      // Second Level: Sort by Price if selected
      if (sortByPrice !== 'none') {
        return sortByPrice === 'price_asc' ? a.price - b.price : b.price - a.price;
      }
      
      return 0;
    });
    
    return list;
  };

  // Telegram SDK sendData Checkout and Close App
  const handleCheckout = () => {
    if (cart.length === 0) return;

    const orderPayload = {
      items: cart.map(item => ({
        id: item.id,
        brand: item.brand,
        model: item.model,
        size: item.size,
        cond: item.cond,
        price: item.price,
        quantity: 1, // Strictly 1 unit per unique item
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
    setSlideDirection(-1);
    setGalleryIndex(prev => 
      prev === 0 ? galleryProduct.images.length - 1 : prev - 1
    );
  };

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    if (!galleryProduct) return;
    setSlideDirection(1);
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
                {/* Search Bar (24px rounded-2xl) with integrated Sliders Filters Button */}
                <div className="relative mt-2 z-20">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="SEARCH BRANDS..."
                    className="w-full bg-[#1c1c1c] text-xs text-[#e5e5e5] rounded-[24px] py-3.5 pl-10 pr-12 placeholder-neutral-500 border border-neutral-800/10 focus:outline-none focus:border-neutral-750 transition-all font-light uppercase tracking-wider"
                  />
                  <Search size={14} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                  
                  {/* Absolute controls stack on the right */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2.5">
                    {searchQuery && (
                      <button 
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="text-neutral-500 hover:text-white transition-colors"
                      >
                        <X size={14} strokeWidth={1.5} />
                      </button>
                    )}
                    <button 
                      type="button"
                      onClick={() => {
                        setShowFilters(true);
                        if (window.Telegram?.WebApp?.HapticFeedback) {
                          window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                        }
                      }}
                      className={`transition-colors p-1 -m-1 ${
                        (sortByPrice !== 'none' || sortByCond !== 'none') ? 'text-white' : 'text-neutral-500 hover:text-neutral-350'
                      }`}
                    >
                      <SlidersHorizontal size={14} strokeWidth={1.8} />
                    </button>
                  </div>
                </div>

                {/* Loading & Error Content States */}
                {loading ? (
                  <SkeletonLoader />
                ) : error ? (
                  <div className="py-20 text-center space-y-4">
                    <p className="text-xs text-neutral-500 font-light tracking-wider uppercase">Failed to retrieve spreadsheet payload</p>
                    <button 
                      type="button"
                      onClick={() => window.location.reload()}
                      className="bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-full px-5 py-2 text-[9px] tracking-widest font-bold uppercase active:scale-95 transition-all"
                    >
                      Retry Load
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Catalog Grid */}
                    <div className="grid grid-cols-2 gap-4 mt-6 pb-8">
                      {getFilteredProducts().map((product) => (
                        <ProductCard 
                          key={product.id}
                          product={product}
                          isInCart={cart.some(item => item.id === product.id)}
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
                  </>
                )}
              </div>
            )}

            {/* VIEW 2: CART */}
            {activeTab === 'Cart' && (
              <div className="py-2 space-y-6">
                <h2 className="text-xs tracking-[0.2em] text-neutral-400 font-semibold uppercase border-b border-neutral-800/30 pb-3">
                  Корзина ({cart.length})
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
                              <span className="text-[9px] tracking-wider text-neutral-500 font-bold uppercase block">BARIGA057</span>
                              <h4 className="text-xs text-white font-medium tracking-wide uppercase truncate max-w-[160px]">{item.brand} {item.model}</h4>
                              <span className="text-[8px] text-neutral-400 font-semibold bg-neutral-900/60 px-1.5 py-0.5 rounded-[5px] border border-neutral-800/20 uppercase mt-1 inline-block">
                                Size: {item.size} • {item.cond}
                              </span>
                            </div>
                            
                            {/* Quantity counters deleted (Only 1 item is ever in stock) */}
                            <div className="mt-2 text-[9px] text-neutral-500 uppercase tracking-widest font-light">
                              В наличии: 1 шт.
                            </div>
                          </div>

                          <div className="flex flex-col justify-between items-end py-0.5">
                            <button 
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="text-neutral-600 hover:text-neutral-450 p-1 transition-colors"
                            >
                              <X size={14} strokeWidth={1.5} />
                            </button>
                            <span className="text-xs text-neutral-450 font-light">
                              {formatPrice(item.price)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-neutral-800/20 pt-4 space-y-2">
                      <div className="flex justify-between text-[11px] tracking-wider text-neutral-500 font-light">
                        <span>SUBTOTAL</span>
                        <span>{formatPrice(getCartTotal())}</span>
                      </div>
                      <div className="flex justify-between text-[11px] tracking-wider text-neutral-500 font-light">
                        <span>DELIVERY</span>
                        <span className="text-[9px] tracking-widest text-neutral-500 uppercase font-bold">FREE</span>
                      </div>
                      <div className="flex justify-between text-xs tracking-widest text-[#e5e5e5] border-t border-neutral-800/20 pt-3 font-semibold">
                        <span>TOTAL</span>
                        <span>{formatPrice(getCartTotal())}</span>
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

            {/* VIEW 3: PROFILE */}
            {activeTab === 'Profile' && (
              <div className="py-2 space-y-6">
                <h2 className="text-xs tracking-[0.2em] text-neutral-400 font-semibold uppercase border-b border-neutral-800/30 pb-3">
                  Профиль
                </h2>

                {/* Dark Rounded User Card */}
                <div className="bg-[#1c1c1c] rounded-2xl p-5 flex items-center gap-4 border border-neutral-800/10 shadow-lg">
                  {/* Left: Round Avatar */}
                  <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-neutral-800 border border-neutral-700/30 flex items-center justify-center shadow-inner">
                    {user?.photo_url ? (
                      <img 
                        src={user.photo_url} 
                        alt="Profile Avatar" 
                        className="w-full h-full object-cover" 
                        draggable="false" 
                        onContextMenu={(e) => e.preventDefault()} 
                      />
                    ) : (
                      <span className="text-white text-xl font-bold uppercase select-none">
                        {user?.first_name?.[0] || user?.username?.[0] || 'Г'}
                      </span>
                    )}
                  </div>

                  {/* Right: name, username, date, ID */}
                  <div className="flex-grow min-w-0">
                    <h3 className="text-sm font-bold text-white truncate uppercase tracking-wider">
                      {user ? `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}` : 'Гость'}
                    </h3>
                    <p className="text-[10px] text-neutral-500 font-light mt-0.5 tracking-wide truncate">
                      {user?.username ? `@${user.username}` : '@guest_account'}
                    </p>
                    <p className="text-[9px] text-neutral-600 font-light mt-1 tracking-widest leading-none">
                      ID: {user?.id ?? 'Неизвестно'}
                    </p>
                    <p className="text-[9px] text-neutral-450 font-light mt-2 uppercase tracking-widest leading-none">
                      В магазине с {getRegDate()}
                    </p>
                  </div>
                </div>

                {/* SDK Diagnostics details */}
                <div className="bg-[#1c1c1c] rounded-[24px] border border-neutral-800/15 p-5 space-y-2.5 text-[10px] font-light tracking-wider text-neutral-500">
                  <div className="text-[8px] tracking-[0.2em] text-neutral-400 font-bold uppercase mb-1">SDK DIAGNOSTICS</div>
                  <div className="flex justify-between">
                    <span>Platform</span>
                    <span className="uppercase text-neutral-300">{window.Telegram?.WebApp?.platform || 'Browser'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SDK Version</span>
                    <span className="text-neutral-300">{window.Telegram?.WebApp?.version || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>initData</span>
                    <span className="text-neutral-300">{window.Telegram?.WebApp?.initData ? 'OK' : 'empty'}</span>
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
              {cart.length}
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

      {/* FULLSCREEN IMAGE GALLERY MODAL WITH SPRING ZOOM & SLIDE TRANSITIONS */}
      <AnimatePresence>
        {galleryProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black flex flex-col justify-between items-center py-6 px-6 h-[100dvh] overflow-hidden"
          >
            {/* Header Block */}
            <div className="flex justify-between items-center w-full relative z-10 flex-shrink-0">
              <span className="text-[9px] tracking-[0.2em] font-semibold text-neutral-400 uppercase">
                {galleryIndex + 1} / {galleryProduct.images.length}
              </span>
              <button 
                type="button"
                onClick={closeGallery}
                className="text-neutral-400 hover:text-white p-1.5 bg-neutral-900/60 rounded-full border border-neutral-800/30 transition-colors cursor-pointer"
              >
                <X size={15} strokeWidth={1.5} />
              </button>
            </div>

            {/* Center Swipeable Image Wrapper */}
            <div className="relative flex-grow flex items-center justify-center w-full min-h-0 my-2 overflow-hidden">
              {/* Spinner loader while image loads */}
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-[2px] z-10 rounded-[24px]">
                  <div className="w-8 h-8 border-2 border-neutral-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {/* 
                USER TIP: Рекомендуется сжимать фотографии перед загрузкой на фотохостинг до разрешения 1000-1200px по широкой стороне. 
                Это ускорит загрузку и работу галереи в 5-10 раз.
              */}
              <div className="relative w-full max-w-sm max-h-[50vh] bg-neutral-950 rounded-[24px] overflow-hidden border border-neutral-800/10 shadow-2xl flex items-center justify-center aspect-[4/5]">
                <AnimatePresence initial={false} custom={slideDirection}>
                  <motion.img 
                    key={galleryProduct.images[galleryIndex]}
                    custom={slideDirection}
                    variants={{
                      enter: (direction) => ({
                        x: direction > 0 ? '100%' : '-100%',
                        opacity: 0
                      }),
                      center: {
                        x: 0,
                        opacity: 1
                      },
                      exit: (direction) => ({
                        x: direction < 0 ? '100%' : '-100%',
                        opacity: 0
                      })
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                    src={galleryProduct.images[galleryIndex]} 
                    alt="Fullscreen View" 
                    className="w-full h-full max-h-[50vh] object-contain absolute"
                    draggable="false"
                    onContextMenu={(e) => e.preventDefault()}
                    onLoad={() => setImageLoaded(true)}
                  />
                </AnimatePresence>
              </div>

              {/* Left Arrow */}
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-0 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-neutral-900/80 text-white hover:bg-neutral-800 transition-colors border border-neutral-800/20 active:scale-90 z-20"
              >
                <ChevronLeft size={16} strokeWidth={2} />
              </button>

              {/* Right Arrow */}
              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-neutral-900/80 text-white hover:bg-neutral-800 transition-colors border border-neutral-800/20 active:scale-90 z-20"
              >
                <ChevronRight size={16} strokeWidth={2} />
              </button>
            </div>

            {/* Bottom Metadata Block */}
            <div className="text-center space-y-1 relative z-10 flex-shrink-0 w-full py-2">
              <span className="text-[9px] tracking-[0.25em] text-neutral-500 font-bold uppercase block">
                BARIGA057
              </span>
              <h4 className="text-xs text-white font-medium tracking-widest uppercase truncate px-4">
                {galleryProduct.brand} {galleryProduct.model}
              </h4>
              <p className="text-[9px] text-neutral-450 tracking-wider font-light uppercase">
                SIZE: {galleryProduct.size} • COND: {galleryProduct.cond} • {galleryProduct.kit}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SORTING BOTTOM SHEET DIALOG */}
      <AnimatePresence>
        {showFilters && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 max-w-md mx-auto"
            />
            
            {/* Bottom Sheet wrapper */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.25}
              onDragEnd={(e, info) => {
                // If dragged down past threshold, close sheet
                if (info.offset.y > 100) {
                  setShowFilters(false);
                }
              }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#1c1c1c] rounded-t-[32px] border-t border-neutral-800/40 p-6 pb-8 z-50 select-none shadow-2xl flex flex-col items-center"
            >
              {/* Drag Handle Indicator */}
              <div className="w-12 h-1 bg-neutral-700 rounded-full mb-6 flex-shrink-0 cursor-grab active:cursor-grabbing" />

              <div className="w-full text-center space-y-5">
                
                {/* Header Container with RESET button in the corner */}
                <div className="flex justify-between items-center w-full pb-1">
                  <div className="w-12" /> {/* Spacer for centering */}
                  <h3 className="text-xs font-bold tracking-[0.25em] text-[#e5e5e5] uppercase">
                    Сортировка
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setSortByPrice('none');
                      setSortByCond('none');
                      if (window.Telegram?.WebApp?.HapticFeedback) {
                        window.Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
                      }
                    }}
                    className="text-[9px] font-semibold tracking-wider text-neutral-500 hover:text-white uppercase transition-colors"
                  >
                    Сбросить
                  </button>
                </div>

                {/* Grid of Pill Filter Buttons */}
                <div className="flex flex-col gap-3.5 w-full">
                  
                  {/* Subtitle: По цене */}
                  <div className="text-[9px] tracking-wider text-neutral-500 font-bold uppercase text-left">
                    По цене
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSortByPrice(sortByPrice === 'price_asc' ? 'none' : 'price_asc')}
                      className={`py-3 px-4 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${
                        sortByPrice === 'price_asc'
                          ? 'bg-white text-black font-extrabold shadow-lg shadow-white/5'
                          : 'bg-neutral-900 text-neutral-450 border border-neutral-800/40'
                      }`}
                    >
                      От дешевых
                    </button>
                    <button
                      type="button"
                      onClick={() => setSortByPrice(sortByPrice === 'price_desc' ? 'none' : 'price_desc')}
                      className={`py-3 px-4 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${
                        sortByPrice === 'price_desc'
                          ? 'bg-white text-black font-extrabold shadow-lg shadow-white/5'
                          : 'bg-neutral-900 text-neutral-450 border border-neutral-800/40'
                      }`}
                    >
                      От дорогих
                    </button>
                  </div>

                  {/* Subtitle: По состоянию */}
                  <div className="text-[9px] tracking-wider text-neutral-500 font-bold uppercase text-left mt-2">
                    По состоянию
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSortByCond(sortByCond === 'cond_desc' ? 'none' : 'cond_desc')}
                      className={`py-3 px-4 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${
                        sortByCond === 'cond_desc'
                          ? 'bg-white text-black font-extrabold shadow-lg shadow-white/5'
                          : 'bg-neutral-900 text-neutral-450 border border-neutral-800/40'
                      }`}
                    >
                      От нового
                    </button>
                    <button
                      type="button"
                      onClick={() => setSortByCond(sortByCond === 'cond_asc' ? 'none' : 'cond_asc')}
                      className={`py-3 px-4 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${
                        sortByCond === 'cond_asc'
                          ? 'bg-white text-black font-extrabold shadow-lg shadow-white/5'
                          : 'bg-neutral-900 text-neutral-450 border border-neutral-800/40'
                      }`}
                    >
                      От б/у
                    </button>
                  </div>

                </div>

                {/* Close Button / Apply Button */}
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="w-full bg-[#e5e5e5] text-black py-3 rounded-full text-[10px] font-bold tracking-[0.2em] transition-all uppercase mt-6 active:scale-95 shadow-md"
                >
                  Применить
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;
