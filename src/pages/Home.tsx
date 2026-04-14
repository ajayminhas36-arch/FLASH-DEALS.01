import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService } from '../services/dataService';
import { Product } from '../types';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Timer, Flame, Lock, ArrowRight, Search, X, Package, ShoppingCart, ShoppingBag, ShieldCheck, Truck, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '../components/ui/input';
import { cn } from '../lib/utils';
import HeroCarousel from '../components/HeroCarousel';
import FlashReels from '../components/FlashReels';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [timeLeft, setTimeLeft] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = dataService.subscribeToProducts((data) => {
      setProducts(data);
      setIsInitialLoading(false);
    });

    const timer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();
      
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const flashDeals = filteredProducts.filter(p => p.isActive);
  const otherProducts = filteredProducts.filter(p => !p.isActive);

  const FlashDealSkeleton = () => (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white rounded-[32px] overflow-hidden shadow-premium relative">
          <div className="aspect-[16/9] bg-neutral-100 animate-shimmer" />
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2 w-2/3">
                <div className="h-3 bg-neutral-100 rounded w-1/4 animate-shimmer" />
                <div className="h-8 bg-neutral-100 rounded w-full animate-shimmer" />
              </div>
              <div className="h-10 bg-neutral-100 rounded-xl w-1/4 animate-shimmer" />
            </div>
            <div className="h-14 bg-neutral-100 rounded-2xl w-full animate-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );

  const OtherProductSkeleton = () => (
    <div className="grid grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-[24px] overflow-hidden shadow-premium relative">
          <div className="aspect-square bg-neutral-100 animate-shimmer" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-neutral-100 rounded w-3/4 animate-shimmer" />
            <div className="h-3 bg-neutral-100 rounded w-1/2 animate-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-4 space-y-8 pb-32">
      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-orange-500 transition-colors z-10">
          <Search size={20} />
        </div>
        <Input
          type="text"
          placeholder="Search products..."
          className="pl-12 pr-12 h-14 bg-white/80 backdrop-blur-xl border-none shadow-premium rounded-[24px] focus-visible:ring-2 focus-visible:ring-orange-500/50 transition-all font-bold text-neutral-800 placeholder:text-neutral-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-4 flex items-center text-neutral-400 hover:text-orange-600 transition-colors z-10"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Flash Reels */}
      <FlashReels />

      {/* Today's Deals */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-orange-600 p-1.5 rounded-xl shadow-orange-glow">
              <Flame className="text-white" fill="currentColor" size={18} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900">Flash Deals</h2>
          </div>
          <Badge variant="outline" className="border-orange-200 text-orange-600 font-bold bg-orange-50">
            Ends Soon
          </Badge>
        </div>

        <div className="space-y-4">
          {isInitialLoading ? (
            <FlashDealSkeleton />
          ) : flashDeals.length > 0 ? (
            flashDeals.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Link to={`/product/${product.id}`}>
                  <motion.div
                    whileHover={{ y: -12, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Card className="overflow-hidden border-none shadow-premium bg-white group relative rounded-[40px] hover:shadow-[0_20px_50px_rgba(255,106,0,0.15)] transition-all duration-500">
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                        
                        {/* Discount Tag */}
                        <div className="absolute top-5 left-5 flex flex-col gap-2">
                          <Badge className="bg-orange-gradient text-white border-none px-4 py-1.5 font-black shadow-orange-glow text-[11px] rounded-xl">
                            {Math.round((1 - product.discountedPrice! / product.originalPrice) * 100)}% OFF
                          </Badge>
                          <div className="glass px-3 py-1 rounded-xl text-orange-600 text-[10px] font-black flex items-center gap-1.5">
                            <Flame size={12} fill="currentColor" />
                            HOT DEAL
                          </div>
                        </div>

                        {/* Stock Label */}
                        <div className={cn(
                          "absolute bottom-5 right-5 glass-dark px-4 py-2 rounded-2xl text-[10px] font-black text-white flex items-center gap-2",
                          product.stock <= 5 && "animate-shake border-orange-500/50"
                        )}>
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                          ONLY {product.stock} LEFT
                        </div>
                      </div>
                      <CardContent className="p-8">
                        <div className="flex justify-between items-end mb-6">
                          <div className="space-y-1">
                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">{product.category}</span>
                            <h3 className="font-black text-2xl leading-tight text-neutral-900 group-hover:text-orange-600 transition-colors">{product.name}</h3>
                          </div>
                          <div className="text-right">
                            <span className="block text-xs text-neutral-400 line-through font-bold mb-1">${product.originalPrice}</span>
                            <span className="block text-4xl font-black text-orange-600 tracking-tighter">${product.discountedPrice}</span>
                          </div>
                        </div>
                        <Button variant="orange" className="w-full h-16 rounded-[24px] font-black text-xl shadow-orange group-hover:scale-[1.02] transition-transform">
                          GRAB IT NOW
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 bg-neutral-100 rounded-2xl border-2 border-dashed border-neutral-200">
              <p className="text-neutral-400">No flash deals active today.</p>
            </div>
          )}
        </div>
      </section>

      {/* Other Products */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-neutral-900 p-1.5 rounded-xl">
              <Package className="text-white" size={18} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900">Other Products</h2>
          </div>
          <Badge variant="secondary" className="bg-neutral-100 text-neutral-400 font-bold border-none">
            Locked
          </Badge>
        </div>

        {isInitialLoading ? (
          <OtherProductSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {otherProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Link to={`/product/${product.id}`}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Card className="overflow-hidden border-none shadow-premium hover:shadow-[0_15px_35px_rgba(0,0,0,0.1)] transition-all duration-500 bg-white relative group rounded-[28px]">
                      <div className="relative aspect-square overflow-hidden grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center group-hover:backdrop-blur-0 group-hover:bg-transparent transition-all duration-500">
                          <div className="glass p-3 rounded-2xl shadow-xl group-hover:scale-0 transition-transform duration-300">
                            <Lock size={20} className="text-neutral-400" />
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-black text-sm truncate mb-3 text-neutral-800 group-hover:text-orange-600 transition-colors">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-neutral-400 group-hover:text-orange-500 transition-colors">Price Locked</span>
                          <div className="bg-neutral-100 p-2 rounded-xl group-hover:bg-orange-100 group-hover:text-orange-600 transition-all duration-300">
                            <ArrowRight size={14} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Trust Section */}
      <section className="bg-white rounded-[40px] p-8 shadow-premium space-y-6 border border-neutral-50">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black tracking-tight">Why Shop With Us?</h2>
          <p className="text-neutral-400 text-sm font-bold uppercase tracking-widest">Premium Quality Guaranteed</p>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-black text-sm">Secure Checkout</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">Your transactions are protected by industry-leading security protocols.</p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
              <Truck size={24} />
            </div>
            <h3 className="font-black text-sm">Express Shipping</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">Get your favorite products delivered to your doorstep in record time.</p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
              <Clock size={24} />
            </div>
            <h3 className="font-black text-sm">24/7 Support</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">Our dedicated team is always here to help you with any queries.</p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
              <ShoppingBag size={24} />
            </div>
            <h3 className="font-black text-sm">Authentic Goods</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">We only source 100% original and high-quality products from top brands.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
