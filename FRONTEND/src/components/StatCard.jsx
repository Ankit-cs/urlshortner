import { motion } from 'framer-motion';

export default function StatCard({ title, value, subtitle, icon: Icon, colorClass, delay = 0 }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay }} 
      className="bg-white dark:bg-[#111111] border border-black/15 dark:border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-black/30 dark:hover:border-white/20 transition-all cursor-default group shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg dark:shadow-none dark:hover:shadow-none"
    >
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">{title}</h3>
        {Icon && <Icon size={16} className={`text-gray-600 ${colorClass} transition-colors`} />}
      </div>
      <div>
        <div className="text-4xl font-bold flex items-baseline gap-2">{value}</div>
        {subtitle && typeof subtitle === 'string' ? (
            <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
        ) : (
            subtitle
        )}
      </div>
    </motion.div>
  );
}
