import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Banner } from '../types';

const DEFAULT_BANNERS = [
  {
    id: '1',
    image: "https://picsum.photos/seed/flash1/800/400",
    title: "MEGA FLASH SALE",
    subtitle: "Up to 70% OFF on Electronics",
    badge: "Exclusive Offer"
  },
  {
    id: '2',
    image: "https://picsum.photos/seed/flash2/800/400",
    title: "NEW ARRIVALS",
    subtitle: "Latest Gadgets are here",
    badge: "New"
  }
];

export default function HeroCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const unsubscribe = dataService.subscribeToBanners((fetchedBanners) => {
      if (fetchedBanners.length > 0) {
        setBanners(fetchedBanners);
      } else {
        // Fallback to defaults if no banners in DB
        setBanners(DEFAULT_BANNERS as any);
      }
    });
    return () => unsubscribe();
  }, []);

  const nextSlide = useCallback(() => {
    if (banners.length === 0) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    if (banners.length === 0) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, banners.length]);

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 1.1
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.9
    })
  };

  return (
    <div className="relative w-full aspect-[2/1] overflow-hidden rounded-[32px] shadow-premium group">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 35 },
            opacity: { duration: 0.4 },
            scale: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
          }}
          className="absolute inset-0"
        >
          <div className="relative w-full h-full overflow-hidden">
            <motion.img 
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 6, ease: "linear" }}
              src={currentBanner.image} 
              alt={currentBanner.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent flex flex-col justify-center p-8 text-white">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-3 inline-block text-orange-400 bg-orange-400/10 px-2 py-1 rounded-md backdrop-blur-sm">
                  {currentBanner.badge || 'Exclusive Offer'}
                </span>
                <h2 className="text-3xl font-black leading-tight mb-2 drop-shadow-lg">
                  {currentBanner.title}
                </h2>
                <p className="text-sm font-medium text-neutral-200 max-w-[200px] drop-shadow-md">
                  {currentBanner.subtitle}
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      <button 
        onClick={prevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <ChevronLeft size={18} />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
