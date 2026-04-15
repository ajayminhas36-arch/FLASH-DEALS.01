import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import { Home, ClipboardList, ShoppingBag, User, Bell, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import Chatbot from './Chatbot';

export default function Layout() {
  const location = useLocation();
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/requests', icon: ClipboardList, label: 'Requests' },
    { to: '/orders', icon: ShoppingBag, label: 'Orders' },
    { to: '/profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="flex flex-col h-screen bg-neutral-50 max-w-md mx-auto relative overflow-hidden shadow-xl border-x border-neutral-200">
      {/* Top Header */}
      <header className="absolute top-0 left-0 right-0 h-16 px-6 flex items-center justify-between z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-gradient rounded-xl flex items-center justify-center shadow-orange">
            <ShoppingBag size={18} className="text-white" />
          </div>
          <span className="font-black text-lg tracking-tighter uppercase italic">Flash<span className="text-orange-600">Deal</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/orders" className="p-2.5 bg-neutral-100 rounded-2xl text-neutral-600 hover:bg-orange-50 hover:text-orange-600 transition-all">
            <ShoppingCart size={20} />
          </Link>
          <Link to="/orders" className="p-2.5 bg-neutral-100 rounded-2xl text-neutral-600 hover:bg-orange-50 hover:text-orange-600 transition-all">
            <ClipboardList size={20} />
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pt-16 pb-24 scrollbar-hide relative [perspective:1000px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="absolute bottom-6 left-6 right-6 glass px-6 py-4 flex justify-between items-center z-50 rounded-[32px]">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1.5 transition-all duration-500 relative py-1",
                isActive ? "text-orange-600" : "text-neutral-400 hover:text-neutral-600"
              )
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  animate={isActive ? { 
                    scale: [1, 1.2, 1.1], 
                    y: [0, -8, -4],
                  } : { scale: 1, y: 0 }}
                  transition={{ 
                    duration: 0.4,
                    ease: "backOut"
                  }}
                  className={cn(
                    "p-2 rounded-2xl transition-all duration-500",
                    isActive ? "bg-orange-100/50 shadow-[0_8px_20px_rgba(255,106,0,0.2)]" : "bg-transparent"
                  )}
                >
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-500",
                  isActive ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-75"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 w-8 h-1 bg-orange-600 rounded-full shadow-orange-glow"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <Chatbot />
    </div>
  );
}
