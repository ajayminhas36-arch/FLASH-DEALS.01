import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInAnonymously
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { ShoppingBag, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import firebaseConfig from '../../firebase-applet-config.json';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      setLoading(true);
      setLastError(null);
      await signInWithPopup(auth, provider);
      toast.success('Logged in successfully!');
    } catch (error: any) {
      console.error("Google Login Error:", error);
      setLastError(`${error.code}: ${error.message}`);
      
      if (error.code === 'auth/popup-blocked') {
        toast.error('Popup blocked! Please allow popups for this site.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Login window was closed. Please try again and keep the window open.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Request was cancelled, usually by another login attempt
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error('This domain is not authorized in Firebase. See Debug Info for the domain to whitelist.');
      } else {
        toast.error(error.message || 'Google login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const openInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      setLastError(null);
      await signInAnonymously(auth);
      toast.success('Logged in as Guest');
    } catch (error: any) {
      console.error("Guest Login Error:", error);
      setLastError(`${error.code}: ${error.message}`);
      toast.error('Guest login failed. It might not be enabled in Firebase.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLastError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Logged in successfully!');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Account created successfully!');
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      setLastError(`${error.code}: ${error.message}`);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50 p-4">
      <Card className="w-full max-w-md border-none shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ 
                duration: 0.8, 
                ease: "backOut",
                delay: 0.2
              }}
              className="bg-orange-gradient p-4 rounded-3xl shadow-orange-glow relative group"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <ShoppingBag className="text-white" size={40} strokeWidth={2.5} />
              </motion.div>
              <div className="absolute -inset-2 bg-orange-400/20 rounded-full blur-2xl -z-10 group-hover:bg-orange-400/40 transition-all duration-500" />
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <CardTitle className="text-3xl font-black tracking-tight text-orange-gradient">FlashDeal Mobile</CardTitle>
            <CardDescription className="text-neutral-500 font-medium">
              {isLogin ? 'Welcome back! Login to your account' : 'Join the club! Create a new account'}
            </CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-4">
          {lastError && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="text-red-500 shrink-0" size={18} />
              <div className="text-xs text-red-700 font-medium">
                <p className="font-bold mb-1">Authentication Error</p>
                <p className="opacity-80">{lastError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <Button variant="orange" className="w-full h-12" type="submit" disabled={loading}>
              {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-neutral-500">Or continue with</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
              Google
            </Button>
            <Button variant="outline" className="w-full" onClick={handleGuestLogin} disabled={loading}>
              Guest
            </Button>
          </div>

          <div className="pt-2">
            <Button variant="ghost" size="sm" className="w-full text-neutral-400 text-[10px] hover:text-orange-600" onClick={openInNewTab}>
              Trouble logging in? Open in New Tab
            </Button>
          </div>

          <div className="pt-2">
            <button 
              onClick={() => setShowDebug(!showDebug)}
              className="text-[10px] text-neutral-400 flex items-center gap-1 hover:text-neutral-600 transition-colors mx-auto"
            >
              <ShieldAlert size={10} />
              {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
            </button>
            
            {showDebug && (
              <div className="mt-4 p-3 bg-neutral-100 rounded-xl text-[10px] font-mono text-neutral-500 space-y-2 overflow-hidden">
                <p className="font-bold text-neutral-700 flex items-center gap-1">
                  <Info size={10} /> System Configuration
                </p>
                <div className="grid grid-cols-2 gap-1">
                  <span>Current Domain:</span>
                  <span className="truncate font-bold text-orange-600">{window.location.hostname}</span>
                  <span>Project ID:</span>
                  <span className="truncate">{firebaseConfig.projectId}</span>
                  <span>Auth Domain:</span>
                  <span className="truncate">{firebaseConfig.authDomain}</span>
                </div>
                <p className="mt-2 text-neutral-400 italic leading-tight">
                  Note: If Google login fails, ensure <span className="font-bold">{window.location.hostname}</span> is added to "Authorized Domains" in Firebase Console (Authentication &gt; Settings).
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button variant="link" className="text-sm text-neutral-500" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
