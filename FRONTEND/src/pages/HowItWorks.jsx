import { motion } from 'framer-motion';
import { Zap, Link as LinkIcon, Database, Share2, Rocket, ArrowDown } from 'lucide-react';
import { useEffect } from 'react';

export default function HowItWorks() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
      className="w-full flex flex-col items-center flex-grow pt-24 pb-32 px-4"
    >
      <div className="max-w-4xl w-full">
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center p-3 bg-gray-100 dark:bg-white/10 rounded-2xl mb-6 text-black dark:text-white">
            <Zap size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-black dark:text-white">How shrink Works</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Ever wonder how a giant, messy link turns into a tiny, clean one? Here's the magic behind the scenes, explained simply.
          </p>
        </div>

        <div className="space-y-6">
          {/* Box 1 */}
          <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-200 dark:border-white/20 shadow-sm hover:shadow-2xl dark:hover:shadow-[0_10px_30px_rgba(255,255,255,0.05)] hover:border-gray-400 dark:hover:border-white/40 transition-all duration-300 hover:-translate-y-1">
            <h3 className="text-2xl font-bold text-black dark:text-white mb-3 flex items-center gap-3">
              <LinkIcon className="text-gray-400" size={24} /> 
              You paste your long URL
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
              Copy your URL however long or messy it is and paste it into shrink. It could be a YouTube link, a product page with a dozen tracking parameters, anything. We take it all.
            </p>
          </div>

          <div className="flex justify-center text-gray-400 dark:text-gray-600">
            <ArrowDown size={32} />
          </div>

          {/* Box 2 */}
          <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-200 dark:border-white/20 shadow-sm hover:shadow-2xl dark:hover:shadow-[0_10px_30px_rgba(255,255,255,0.05)] hover:border-gray-400 dark:hover:border-white/40 transition-all duration-300 hover:-translate-y-1">
            <h3 className="text-2xl font-bold text-black dark:text-white mb-3 flex items-center gap-3">
              <Database className="text-gray-400" size={24} /> 
              We store it and generate a code
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
              Your original URL gets saved securely in our database. We then generate a short unique code like abc4xz and attach it to our domain. That becomes your short link: shrink.ly/abc4xz.
            </p>
          </div>

          <div className="flex justify-center text-gray-400 dark:text-gray-600">
            <ArrowDown size={32} />
          </div>

          {/* Box 3 */}
          <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-200 dark:border-white/20 shadow-sm hover:shadow-2xl dark:hover:shadow-[0_10px_30px_rgba(255,255,255,0.05)] hover:border-gray-400 dark:hover:border-white/40 transition-all duration-300 hover:-translate-y-1">
            <h3 className="text-2xl font-bold text-black dark:text-white mb-3 flex items-center gap-3">
              <Share2 className="text-gray-400" size={24} /> 
              You share the short link
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
              Copy your new short link and share it anywhere. In a message, an email, a bio, wherever. It's clean, compact and works on any device.
            </p>
          </div>

          <div className="flex justify-center text-gray-400 dark:text-gray-600">
            <ArrowDown size={32} />
          </div>

          {/* Box 4 */}
          <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-200 dark:border-white/20 shadow-sm hover:shadow-2xl dark:hover:shadow-[0_10px_30px_rgba(255,255,255,0.05)] hover:border-gray-400 dark:hover:border-white/40 transition-all duration-300 hover:-translate-y-1">
            <h3 className="text-2xl font-bold text-black dark:text-white mb-3 flex items-center gap-3">
              <Rocket className="text-gray-400" size={24} /> 
              Someone clicks and we redirect them instantly
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
              When anyone clicks your short link their browser hits our servers. We look up the code, find the original URL in our database and send them straight there in milliseconds. No visible loading, no detours.
            </p>
          </div>
        </div>

        <div className="mt-20 p-8 bg-gray-50 dark:bg-[#0a0a0a] rounded-3xl border border-gray-200 dark:border-white/20 text-center hover:border-gray-400 dark:hover:border-white/40 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl dark:hover:shadow-[0_10px_30px_rgba(255,255,255,0.05)]">
          <h3 className="text-xl font-bold text-black dark:text-white mb-4">Why bother?</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Short links are easier to share, look cleaner everywhere and let you see exactly how many people clicked. Free links stay alive for 7 days. On Pro you choose when they expire or keep them going forever.
          </p>
        </div>
      </div>
    </motion.main>
  );
}
