import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, Check, Cookie } from 'lucide-react';
import { CookieConsent as CookieManager } from '../utils/cookieConsent';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState(CookieManager.getPreferences());

  useEffect(() => {
    // Show banner only if the user hasn't made a choice yet
    if (!CookieManager.hasConsented()) {
      setShowBanner(true);
    }

    // Listen for custom event to open settings
    const handleOpenSettings = () => {
      setPreferences(CookieManager.getPreferences());
      setShowModal(true);
      setShowBanner(false);
    };

    const handleConsentChange = (e) => {
      setPreferences(e.detail);
    };

    window.addEventListener('openCookieSettings', handleOpenSettings);
    window.addEventListener('cookieConsentChanged', handleConsentChange);

    return () => {
      window.removeEventListener('openCookieSettings', handleOpenSettings);
      window.removeEventListener('cookieConsentChanged', handleConsentChange);
    };
  }, []);

  const handleAcceptAll = () => {
    CookieManager.acceptAll();
    setShowBanner(false);
    setShowModal(false);
  };

  const handleRejectNonEssential = () => {
    CookieManager.rejectNonEssential();
    setShowBanner(false);
    setShowModal(false);
  };

  const handleSavePreferences = () => {
    CookieManager.setPreferences(preferences);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleToggle = (category) => {
    if (category === 'necessary') return; // Cannot toggle necessary
    setPreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <>
      {/* --- Cookie Banner --- */}
      <AnimatePresence>
        {showBanner && !showModal && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-[480px] z-[9999] bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 p-6 rounded-2xl shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400">
                <Cookie size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Your Privacy Matters</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
                  We use cookies to improve your experience, analyze traffic, and ensure our links work securely. You can customize your preferences or accept all.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={handleAcceptAll}
                    className="flex-1 min-w-[120px] bg-black text-white dark:bg-white dark:text-black py-2.5 px-4 rounded-full text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                  >
                    Accept All
                  </button>
                  <button 
                    onClick={handleRejectNonEssential}
                    className="flex-1 min-w-[120px] bg-gray-100 text-gray-700 dark:bg-[#222] dark:text-gray-300 py-2.5 px-4 rounded-full text-sm font-semibold hover:bg-gray-200 dark:hover:bg-[#333] transition-colors"
                  >
                    Reject Optional
                  </button>
                </div>
                <button 
                  onClick={() => setShowModal(true)}
                  className="w-full mt-3 text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white transition-colors underline underline-offset-4 decoration-gray-300 dark:decoration-gray-700 hover:decoration-black dark:hover:decoration-white"
                >
                  Manage Preferences
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Manage Preferences Modal --- */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999]"
              onClick={() => {
                if (CookieManager.hasConsented()) setShowModal(false);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg z-[10000] bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <Shield size={22} className="text-black dark:text-white" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Cookie Preferences</h2>
                </div>
                {CookieManager.hasConsented() && (
                  <button 
                    onClick={() => setShowModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
                <ToggleItem 
                  title="Strictly Necessary"
                  desc="Essential for the website to function. Without these, core features like URL redirection and basic security won't work. They cannot be disabled."
                  checked={true}
                  disabled={true}
                  onChange={() => {}}
                />
                <ToggleItem 
                  title="Analytics"
                  desc="Helps us understand how visitors interact with shrink, including tracking how many times your shortened links are clicked."
                  checked={preferences.analytics}
                  onChange={() => handleToggle('analytics')}
                />
                <ToggleItem 
                  title="Functional"
                  desc="Enables the website to provide enhanced functionality and personalization, such as remembering your dashboard layout or theme preference."
                  checked={preferences.functional}
                  onChange={() => handleToggle('functional')}
                />
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#0a0a0a] flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleAcceptAll}
                  className="flex-1 bg-black text-white dark:bg-white dark:text-black py-3 px-4 rounded-full text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  Accept All
                </button>
                <button 
                  onClick={handleSavePreferences}
                  className="flex-1 bg-gray-200 text-gray-800 dark:bg-[#222] dark:text-gray-300 py-3 px-4 rounded-full text-sm font-semibold hover:bg-gray-300 dark:hover:bg-[#333] transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function ToggleItem({ title, desc, checked, disabled, onChange }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-1">
        <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          {title}
          {disabled && <span className="text-[10px] uppercase tracking-wider bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">Always Active</span>}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
      </div>
      <button 
        type="button"
        disabled={disabled}
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full flex items-center transition-colors duration-300 focus:outline-none flex-shrink-0 mt-1
          ${checked ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className={`absolute left-1 w-4 h-4 rounded-full bg-white dark:bg-black transition-transform duration-300 flex items-center justify-center ${checked ? 'translate-x-6' : 'translate-x-0'}`}>
          {checked && <Check size={10} className="text-black dark:text-white" />}
        </div>
      </button>
    </div>
  );
}
