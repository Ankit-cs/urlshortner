import { useState, useEffect } from 'react';
import { Link, ArrowRight, Check, Copy, QrCode, Zap, History, Trash2, Scissors, Globe, Layers, Shield, Clock, Sun, Moon, BarChart2, LayoutDashboard, Smartphone, Ban, Gift, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Turnstile } from '@marsidev/react-turnstile';
import { useLinkStore } from './stores/useLinkStore';
import { Routes, Route, useLocation, Link as RouterLink, useNavigate, Navigate, useParams } from 'react-router-dom';
import FAQ from './pages/FAQ';
import Disclaimer from './pages/Disclaimer';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Contact from './pages/Contact';
import HowItWorks from './pages/HowItWorks';
import Dashboard from './pages/Dashboard';
import AllLinks from './pages/AllLinks';
import Analytics from './pages/Analytics';
import LinkAnalytics from './pages/LinkAnalytics';
import CookieConsent from './components/CookieConsent';
import ConfirmModal from './components/ConfirmModal';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import TodosTest from './pages/TodosTest';
import { backupLinkToDrive } from './utils/googleDrive';
import AuthButton from './components/AuthButton';
import { Toaster, toast } from 'sonner';

function RedirectHandler() {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const [targetUrl, setTargetUrl] = useState(null);
  const [countdown, setCountdown] = useState(2);
  const [error, setError] = useState(false);

  // Inject no-referrer meta tag so destination site cannot see the user's previous page
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'referrer';
    meta.content = 'no-referrer';
    document.head.appendChild(meta);
    return () => document.head.removeChild(meta);
  }, []);

  useEffect(() => {
    const knownRoutes = ['faq', 'about', 'disclaimer', 'how-it-works', 'dashboard', 'not-found', 'contact', 'privacy-policy', 'terms-of-service'];
    if (knownRoutes.includes(shortCode)) return;

    const resolveLink = async () => {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      try {
        const res = await fetch(`${apiUrl}/api/resolve/${shortCode}`);
        if (res.ok) {
          const data = await res.json();
          setTargetUrl(data.targetUrl);
        } else {
          navigate('/not-found', { replace: true });
        }
      } catch (err) {
        setError(true);
      }
    };

    resolveLink();
  }, [shortCode, navigate]);

  // Countdown and auto-redirect once target is known
  useEffect(() => {
    if (!targetUrl) return;
    if (countdown <= 0) {
      // Ensure we redirect properly by checking the protocol
      let finalUrl = targetUrl;
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }
      window.location.href = finalUrl;
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [targetUrl, countdown]);

  const handleContinue = () => {
    if (targetUrl) {
      let finalUrl = targetUrl;
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }
      window.location.href = finalUrl;
    }
  };

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-xl font-bold text-black dark:text-white mb-2">Link unavailable</h2>
        <p className="text-gray-500">This link may have expired or been deleted.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none"
      >
        {!targetUrl ? (
          <>
            <div className="w-8 h-8 border-4 border-black/10 border-t-black dark:border-white/10 dark:border-t-white rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold text-black dark:text-white">Resolving link...</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Just a moment</p>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mx-auto mb-6">
              <ArrowRight size={18} className="text-black dark:text-white" />
            </div>
            <h2 className="text-xl font-bold text-black dark:text-white mb-2">You are being redirected</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">You will be taken to the following destination:</p>
            <div className="bg-gray-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 mb-6 text-left">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider font-semibold">Destination</p>
              <p className="text-sm text-black dark:text-white font-medium break-all leading-relaxed">{targetUrl}</p>
            </div>
            <button
              onClick={handleContinue}
              className="w-full bg-black text-white dark:bg-white dark:text-black py-3 rounded-xl font-semibold text-sm hover:opacity-80 transition-opacity mb-3"
            >
              Continue now
            </button>
            <p className="text-xs text-gray-400 dark:text-gray-500">Redirecting automatically in {countdown}s</p>
          </>
        )}
      </motion.div>
    </div>
  );
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add('light');
    localStorage.setItem('theme', 'light');
  }, []);

  const toggleTheme = () => {};

  const handleWhyClick = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      let attempts = 0;
      const tryScroll = setInterval(() => {
        const element = document.getElementById('why');
        if (element) {
          clearInterval(tryScroll);
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }
        attempts++;
        if (attempts > 20) clearInterval(tryScroll);
      }, 50);
    } else {
      const element = document.getElementById('why');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleFeaturesClick = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      let attempts = 0;
      const tryScroll = setInterval(() => {
        const element = document.getElementById('features');
        if (element) {
          clearInterval(tryScroll);
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }
        attempts++;
        if (attempts > 20) clearInterval(tryScroll);
      }, 50);
    } else {
      const element = document.getElementById('features');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLogoClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.location.hash) {
        window.history.replaceState(null, '', '/');
      }
    }
  };

  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      const hrs = String(date.getHours()).padStart(2, '0');
      const mins = String(date.getMinutes()).padStart(2, '0');
      const secs = String(date.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hrs}:${mins}:${secs}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentResult, setCurrentResult] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, session, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const { links, addLink, removeLink, clearLinks } = useLinkStore();
  const [copiedId, setCopiedId] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false });
  const [userLinks, setUserLinks] = useState([]);
  const [userLinksLoading, setUserLinksLoading] = useState(false);

  useEffect(() => {
    if (showHistory && session?.access_token) {
      setUserLinksLoading(true);
      const fetchUserLinks = async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/links` : '/api/links';
          const res = await fetch(apiUrl, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setUserLinks(data.links || []);
          }
        } catch (err) {
          console.error("Failed to fetch user links:", err);
        } finally {
          setUserLinksLoading(false);
        }
      };
      fetchUserLinks();
    }
  }, [showHistory, session]);

  const handleDeleteLink = async (shortCode) => {
    if (session?.access_token) {
      setConfirmConfig({
        isOpen: true,
        title: 'Delete Link',
        message: 'Are you sure you want to delete this link forever? This action cannot be undone.',
        confirmText: 'Delete',
        isDestructive: true,
        onConfirm: async () => {
          try {
            const apiUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/links/${shortCode}` : `/api/links/${shortCode}`;
            const res = await fetch(apiUrl, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${session.access_token}`
              }
            });
            if (res.ok) {
              setUserLinks(prev => prev.filter(l => l.shortCode !== shortCode));
              toast.success("Link deleted successfully.");
            } else {
              toast.error("Failed to delete link.");
            }
          } catch (err) {
            console.error("Delete error:", err);
            toast.error("Error deleting link.");
          }
        }
      });
    }
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    setError('');
    setCurrentResult(null);
    setShowQR(false);

    if (!user) {
      toast.error('Please sign in to shorten links.');
      setShowAuthModal(true);
      return;
    }

    if (!url) {
      setError('Please enter a URL');
      return;
    }

    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    if (!session?.access_token && !turnstileToken) {
      setError('Please wait for the security check to complete.');
      return;
    }

    setLoading(true);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const apiUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/shorten` : '/api/shorten';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ url, alias: alias || undefined, turnstileToken })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to shorten URL');
      }

      const newLink = {
        id: data.shortCode,
        originalUrl: url,
        shortUrl: `${window.location.origin}/${data.shortCode}`,
        createdAt: new Date().toISOString()
      };

      // Backup to Google Drive if user has a provider token
      if (session?.provider_token) {
        // Fire and forget, don't await so we don't block the UI
        backupLinkToDrive(session, {
          shortCode: data.shortCode,
          originalUrl: url,
          date: new Date().toISOString()
        }).catch(e => console.error("Drive Backup Error:", e));
      }

      setCurrentResult(newLink);
      // Only store on device (localStorage) for anonymous users!
      if (!session?.user) {
        addLink(newLink);
      } else {
        // Optimistic UI cache for logged in users (solves KV eventual consistency delay)
        const pending = JSON.parse(sessionStorage.getItem('pendingLinks') || '[]');
        pending.unshift({
          shortCode: newLink.id,
          originalUrl: newLink.originalUrl,
          createdAt: newLink.createdAt,
          clicks: 0
        });
        sessionStorage.setItem('pendingLinks', JSON.stringify(pending));
      }
      setUrl('');
      setAlias('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-black/10 bg-brand-light text-text-primary relative z-0 overflow-hidden transition-colors duration-300">
      {/* Ambient background glows */}
      <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] bg-brand-green/50 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[-100px] left-[-200px] w-[500px] h-[500px] bg-brand-green-accent/30 rounded-full blur-[130px] pointer-events-none z-0" />
      
      {/* Header */}
      <header className="sticky top-0 w-full z-50 px-4 py-4 border-b border-black/10 dark:border-white/10 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <RouterLink to="/" onClick={handleLogoClick} className="font-bold text-2xl tracking-tight flex items-center gap-2 text-black dark:text-white hover:opacity-80 transition-opacity">
              shrink
            </RouterLink>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-400">
            <RouterLink to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors">Home</RouterLink>
            <a href="/#why" onClick={handleWhyClick} className="px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors">Why shrink</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-4">
            {user && (
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors hidden sm:block text-gray-700 dark:text-gray-300"
              >
                <History size={18} />
              </button>
            )}
            {/* <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-gray-300"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button> */}
            <AuthButton user={user} showAuthModal={showAuthModal} setShowAuthModal={setShowAuthModal} />
          </div>
        </div>
      </header>

      {/* Main Routes with Animations */}
      <div className="flex-grow flex flex-col relative z-10">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <motion.main
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col items-center flex-grow"
            >
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative w-full pt-12 md:pt-20 pb-16 overflow-hidden flex flex-col items-center min-h-[90vh]"
              >
                <div className="grid-overlay" />
        {/* Hero Section */}
        <section className="w-full max-w-4xl mx-auto px-4 text-center z-10 flex flex-col items-center">
            <h1 className="text-[2.75rem] sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter mb-6 leading-[1.05] text-black dark:text-white max-w-5xl mx-auto">
              Long URLs <br />
              were a mistake. <br />
              <span className="whitespace-nowrap"><strong>shrink</strong> fixes that.</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              URLs got out of hand. shrink puts them back in their place - shorter, smarter, and fully under your control. Your browser does the work. Your data stays yours.
            </p>

            {!user && !authLoading && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full mb-16">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  onClick={() => document.getElementById('urlInput').focus()} 
                  className="btn-white w-full sm:w-auto"
                >
                  Get Started <ArrowRight size={16} />
                </motion.button>
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  href="#features" 
                  onClick={handleFeaturesClick}
                  className="btn-white w-full sm:w-auto"
                >
                  Explore Features
                </motion.a>
              </div>
            )}

            {/* Content Area: Dashboard or Shortener Box */}
            <div className="w-full flex justify-center">
              <AnimatePresence mode="wait">
                {authLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex justify-center my-12"
                  >
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-black dark:border-[#333] dark:border-t-white rounded-full animate-spin" />
                  </motion.div>
                ) : user ? (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full mt-4 max-w-7xl flex justify-center"
                  >
                    <Dashboard />
                  </motion.div>
                ) : (
                  <motion.div
                    key="shortener"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex flex-col items-center w-full max-w-2xl"
                  >
                    <div className="w-full bg-card-bg border border-card-border backdrop-blur-md rounded-3xl sm:rounded-full p-2 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative z-20 transition-all duration-500 hover:shadow-xl hover:border-brand-green/50 focus-within:ring-4 focus-within:ring-brand-green/10 focus-within:border-brand-green">
                      <form onSubmit={handleShorten} className="flex flex-col sm:flex-row gap-2">
                        <input
                          id="urlInput"
                          type="text"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          placeholder="Paste your long URL here..."
                          className="flex-1 bg-transparent border-0 py-3 px-4 sm:py-4 sm:px-6 text-base sm:text-lg focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 font-medium text-black dark:text-white rounded-2xl sm:rounded-full"
                        />
                        <motion.button 
                          type="submit"
                          disabled={loading || !turnstileToken}
                          whileHover={loading || !turnstileToken ? {} : { scale: 1.05 }}
                          whileTap={loading || !turnstileToken ? {} : { scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          className="btn-black flex items-center justify-center min-w-[140px] rounded-2xl sm:rounded-full py-3 sm:py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin" />
                          ) : (
                            <>Shrink me <ArrowRight size={18} /></>
                          )}
                        </motion.button>
                      </form>
                    </div>
                    <div className="flex justify-center mt-6">
                      <Turnstile 
                        siteKey="1x00000000000000000000AA" 
                        onSuccess={(token) => setTurnstileToken(token)}
                        options={{ theme: theme === 'dark' ? 'dark' : 'light' }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
          <AnimatePresence>
            {error && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-500 text-sm font-medium px-4 mt-4"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {currentResult && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl mt-6 p-6 bg-card-bg border border-card-border backdrop-blur-md rounded-[2rem] text-left shadow-[0_8px_30px_rgb(0,0,0,0.02)] z-20 relative"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="overflow-hidden flex-1 w-full">
                    <a href={currentResult.shortUrl} target="_blank" rel="noreferrer" className="text-2xl font-bold text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors truncate block">
                      {currentResult.shortUrl.replace(/^https?:\/\//, '')}
                    </a>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                      {currentResult.originalUrl}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-semibold">
                      <Clock size={12} />
                      <span>Expires in 3 days ({new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })})</span>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => copyToClipboard(currentResult.shortUrl, 'current')}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 p-4 rounded-xl transition-all border ${
                        copiedId === 'current' 
                          ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400' 
                          : 'bg-white dark:bg-[#1a1a1a] border-black/10 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-black dark:text-white'
                      }`}
                    >
                      {copiedId === 'current' ? <Check size={18} className="text-green-500"/> : <Copy size={18}/>}
                    </button>
                    <button 
                      onClick={() => setShowQR(!showQR)}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 p-4 rounded-xl transition-all border ${
                        showQR ? 'bg-gray-100 dark:bg-white/20 border-gray-300 dark:border-white/30 text-black dark:text-white' : 'bg-white dark:bg-[#1a1a1a] border-black/10 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300'
                      }`} 
                    >
                      <QrCode size={18} />
                    </button>
                  </div>
                </div>
                
                {/* QR Code Expansion */}
                <AnimatePresence>
                  {showQR && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden flex justify-center border-t border-black/10 dark:border-white/10 mt-6 pt-6"
                    >
                      <div className="p-4 border border-black/10 dark:border-white/10 rounded-2xl bg-white dark:bg-white shadow-sm">
                        <QRCodeSVG value={currentResult.shortUrl} size={160} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
      </motion.div>



      {/* Stats Banner */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full border-y border-black/10 dark:border-white/5 py-16 bg-white dark:bg-[#0a0a0a] relative z-10 transition-colors duration-300"
      >
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 text-center divide-x-0 md:divide-x divide-gray-100 dark:divide-white/5">
          <div className="flex flex-col items-center px-4">
            <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-2 text-black dark:text-white">Private</h3>
            <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-relaxed">Never leaves your device</p>
          </div>
          <div className="flex flex-col items-center px-4">
            <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-2 text-black dark:text-white">Quick, Safe.</h3>
            <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-relaxed">built for speed and security</p>
          </div>
          <div className="flex flex-col items-center px-4">
            <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-2 text-black dark:text-white">None</h3>
            <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-relaxed">Data stored</p>
          </div>
          <div className="flex flex-col items-center px-4">
            <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-2 text-black dark:text-white">Start free</h3>
            <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-relaxed">Upgrade when you are ready</p>
          </div>
        </div>
      </motion.section>

      {/* Features Grid */}
      <motion.section 
        id="features" 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full bg-[#fcfcfc] dark:bg-[#0f0f0f] py-32 px-4 relative z-10 border-b border-black/10 dark:border-white/5 transition-colors duration-300"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 flex flex-col items-center">
            <div className="bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
              All-In-One Solution
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-black dark:text-white">Free <span className="text-gray-400 dark:text-gray-600"> Features</span></h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto italic">Everything you need to work with your links, completely free and 100% private.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Scissors size={20} />, title: 'Instant shortening', desc: 'Shrink links instantly with zero friction. Create a free account to save them forever.' },
              { icon: <QrCode size={20} />, title: 'Instant QR Codes', desc: 'Every short link automatically generates a clean, high-resolution QR code on the fly.' },
              { icon: <LayoutDashboard size={20} />, title: 'Link dashboard', desc: 'Manage all your links in one central hub. Copy, share, or delete anytime.' },
              { icon: <Smartphone size={20} />, title: 'Works on any device', desc: 'Fully responsive design lets you manage your links seamlessly on any device.' },
              { icon: <Gift size={20} />, title: '100% Free', desc: 'No paywalls, no premium tiers, and zero hidden fees. Everything is completely free forever.' },
              { icon: <Ban size={20} />, title: 'Zero Ads', desc: 'Enjoy a pure, distraction-free experience. We will never show you ads or popups.' },
            ].map((feature, i) => (
              <div key={i} className="bg-card-bg border border-card-border backdrop-blur-md rounded-[1.5rem] p-8 hover:border-brand-green/70 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group cursor-pointer shadow-sm">
                <div className="w-12 h-12 bg-brand-light border border-card-border rounded-xl flex items-center justify-center text-text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 tracking-tight text-black dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-0 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Why shrink (Black Section) */}
      <motion.section 
        id="why" 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full bg-white dark:bg-[#050505] text-black dark:text-white py-32 px-4 relative z-10 border-b border-black/10 dark:border-white/5 transition-colors duration-300"
      >
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-center">Why shrink?</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-16 text-center">Built for speed, privacy, and simplicity.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16">
            <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-[2rem] p-8 hover:bg-gray-100 dark:hover:bg-[#111] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group">
              <div className="w-12 h-12 bg-white dark:bg-white/10 text-black dark:text-white rounded-xl flex items-center justify-center mb-6 border border-black/10 dark:border-white/20 group-hover:scale-110 transition-transform duration-300">
                <Zap size={20} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-black dark:text-white">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">Process links in milliseconds with our heavily optimized edge engine.</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-[2rem] p-8 hover:bg-gray-100 dark:hover:bg-[#111] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group">
              <div className="w-12 h-12 bg-white dark:bg-white/10 text-black dark:text-white rounded-xl flex items-center justify-center mb-6 border border-black/10 dark:border-white/20 group-hover:scale-110 transition-transform duration-300">
                <Shield size={20} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-black dark:text-white">100% Secure</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">Your data never leaves your device. Links are processed locally.</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-[2rem] p-8 hover:bg-gray-100 dark:hover:bg-[#111] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group">
              <div className="w-12 h-12 bg-white dark:bg-white/10 text-black dark:text-white rounded-xl flex items-center justify-center mb-6 border border-black/10 dark:border-white/20 group-hover:scale-110 transition-transform duration-300">
                <Globe size={20} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-black dark:text-white">Works Anywhere</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">Use on any device, any browser, completely responsive.</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs font-medium">
            <span className="px-4 py-2 rounded-full border border-black/10 dark:border-white/10 flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent"><Check size={14} className="text-green-500"/> No signup required</span>
            <span className="px-4 py-2 rounded-full border border-black/10 dark:border-white/10 flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent"><Check size={14} className="text-green-500"/> Instant generation</span>
            <span className="px-4 py-2 rounded-full border border-black/10 dark:border-white/10 flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent"><Check size={14} className="text-green-500"/> Privacy guaranteed</span>
            <span className="px-4 py-2 rounded-full border border-black/10 dark:border-white/10 flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent"><Check size={14} className="text-green-500"/> Forever free</span>
          </div>
        </div>
      </motion.section>


            </motion.main>
          } />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/links" element={<AllLinks />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/analytics/:shortCode" element={<LinkAnalytics />} />
          <Route path="/todos" element={<TodosTest />} />
          <Route path="/not-found" element={<NotFound />} />
          <Route path="/:shortCode" element={<RedirectHandler />} />
        </Routes>
      </AnimatePresence>
     </div>

      {/* Footer */}
      <footer className="w-full bg-black dark:bg-[#050505] text-white pt-10 pb-6 px-6 relative z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-6">
          <div className="col-span-1">
            <RouterLink to="/" onClick={handleLogoClick} className="font-bold text-2xl tracking-tight flex items-center gap-2 mb-4 text-white hover:opacity-80 transition-opacity">
              shrink
            </RouterLink>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Free online link tools for everyone. Process links securely in your browser — your data never leaves your device.
            </p>
          </div>
          
          <div>
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-gray-300">
              <li><a href="/#features" onClick={handleFeaturesClick} className="hover:text-white transition-colors">Features</a></li>
              <li><RouterLink to="/how-it-works" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">How It Works</RouterLink></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-gray-300">
              <li><RouterLink to="/privacy-policy" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">Privacy Policy</RouterLink></li>
              <li><RouterLink to="/disclaimer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">Disclaimer</RouterLink></li>
              <li><RouterLink to="/terms-of-service" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">Terms of Service</RouterLink></li>
              <li><button onClick={() => window.dispatchEvent(new CustomEvent('openCookieSettings'))} className="hover:text-white transition-colors">Cookie Settings</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-gray-300">
              <li><RouterLink to="/contact" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">Contact</RouterLink></li>
              <li><RouterLink to="/faq" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">FAQs</RouterLink></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-4 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>© {new Date().getFullYear()} shrink. All rights reserved.</div>
        </div>
      </footer>

      {/* History Side Panel Overlay */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[#111] shadow-2xl z-50 flex flex-col border-l border-black/10 dark:border-white/10"
            >
              <div className="p-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 text-black dark:text-white"><History size={20}/> Link History</h2>
                <button onClick={() => setShowHistory(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400">
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                {userLinksLoading ? (
                  <div className="text-center py-12 flex flex-col items-center gap-3 text-gray-400 dark:text-gray-600 animate-pulse">
                    <History size={32} className="animate-spin text-brand-green" />
                    <p>Loading history...</p>
                  </div>
                ) : userLinks.length === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center gap-3 text-gray-400 dark:text-gray-600">
                    <Scissors size={32} />
                    <p>No links shortened yet.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-end mb-2">
                      <p className="text-xs text-gray-400 font-semibold self-center mr-auto">
                        Showing {userLinks.length} saved links
                      </p>
                    </div>
                    {userLinks.map((link) => {
                      const shortUrl = `${window.location.origin}/${link.shortCode}`;
                      return (
                        <div key={link.shortCode} className="bg-gray-50 dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-2xl p-4 group">
                          <a 
                            href={shortUrl} 
                            onClick={(e) => {
                              e.preventDefault();
                              setConfirmConfig({
                                isOpen: true,
                                title: 'Open External Link',
                                message: 'This will redirect you to the shortened link in a new tab. Are you sure you want to continue?',
                                confirmText: 'Open Link',
                                isDestructive: false,
                                onConfirm: () => {
                                  window.open(shortUrl, '_blank');
                                }
                              });
                            }}
                            className="text-base font-bold text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors truncate block mb-1"
                          >
                            {shortUrl.replace(/^https?:\/\//, '')}
                          </a>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-3">{link.targetUrl}</p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyToClipboard(shortUrl, link.shortCode)}
                              className="flex-1 py-1.5 rounded-lg bg-white dark:bg-[#222] border border-black/10 dark:border-white/10 text-sm font-semibold flex items-center justify-center gap-1 hover:border-black dark:hover:border-white transition-colors text-black dark:text-white"
                            >
                              <Copy size={14} /> Copy
                            </button>
                            <button
                              onClick={() => handleDeleteLink(link.shortCode)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {copiedId && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#222] text-white px-4 py-2 rounded-full shadow-2xl border border-white/10 flex items-center gap-2 z-50 font-medium text-sm"
          >
            <Check size={16} className="text-green-500" />
            Link copied!
          </motion.div>
        )}
      </AnimatePresence>

       <Toaster richColors position="bottom-center" closeButton />
       <CookieConsent />
      
      <AnimatePresence>
        <ConfirmModal 
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          isDestructive={confirmConfig.isDestructive}
          onConfirm={confirmConfig.onConfirm}
          onClose={() => setConfirmConfig({ isOpen: false })}
        />
      </AnimatePresence>
    </div>
  );
}

export default App;
