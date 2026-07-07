import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-3xl p-8 text-center shadow-2xl"
      >
        <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-black mb-3 text-black dark:text-white tracking-tight">
          Link Not Found
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          Oops! The link you clicked doesn't exist, or it might have expired. 
        </p>
        
        <Link 
          to="/"
          className="btn-black w-full flex items-center justify-center gap-2 py-4 rounded-xl"
        >
          <ArrowLeft size={18} />
          Back to shrink
        </Link>
      </motion.div>
    </div>
  );
}
