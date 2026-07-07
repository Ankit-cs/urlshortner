import { motion } from 'framer-motion';
import { ShieldCheck, Database, EyeOff, Cookie, Trash2, Network } from 'lucide-react';
import { useEffect } from 'react';

export default function PrivacyPolicy() {
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
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-black dark:text-white">Privacy Policy</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            At shrink, we believe in radical transparency. We only collect the data necessary to provide our service, and we never sell your information.
          </p>
        </div>

        <div className="space-y-8">
          <Section icon={<Database size={24} />} title="1. Information We Collect">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              We collect the absolute minimum amount of data required to make our URL shortener function:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 leading-relaxed space-y-2 ml-4">
              <li><strong>Link Data:</strong> The original long URLs you submit and the generated short codes.</li>
              <li><strong>Analytics Data:</strong> We aggregate total click counts on links to provide you with basic performance metrics. We do not track the personally identifiable information (PII) of visitors clicking your links.</li>
              <li><strong>Account Data:</strong> If you choose to create an account, we securely store your email address and authentication credentials via our auth provider, Supabase.</li>
            </ul>
          </Section>

          <Section icon={<Network size={24} />} title="2. Third-Party Services">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              To provide a fast and reliable global service, we rely on trusted infrastructure partners:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 leading-relaxed space-y-2 ml-4">
              <li><strong>Cloudflare:</strong> We use Cloudflare Workers and KV storage to run our edge network and database globally.</li>
              <li><strong>Supabase:</strong> We use Supabase to handle secure user authentication and session management.</li>
            </ul>
          </Section>

          <Section icon={<EyeOff size={24} />} title="3. Anti-Spam & Bot Protection">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              To defend our infrastructure from DDoS attacks and automated spam bots, we utilize Cloudflare Turnstile and our own internal IP rate limiters.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              When an unauthenticated user creates a link, their IP address is mathematically processed and temporarily cached for up to 60 seconds purely for rate-limiting (restricting usage to 5 links per minute). We do not permanently log, track, or share these IP addresses.
            </p>
          </Section>

          <Section icon={<Trash2 size={24} />} title="4. Data Retention & Deletion">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              You are in control of your data. We have strict automated data purging policies:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 leading-relaxed space-y-2 ml-4">
              <li><strong>Anonymous Links:</strong> Automatically permanently deleted after 3 days.</li>
              <li><strong>Authenticated Links:</strong> Automatically permanently deleted after 30 days of zero clicks (inactivity).</li>
              <li><strong>Manual Deletion:</strong> Logged-in users can instantly delete their links at any time from their personal dashboard.</li>
            </ul>
          </Section>

          <Section icon={<Cookie size={24} />} title="5. Cookies">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              shrink does not use tracking, advertising, or third-party marketing cookies. We strictly use "essential cookies" required for the platform to function securely:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 leading-relaxed space-y-2 ml-4">
              <li>Session cookies managed by Supabase to keep you logged into your dashboard.</li>
              <li>Secure tokens generated by Cloudflare Turnstile to verify you are a human and not a bot.</li>
            </ul>
          </Section>
        </div>
        
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-white/10 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </motion.main>
  );
}

function Section({ icon, title, children }) {
  return (
    <section className="bg-gray-50 dark:bg-[#111] border border-black/10 dark:border-white/20 rounded-3xl p-8 md:p-10 transition-colors">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-white dark:bg-white/10 text-black dark:text-white rounded-xl flex items-center justify-center flex-shrink-0 border border-black/10 dark:border-white/20">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-black dark:text-white tracking-tight">{title}</h2>
      </div>
      <div className="text-base md:text-lg">
        {children}
      </div>
    </section>
  );
}
