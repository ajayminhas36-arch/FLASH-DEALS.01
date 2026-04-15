import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Flame, Lock, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface ProductCardProps {
  product: Product;
  index: number;
  key?: string | number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const isFlashDeal = product.isActive;

  return (
    <motion.div
      layoutId={`card-${product.id}`}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.23, 1, 0.32, 1]
      }}
    >
      <Link to={`/product/${product.id}`}>
        <motion.div
          whileHover={{ 
            y: -12, 
            scale: 1.02,
            rotateZ: isFlashDeal ? 0.5 : 0
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="h-full"
        >
          <Card className={cn(
            "h-full overflow-hidden border-none bg-white group relative transition-all duration-500",
            isFlashDeal 
              ? "rounded-[40px] shadow-3d hover:shadow-[0_30px_60px_rgba(255,106,0,0.2)]" 
              : "rounded-[28px] shadow-premium hover:shadow-3d"
          )}>
            <div className={cn(
              "relative overflow-hidden",
              isFlashDeal ? "aspect-[16/9]" : "aspect-square"
            )}>
              <motion.img 
                layoutId={`image-${product.id}`}
                src={product.image} 
                alt={product.name} 
                className={cn(
                  "w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110",
                  !isFlashDeal && "grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100"
                )}
                referrerPolicy="no-referrer"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity duration-500" />
              
              {isFlashDeal ? (
                <>
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
                    <div className="w-2 h-2 bg-orange-50 rounded-full animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                    ONLY {product.stock} LEFT
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center group-hover:backdrop-blur-0 group-hover:bg-transparent transition-all duration-500">
                  <div className="glass p-3 rounded-2xl shadow-xl group-hover:scale-0 transition-transform duration-300">
                    <Lock size={20} className="text-neutral-400" />
                  </div>
                </div>
              )}
            </div>

            <CardContent className={cn(
              "p-6",
              isFlashDeal ? "p-8" : "p-5"
            )}>
              {isFlashDeal ? (
                <>
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
                </>
              ) : (
                <>
                  <h3 className="font-black text-sm truncate mb-3 text-neutral-800 group-hover:text-orange-600 transition-colors">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-neutral-400 group-hover:text-orange-500 transition-colors">Price Locked</span>
                    <div className="bg-neutral-100 p-2 rounded-xl group-hover:bg-orange-100 group-hover:text-orange-600 transition-all duration-300">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </Link>
    </motion.div>
  );
}
