import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { fetchLinksFromDrive, backupLinkToDrive } from '../utils/googleDrive';
import ConfirmModal from '../components/ConfirmModal';
import StatCard from '../components/StatCard';
import LinkCard from '../components/LinkCard';
import { 
  Link as LinkIcon, 
  BarChart3, 
  Settings,
  Lock,
  ArrowUpRight,
  Copy,
  Check,
  QrCode,
  Edit2,
  Trash2,
  AlertCircle,
  Activity,
  Clock,
  LogOut,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const { user, session, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [isPro, setIsPro] = useState(false);
  const [linksUsed, setLinksUsed] = useState(0);

  // Link Data State
  const [links, setLinks] = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(true);

  // Shortening State
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [showAlias, setShowAlias] = useState(false);
  const [isShortening, setIsShortening] = useState(false);

  // QR Modal State
  const [activeQR, setActiveQR] = useState(null);

  // Copy State
  const [copiedId, setCopiedId] = useState(null);

  // Modal State
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // Fetch Links from Worker API
  useEffect(() => {
    if (!user) return;
    
    const fetchLinks = async () => {
      let fetchedLinks = [];
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
        
        const apiUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/links` : '/api/links';
        const res = await fetch(apiUrl, { headers });
        if (res.ok) {
          const data = await res.json();
          fetchedLinks = data.links;
          setLinksUsed(data.usage || 0);
        } else {
          console.error('Failed to fetch links from primary database');
        }
      } catch (err) {
        console.error('Network error fetching from primary database:', err);
      } 
      
      // Fallback: If no links found in primary DB, try to load from Google Drive CSV Backup
      if (fetchedLinks.length === 0 && session?.provider_token) {
        try {
          console.log('Falling back to Google Drive CSV backup...');
          const driveLinks = await fetchLinksFromDrive(session.provider_token);
          if (driveLinks.length > 0) {
            fetchedLinks = driveLinks;
          }
        } catch (driveErr) {
          console.error('Failed to load from Google Drive backup:', driveErr);
        }
      }

      // Merge optimistic UI cache (solves KV eventual consistency)
      const pendingStr = sessionStorage.getItem('pendingLinks');
      if (pendingStr) {
        const pending = JSON.parse(pendingStr);
        pending.forEach(pLink => {
          if (!fetchedLinks.some(f => f.shortCode === pLink.shortCode || (f.targetUrl && pLink.originalUrl && f.targetUrl === pLink.originalUrl))) {
            fetchedLinks.unshift({
              ...pLink,
              targetUrl: pLink.originalUrl || pLink.targetUrl
            });
          }
        });
      }

      setLinks(fetchedLinks.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setLoadingLinks(false);
    };
    fetchLinks();
  }, [user, session]);

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    setIsShortening(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const apiUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/shorten` : '/api/shorten';
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          url: url.trim(),
          alias: showAlias && alias.trim() ? alias.trim() : undefined
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        const newLink = {
          shortCode: data.shortCode,
          targetUrl: data.targetUrl || url.trim(),
          clicks: 0,
          createdAt: new Date().toISOString()
        };

        // Backup to Google Drive if user has a provider token
        if (session?.provider_token) {
          backupLinkToDrive(session, {
            shortCode: data.shortCode,
            originalUrl: url.trim(),
            date: new Date().toISOString()
          }).catch(e => console.error("Drive Backup Error:", e));
        }

        // Update optimistic UI cache
        const pendingStr = sessionStorage.getItem('pendingLinks');
        const pendingLinks = pendingStr ? JSON.parse(pendingStr) : [];
        pendingLinks.unshift(newLink);
        sessionStorage.setItem('pendingLinks', JSON.stringify(pendingLinks));

        setLinks(prev => [newLink, ...prev]);
        setLinksUsed(prev => prev + 1);
        setUrl('');
        setAlias('');
        setShowAlias(false);
      } else if (res.status === 409) {
        const errorData = await res.json();
        alert(errorData.error || 'Alias already taken. Please choose another one.');
      } else if (res.status === 429) {
        const errorData = await res.json();
        alert(errorData.error || 'Monthly limit reached.');
      } else {
        alert('Failed to shorten URL');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setIsShortening(false);
    }
  };



  const copyToClipboard = (shortCode) => {
    navigator.clipboard.writeText(`${window.location.origin}/${shortCode}`);
    setCopiedId(shortCode);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const confirmDelete = async (link) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      let apiUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/links/${link.shortCode}` : `/api/links/${link.shortCode}`;
      apiUrl = apiUrl.replace(/([^:]\/)\/+/g, "$1"); // Fix any double slashes
      
      const res = await fetch(apiUrl, { method: 'DELETE', headers });
      if (res.ok) {
        setLinks(prev => prev.map(l => l.shortCode === link.shortCode ? { ...l, deleted: true, deletedAt: new Date().toISOString() } : l));
      } else {
        const errorText = await res.text();
        alert(`Failed to delete link (${res.status}): ${errorText}`);
      }
    } catch (err) {
      console.error(err);
      alert(`Network error while deleting: ${err.message}`);
    }
  };

  const openDeleteModal = (link) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Link',
      message: 'Are you sure you want to delete this shortened URL? This action will permanently break the link for anyone who clicks it.',
      confirmText: 'Delete Link',
      isDestructive: true,
      onConfirm: () => confirmDelete(link)
    });
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black"><div className="w-8 h-8 border-4 border-gray-200 border-t-black dark:border-[#333] dark:border-t-white rounded-full animate-spin" /></div>;
  }

  // Plan Limits
  const linkLimit = 100;
  const progressPercent = Math.min((linksUsed / linkLimit) * 100, 100);
  const activeLinksArray = links.filter(link => !link.deleted);
  const totalClicks = activeLinksArray.reduce((sum, link) => sum + (link.clicks || 0), 0);
  const firstName = user.user_metadata?.full_name?.split(' ')[0] || 'Creator';

  return (
    <div className="w-full text-gray-900 dark:text-white selection:bg-blue-500/30">
      
      {/* Top Navbar Removed */}

      {/* Main Bento Grid */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 pb-20 space-y-6">
        
        {/* TOP ROW: Command Center */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#111111] border border-black/15 dark:border-white/10 rounded-[2rem] p-8 md:p-12 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="flex items-center gap-3 text-lg font-medium text-gray-500 dark:text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              Welcome back, {firstName}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              shrink a new <span className="text-blue-500">URL</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
              Paste any long link below. Links expire in 30 days and include click tracking + a dynamic QR code.
            </p>

            <form onSubmit={handleShorten} className="mt-8 flex flex-col gap-4">
              
              {/* Main URL Input Pill */}
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#1a1a1a] border border-black/15 dark:border-white/10 rounded-full p-2 focus-within:border-black dark:focus-within:border-white/30 focus-within:ring-4 focus-within:ring-black/10 dark:focus-within:ring-white/5 transition-all">
                <div className="pl-2 md:pl-4 text-gray-500">
                  <LinkIcon size={18} />
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/your-very-long-url-here"
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm md:text-base py-2 min-w-0 pr-2"
                />
                  <button 
                    type="submit"
                    disabled={isShortening}
                    className="bg-black text-white dark:bg-white dark:text-black px-6 py-2.5 rounded-full font-semibold text-sm hover:scale-105 transition-transform disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {isShortening ? 'shrinking...' : (
                      <>shrink it <ArrowUpRight size={16} /></>
                    )}
                  </button>
              </div>
              
              {/* Alias Toggle & Input */}
              <div className="flex flex-col gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAlias(!showAlias)}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors w-fit"
                >
                  <span className={`transform transition-transform ${showAlias ? 'rotate-90' : ''}`}>›</span>
                  Customize back-half (optional)
                </button>
                
                <AnimatePresence>
                  {showAlias && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#1a1a1a] border border-black/15 dark:border-white/10 rounded-xl p-2 focus-within:border-black dark:focus-within:border-white/30 transition-all max-w-sm">
                        <span className="pl-3 text-gray-500 text-sm font-medium">shrink.com/</span>
                        <input
                          type="text"
                          value={alias}
                          onChange={(e) => setAlias(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                          placeholder="my-custom-name"
                          maxLength={32}
                          className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 text-sm py-1 min-w-0"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2 ml-1">Use letters, numbers, hyphens, or underscores.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </div>
        </motion.div>

        {/* MIDDLE ROW: Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <StatCard 
            delay={0.1}
            title="Total Clicks" 
            value={totalClicks} 
            subtitle="Across all active links" 
            icon={BarChart3} 
            colorClass="group-hover:text-blue-500 dark:group-hover:text-blue-400" 
          />
          
          <StatCard 
            delay={0.2}
            title="Active Links" 
            value={activeLinksArray.length} 
            subtitle="Shortened via shrink" 
            icon={Activity} 
            colorClass="group-hover:text-green-500 dark:group-hover:text-green-400" 
          />

          <StatCard 
            delay={0.3}
            title="Avg. Lifetime" 
            value="30d" 
            subtitle="Before expiration" 
            icon={Clock} 
            colorClass="group-hover:text-purple-500 dark:group-hover:text-purple-400" 
          />

          <StatCard 
            delay={0.4}
            title="Monthly Links" 
            value={<>{linksUsed} <span className="text-xl text-gray-500 font-medium">/ {linkLimit}</span></>} 
            subtitle={
              <>
                <p className="text-xs text-gray-500 mt-1 mb-4">Resets on the 1st</p>
                <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${progressPercent >= 90 ? 'bg-red-500' : progressPercent >= 75 ? 'bg-amber-500' : 'bg-blue-500'}`} 
                    style={{ width: `${progressPercent}%` }} 
                  />
                </div>
              </>
            }
            icon={Activity} 
            colorClass="group-hover:text-amber-500 dark:group-hover:text-amber-400" 
          />
        </div>

        {/* BOTTOM ROW: Recent Links */}
        <div className="flex flex-col gap-6">
          
          {/* Recent Links List */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="w-full bg-white dark:bg-[#111111] border border-black/15 dark:border-white/10 hover:border-black/30 dark:hover:border-white/20 transition-all rounded-3xl p-6 flex flex-col min-h-[400px] group shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg dark:shadow-none dark:hover:shadow-none">
            <div className="flex justify-between items-start mb-6 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white text-lg">Recent links</h3>
                <p className="text-xs text-gray-500 mt-1">Links can't be edited after creation. <br className="block sm:hidden" />Re-shrink if needed.</p>
              </div>
              <button onClick={() => navigate('/links')} className="text-sm font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:underline transition-colors mt-1 whitespace-nowrap">
                View all
              </button>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto pr-2 custom-scrollbar space-y-2">
              {loadingLinks ? (
                <div className="flex-1 flex items-center justify-center min-h-[200px]">
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-black dark:border-white/20 dark:border-t-white rounded-full animate-spin" />
                </div>
              ) : activeLinksArray.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 min-h-[200px]">
                  <LinkIcon size={32} className="mb-4 opacity-50" />
                  <p className="text-sm">No active links found.</p>
                </div>
              ) : (
                activeLinksArray.slice(0, 5).map((link, i) => (
                  <LinkCard 
                    key={link.shortCode || i}
                    link={link}
                    onCopy={copyToClipboard}
                    onDelete={openDeleteModal}
                    onShowQR={setActiveQR}
                    onOpen={(link) => {
                      setConfirmConfig({
                        isOpen: true,
                        title: 'Open External Link',
                        message: 'This will redirect you to the shortened link in a new tab. Are you sure you want to continue?',
                        confirmText: 'Open Link',
                        isDestructive: false,
                        onConfirm: () => window.open(`${window.location.origin}/${link.shortCode}`, '_blank')
                      });
                    }}
                    onAnalytics={(link) => navigate(`/analytics/${link.shortCode}`)}
                  />
                ))
              )}
            </div>
          </motion.div>
        </div>

      </main>



      {/* QR Code Modal Overlay */}
      <AnimatePresence>
        {activeQR && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setActiveQR(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#111] border border-black/15 dark:border-white/10 p-8 rounded-3xl shadow-2xl relative flex flex-col items-center max-w-sm w-full"
            >
              <button 
                onClick={() => setActiveQR(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6 border border-black/15 dark:border-white/10">
                <QrCode size={20} className="text-gray-900 dark:text-white" />
              </div>
              
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Scan QR Code</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">
                Points to <span className="text-gray-900 dark:text-white">{window.location.host}/{activeQR}</span>
              </p>
              
              <div className="bg-gray-50 p-4 rounded-2xl w-full flex justify-center border border-black/15 dark:border-transparent">
                <QRCodeSVG value={`${window.location.origin}/${activeQR}`} size={200} />
              </div>
              
              <button 
                onClick={() => {
                  copyToClipboard(activeQR);
                  setActiveQR(null);
                }}
                className="mt-8 w-full bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors rounded-xl py-3 font-medium"
              >
                Copy Link instead
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      

      {/* Toast Notification */}
      <AnimatePresence>
        {copiedId && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white dark:bg-[#222] text-gray-900 dark:text-white px-4 py-2 rounded-full shadow-xl border border-gray-200 dark:border-white/10 flex items-center gap-2 z-50 font-medium text-sm"
          >
            <Check size={16} className="text-green-500" />
            Link copied!
          </motion.div>
        )}
      </AnimatePresence>

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
