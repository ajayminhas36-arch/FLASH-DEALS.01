import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, X, ShoppingBag, ChevronLeft, ChevronRight, ShieldCheck, Truck, Clock } from 'lucide-react';
import { FlashReel } from '../types';
import { dataService } from '../services/dataService';
import { Button } from './ui/button';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function FlashReels() {
  const [reels, setReels] = useState<FlashReel[]>([]);
  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = dataService.subscribeToReels(setReels);
    return () => unsubscribe();
  }, []);

  // Handle back button to close reel
  useEffect(() => {
    if (location.state?.viewingReel !== undefined) {
      setActiveReelIndex(location.state.viewingReel);
    } else {
      setActiveReelIndex(null);
    }
  }, [location.state]);

  const openReel = (index: number) => {
    navigate(location.pathname, { state: { ...location.state, viewingReel: index } });
  };

  const closeReel = () => {
    if (location.state?.viewingReel !== undefined) {
      navigate(-1);
    } else {
      setActiveReelIndex(null);
    }
  };

  if (reels.length === 0) return null;

  return (
    <section className="space-y-6">
      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-2 px-1">
        {[
          { icon: ShieldCheck, text: "Secure Pay", color: "text-blue-500", bg: "bg-blue-50" },
          { icon: Truck, text: "Fast Delivery", color: "text-green-500", bg: "bg-green-50" },
          { icon: Clock, text: "24/7 Help", color: "text-purple-500", bg: "bg-purple-50" }
        ].map((badge, i) => (
          <div key={i} className={cn("flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-neutral-100 bg-white shadow-sm", badge.bg)}>
            <badge.icon size={18} className={badge.color} />
            <span className="text-[9px] font-black uppercase tracking-wider text-neutral-600">{badge.text}</span>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <div className="bg-red-500 p-1.5 rounded-xl animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]">
              <Play className="text-white fill-white" size={14} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900">Flash Reels</h2>
          </div>
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Live Demo</span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x px-1">
          {reels.map((reel, index) => (
            <motion.div 
              key={reel.id}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openReel(index)}
              className="relative w-32 h-56 rounded-[24px] overflow-hidden flex-shrink-0 bg-neutral-900 shadow-lg snap-center cursor-pointer group border-2 border-transparent hover:border-orange-500 transition-all duration-300"
            >
              <video
                src={reel.videoUrl}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                muted
                playsInline
                loop
                onMouseOver={(e) => e.currentTarget.play()}
                onMouseOut={(e) => {
                  e.currentTarget.pause();
                  e.currentTarget.currentTime = 0;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-white font-black text-[10px] leading-tight line-clamp-2 uppercase tracking-wider">
                  {reel.title}
                </p>
              </div>
              <div className="absolute top-2 right-2">
                <div className="bg-orange-gradient text-white text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-orange animate-pulse">
                  LIVE
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeReelIndex !== null && (
          <ReelViewer 
            reels={reels} 
            initialIndex={activeReelIndex} 
            onClose={closeReel} 
          />
        )}
      </AnimatePresence>
    </section>
  );
}

const ReelViewer = ({ reels, initialIndex, onClose }: { reels: FlashReel[], initialIndex: number, onClose: () => void }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(false); // Default to unmuted as requested
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);

  const currentReel = reels[currentIndex];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(err => {
        console.log("Autoplay prevented, muting to play");
        setIsMuted(true);
      });
      setIsPlaying(true);
    }
  }, [currentIndex]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const nextReel = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const prevReel = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
    >
      <div className="relative w-full max-w-md h-full sm:h-[90vh] sm:rounded-[40px] overflow-hidden bg-neutral-900 shadow-2xl">
        <video
          ref={videoRef}
          src={currentReel.videoUrl}
          className="w-full h-full object-cover"
          playsInline
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onEnded={nextReel}
          onClick={togglePlay}
        />

        {/* Progress Bars */}
        <div className="absolute top-4 left-4 right-4 flex gap-1.5 z-20">
          {reels.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{ 
                  width: idx < currentIndex ? "100%" : idx === currentIndex ? `${progress}%` : "0%" 
                }}
                transition={{ duration: 0.1 }}
              />
            </div>
          ))}
        </div>

        {/* Top Controls */}
        <div className="absolute top-8 left-6 right-6 flex justify-between items-center z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-gradient p-0.5">
              <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center">
                <ShoppingBag size={18} className="text-orange-500" />
              </div>
            </div>
            <div>
              <h3 className="text-white font-black text-sm tracking-tight">{currentReel.title}</h3>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{currentReel.category || 'Flash Deal'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
              className="p-2.5 glass-dark rounded-full text-white hover:bg-white/20 transition-all"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="p-2.5 glass-dark rounded-full text-white hover:bg-white/20 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
          <button 
            onClick={(e) => { e.stopPropagation(); prevReel(); }}
            className={cn(
              "p-3 glass-dark rounded-full text-white pointer-events-auto transition-opacity",
              currentIndex === 0 ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); nextReel(); }}
            className="p-3 glass-dark rounded-full text-white pointer-events-auto"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Bottom Info & Action */}
        <div className="absolute bottom-10 left-6 right-6 space-y-6 z-20">
          <div className="space-y-2">
            <h2 className="text-white text-2xl font-black leading-tight drop-shadow-lg">
              {currentReel.title}
            </h2>
            <p className="text-white/80 text-sm font-medium line-clamp-2 drop-shadow-md">
              Experience the future of shopping with our exclusive flash deals. Limited time only!
            </p>
          </div>

          {currentReel.productId && (
            <Link to={`/product/${currentReel.productId}`} onClick={onClose}>
              <Button variant="orange" className="w-full h-14 rounded-2xl font-black text-lg shadow-orange group">
                VIEW PRODUCT
                <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          )}
        </div>

        {/* Play/Pause Indicator */}
        <AnimatePresence>
          {!isPlaying && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="p-8 glass rounded-full">
                <Play size={48} fill="currentColor" className="text-white ml-2" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
