import { motion } from 'framer-motion';
import { Mail, Clock, HelpCircle } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Contact() {
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
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-gray-100 dark:bg-white/10 rounded-2xl mb-6 text-black dark:text-white">
            <Mail size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-black dark:text-white">Get in Touch</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Have a question, feature request, or just want to say hi? I'd love to hear from you. 
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Email Card */}
          <a 
            href="mailto:priyanshbhatt.dev@gmail.com"
            className="group bg-gray-50 dark:bg-[#111] border border-black/10 dark:border-white/20 rounded-3xl p-5 transition-all hover:border-black/30 dark:hover:border-white/40 hover:-translate-y-1 flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 bg-white dark:bg-white/10 text-black dark:text-white rounded-2xl flex items-center justify-center border border-black/10 dark:border-white/20 mb-4 group-hover:scale-110 transition-transform">
              <Mail size={22} />
            </div>
            <h2 className="text-lg font-bold text-black dark:text-white mb-1">Email Me</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">priyanshbhatt.dev@gmail.com</p>
          </a>

          {/* GitHub Card */}
          <a 
            href="https://github.com/thepriyanshbhatt"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-gray-50 dark:bg-[#111] border border-black/10 dark:border-white/20 rounded-3xl p-5 transition-all hover:border-black/30 dark:hover:border-white/40 hover:-translate-y-1 flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 bg-white dark:bg-white/10 text-black dark:text-white rounded-2xl flex items-center justify-center border border-black/10 dark:border-white/20 mb-4 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            </div>
            <h2 className="text-lg font-bold text-black dark:text-white mb-1">GitHub</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">github.com/thepriyanshbhatt</p>
          </a>
        </div>

        <div className="space-y-6">
          {/* Response Time Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-3xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-1">Response Time</h3>
              <p className="text-blue-800/80 dark:text-blue-200/70 leading-relaxed">
                While I strive to respond as quickly as possible to all inquiries, please allow 36 to 48 hours for a response as shrink is maintained and operated by a solo developer.
              </p>
            </div>
          </div>

          {/* FAQ Redirect */}
          <div className="bg-gray-50 dark:bg-[#111] border border-black/10 dark:border-white/20 rounded-3xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="w-12 h-12 bg-white dark:bg-white/10 text-black dark:text-white border border-black/10 dark:border-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <HelpCircle size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-black dark:text-white mb-1">Common Issues?</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                If you are experiencing an issue or have a general question about how shrink works, there's a good chance it's already been answered! Please check out the FAQs before sending an email.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex-shrink-0 sm:self-center">
              <Link to="/faq" className="inline-block">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="inline-flex items-center justify-center px-6 py-3 bg-black text-white dark:bg-white dark:text-black font-semibold rounded-xl shadow-md"
                >
                  View FAQs
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.main>
  );
}
