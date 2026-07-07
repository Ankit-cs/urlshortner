import { motion } from 'framer-motion';
import { FileText, ShieldAlert, Clock, Ban, Server, UserCheck } from 'lucide-react';
import { useEffect } from 'react';

export default function TermsOfService() {
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
            <FileText size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-black dark:text-white">Terms of Service</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            By accessing and using shrink, you agree to be bound by these Terms of Service. Please read them carefully.
          </p>
        </div>

        <div className="space-y-8">
          <Section icon={<ShieldAlert size={24} />} title="1. Acceptable Use Policy">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              shrink is designed to be a fast, secure, and helpful tool for shortening links. We strictly prohibit the use of our platform for any malicious or illegal activities. You may not use shrink to shorten links that redirect to:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 leading-relaxed space-y-2 ml-4">
              <li>Phishing, malware, or ransomware distribution.</li>
              <li>Copyright-infringing material or pirated software.</li>
              <li>Illegal content, hate speech, or harassment.</li>
              <li>Scams, deceptive practices, or spam campaigns.</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
              We proactively monitor traffic and reserve the absolute right to delete any link, block any IP address, or permanently ban any account that violates this policy, without prior notice.
            </p>
          </Section>

          <Section icon={<Server size={24} />} title="2. Service Limits & Pricing">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              shrink is a 100% free service. We do not have paid plans, premium tiers, or hidden fees. We also commit to providing a completely ad-free experience. However, to ensure fair usage and prevent abuse, we enforce the following limits:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 leading-relaxed space-y-2 ml-4">
              <li><strong>Authenticated Users:</strong> Limited to creating 100 short links per month to prevent automated database spam.</li>
              <li><strong>Rate Limiting:</strong> Unauthenticated API requests are strictly rate-limited to 5 links per 60 seconds per IP address.</li>
            </ul>
          </Section>

          <Section icon={<Clock size={24} />} title="3. Data Retention & Link Expiration">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              To keep our database optimized and prevent digital clutter, we implement automated link expiration policies based on account status:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 leading-relaxed space-y-2 ml-4">
              <li><strong>Anonymous Links:</strong> Links created without logging into an account will automatically expire and be deleted after 3 days.</li>
              <li><strong>Authenticated Links:</strong> Links created while logged in are retained for 30 days of inactivity. If a link receives zero clicks for 30 consecutive days, it will be automatically deleted.</li>
            </ul>
          </Section>

          <Section icon={<UserCheck size={24} />} title="4. Privacy & Bot Protection">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              We respect your privacy. We do not track personal web browsing histories or sell data to advertisers.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              To protect our infrastructure from DDoS attacks and automated spam bots, we utilize Cloudflare Turnstile and Cloudflare KV. Your IP address may be temporarily processed and cached for up to 60 seconds purely for rate-limiting and security verification purposes. By using our service, you consent to these necessary security checks.
            </p>
          </Section>

          <Section icon={<Ban size={24} />} title="5. Limitation of Liability">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              shrink is provided on an "as-is" and "as available" basis. We make no warranties, expressed or implied, regarding the uptime, reliability, or permanence of any shortened links.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              In no event shall shrink, its developers, or its affiliates be held liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our service, including but not limited to lost profits, lost data, or business interruption.
            </p>
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
