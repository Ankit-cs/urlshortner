import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqCategories = [
  {
    id: "general",
    title: "General Queries",
    items: [
      {
        question: "What is shrink?",
        answer: "shrink is a lightning-fast, privacy-first URL shortener designed for speed and simplicity. We help you take long, unwieldy links and turn them into short, manageable URLs instantly."
      },
      {
        question: "Is it really 100% free?",
        answer: "Yes! The entire platform is completely free to use. There are no paid tiers, no premium plans, and absolutely no ads on the site."
      },
      {
        question: "Do I need to create an account?",
        answer: "No, you can start shortening links instantly as a guest without signing up. However, creating a free account lets you view your link history, access analytics, and manage your active links."
      },
      {
        question: "How long do the links last?",
        answer: "To keep our database fast and optimized, guest links expire after 3 days. For logged-in users, links remain active indefinitely but will be automatically pruned if they receive zero clicks for 30 consecutive days."
      },
      {
        question: "How many links can I shorten?",
        answer: "To prevent abuse and maintain service quality, authenticated users can shorten up to 100 links per month. Guest users are subject to dynamic rate limits."
      }
    ]
  },
  {
    id: "privacy",
    title: "Privacy & Security",
    items: [
      {
        question: "Do you use cookies or track my data?",
        answer: "No. shrink is completely cookie-free and tracking-free. We do not collect Personally Identifiable Information (PII) or serve ads. We only log anonymous click data (like country and referrers) to provide you with link analytics."
      },
      {
        question: "How do you handle spam and abuse?",
        answer: "We use Cloudflare Turnstile for invisible human verification and Cloudflare Workers KV for aggressive, low-latency rate limiting. This stops bots and spammers without affecting real users."
      },
      {
        question: "Can anyone see the analytics for my shortened links?",
        answer: "No, your link analytics are completely private and only accessible to you from your personal dashboard when you are logged in."
      },
      {
        question: "What happens to my data if I delete my account?",
        answer: "If you delete your account, all your shortened links, analytics, and associated data are instantly and permanently wiped from our database."
      }
    ]
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    items: [
      {
        question: "Why did my link stop working?",
        answer: "If a link stopped working, it was likely pruned by our auto-cleanup system (3 days for guests, 30 days of inactivity for users) or it was banned for violating our anti-abuse policy."
      },
      {
        question: "I lost my short link, can I retrieve it?",
        answer: "If you shortened the link while logged in, you can easily find it in your dashboard history. If you were using the tool as a guest, the link cannot be retrieved once you leave the page."
      },
      {
        question: "Why am I getting rate limited?",
        answer: "Rate limits are in place to ensure platform stability. If you're a guest, try creating a free account. If you're logged in, you've likely hit the 100-link monthly cap."
      }
    ]
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  // Fix: Ensure we scroll to the top of the page when the route loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleFAQ = (itemKey) => {
    setOpenIndex(openIndex === itemKey ? null : itemKey);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -100 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-4xl mx-auto px-4 py-32 min-h-[80vh] flex flex-col items-center relative z-10"
    >
      <div className="bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
        Support
      </div>
      <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-black dark:text-white text-center">Frequently Asked Questions</h1>
      <p className="text-gray-600 dark:text-gray-400 text-lg mb-12 text-center max-w-2xl">
        Everything you need to know about shrink. Can't find the answer you're looking for? Feel free to contact our support team.
      </p>

      {/* Category Navigation Pills */}
      <div className="flex flex-wrap justify-center gap-3 mb-16">
        {faqCategories.map((category) => (
          <button 
            key={`nav-${category.id}`}
            onClick={() => document.getElementById(category.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-sm font-bold text-gray-800 dark:text-gray-200 transition-colors shadow-sm dark:shadow-none"
          >
            {category.title}
          </button>
        ))}
      </div>

      <div className="w-full space-y-16">
        {faqCategories.map((category) => (
          <div key={category.id} id={category.id} className="scroll-mt-32">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-6 pl-4 border-l-4 border-blue-500">
              {category.title}
            </h2>
            
            <div className="w-full space-y-4">
              {category.items.map((faq, index) => {
                const itemKey = `${category.id}-${index}`;
                return (
                  <div 
                    key={itemKey} 
                    className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm dark:shadow-none transition-colors"
                  >
                    <button 
                      onClick={() => toggleFAQ(itemKey)}
                      className="w-full text-left px-6 py-6 flex items-center justify-between focus:outline-none group"
                    >
                      <span className="text-lg font-bold text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {faq.question}
                      </span>
                      <motion.div
                        animate={{ rotate: openIndex === itemKey ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <ChevronDown size={20} className="text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {openIndex === itemKey && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-white/5 pt-4">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
