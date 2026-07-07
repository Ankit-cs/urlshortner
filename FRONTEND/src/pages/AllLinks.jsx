import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LinkIcon, Activity, Copy, Trash2, ArrowLeft, Check, QrCode } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

export default function AllLinks() {
  const { user, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [links, setLinks] = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  
  // Modal State
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    
    const fetchLinks = async () => {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
        
        const apiUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/links` : '/api/links';
        const res = await fetch(apiUrl, { headers });
        if (res.ok) {
          const data = await res.json();
          setLinks(data.links);
        } else {
          console.error('Failed to fetch links');
        }
      } catch (err) {
        console.error('Network error fetching links:', err);
      } finally {
        setLoadingLinks(false);
      }
    };
    
    fetchLinks();
  }, [user, session]);

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const confirmDelete = async (link) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      let apiUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/links/${link.shortCode}` : `/api/links/${link.shortCode}`;
      apiUrl = apiUrl.replace(/([^:]\/)\/+/g, "$1");
      
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
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#050505]"><div className="w-8 h-8 border-4 border-gray-200 border-t-black dark:border-[#333] dark:border-t-white rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white selection:bg-blue-500/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col gap-6 mb-8">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors w-fit"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">All Links History</h1>
            <p className="text-gray-500 dark:text-gray-400">View and manage every link you have ever shortened via shrink.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111111] border border-black/15 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none rounded-3xl p-6 md:p-8">
          {loadingLinks ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-black dark:border-white/20 dark:border-t-white rounded-full animate-spin mb-4" />
              <p>Loading your link history...</p>
            </div>
          ) : links.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <LinkIcon size={48} className="mb-4 opacity-30" />
              <p className="text-lg">No links found in your history.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {links.map((link, i) => (
                <div key={i} className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border transition-all gap-4 ${link.deleted ? 'bg-red-50 dark:bg-red-950/10 border-red-200 dark:border-red-900/20 opacity-75' : 'bg-gray-50 dark:bg-white/5 border-transparent hover:border-black/15 dark:hover:border-white/10 hover:bg-white dark:hover:bg-white/10 hover:shadow-md dark:hover:shadow-none'}`}>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <a 
                        href={link.deleted ? '#' : `${window.location.origin}/${link.shortCode}`} 
                        target={link.deleted ? '_self' : '_blank'} 
                        rel="noreferrer" 
                        className={`font-semibold transition-colors ${link.deleted ? 'text-gray-500 line-through pointer-events-none' : 'text-gray-900 dark:text-white hover:text-blue-500 dark:hover:text-blue-400'}`}
                      >
                        {window.location.host}/{link.shortCode}
                      </a>
                      
                      {link.deleted && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-600 border border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/20 font-medium">
                          Deleted
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate" title={link.targetUrl}>{link.targetUrl}</p>
                  </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 md:w-[320px]">
                    <div className="flex items-center gap-1.5 text-gray-400 w-24">
                      <Activity size={14} />
                      <span className="text-sm font-medium">{link.clicks || 0}</span>
                    </div>
                    <div className="text-xs text-gray-500 w-24 text-right">
                      {new Date(link.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => copyToClipboard(link.shortCode, link.shortCode)} 
                        disabled={link.deleted}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400" 
                        title="Copy"
                      >
                        <Copy size={16} />
                      </button>
                      
                      <button 
                        onClick={() => openDeleteModal(link)} 
                        disabled={link.deleted}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400" 
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
    </div>
  );
}
