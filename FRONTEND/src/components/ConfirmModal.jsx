import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", isDestructive = false }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-[#111] border p-8 rounded-3xl shadow-2xl relative flex flex-col items-center max-w-sm w-full ${isDestructive ? 'border-red-500/30' : 'border-black/10 dark:border-white/10'}`}
      >
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 border ${isDestructive ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'}`}>
          <AlertCircle size={32} />
        </div>
        
        <h3 className="text-xl font-medium text-black dark:text-white mb-2 text-center">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6 leading-relaxed">
          {message}
        </p>
        
        <div className="flex gap-3 w-full">
          <button 
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-black dark:text-white rounded-xl py-3 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 text-white rounded-xl py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${isDestructive ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
