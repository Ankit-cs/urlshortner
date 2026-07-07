import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Link as LinkIcon, FileText } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Disclaimer() {
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
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-black dark:text-white">Disclaimer</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Please read this disclaimer carefully before using the shrink URL shortening service.
          </p>
        </div>

        <div className="space-y-8">
          <Section icon={<LinkIcon size={24} />} title="1. Content of Shortened Links">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              shrink provides a free URL shortening service. We do not create, host, or endorse the content found at the destination URLs. The creation of a short link does not imply any association with or endorsement of the target website. 
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Users are solely responsible for the links they generate. By clicking on a shrink link, you understand that you are leaving our platform and navigating to a third-party site at your own risk.
            </p>
          </Section>

          <Section icon={<AlertTriangle size={24} />} title="2. Abuse and Malicious Use">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              We strictly prohibit the use of our service for illegal, malicious, or harmful activities. This includes, but is not limited to:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 leading-relaxed space-y-2 ml-4">
              <li>Phishing, malware distribution, or spamming.</li>
              <li>Hosting or linking to illegal content, copyright infringement, or hate speech.</li>
              <li>Attempting to bypass our Cloudflare Turnstile human-verification checks.</li>
              <li>Circumventing the 100-link monthly cap or dynamic guest rate-limits.</li>
              <li>Creating spam accounts or utilizing automated bots to abuse our platform.</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
              shrink reserves the absolute right to monitor, disable, or delete any shortened URL, and to permanently ban IP addresses or accounts suspected of abuse without prior notice.
            </p>
          </Section>

          <Section icon={<Shield size={24} />} title="3. Limitation of Liability">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              The service is provided "as is" and "as available" without any warranties of any kind. shrink does not guarantee that the service will be uninterrupted, error-free, or 100% secure.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              In no event shall shrink or its creators be liable for any direct, indirect, incidental, or consequential damages arising out of the use or inability to use our service, or from the content accessed through our shortened links.
            </p>
          </Section>

          <Section icon={<FileText size={24} />} title="4. Service Limits & Data Retention">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              shrink is a 100% free tool maintained by a solo developer. To ensure the platform remains fast and viable for everyone, we enforce strict automated data retention policies:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 leading-relaxed space-y-2 ml-4 mb-4">
              <li><strong>Guest Links:</strong> Automatically and permanently deleted after 3 days.</li>
              <li><strong>Authenticated Links:</strong> Automatically and permanently deleted after 30 consecutive days of receiving zero clicks.</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We make no guarantees regarding the permanent persistence of any generated link. We reserve the right to prune the database at any time to maintain system performance.
            </p>
          </Section>
        </div>
        
        <div className="mt-16 pt-12 border-t border-gray-200 dark:border-white/10 flex flex-col items-center text-center">
          <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
            If you need to report a malicious link, please reach out to our support team.
          </p>
          <Link to="/contact" className="mb-8 inline-block">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="inline-flex items-center justify-center px-8 py-3.5 bg-black text-white dark:bg-white dark:text-black font-bold rounded-xl shadow-md"
            >
              Contact Support
            </motion.div>
          </Link>
          <p className="text-sm text-gray-400 dark:text-gray-500">
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
