import { Activity, Copy, Trash2, QrCode, ArrowUpRight, BarChart2 } from 'lucide-react';

export default function LinkCard({ link, onCopy, onDelete, onShowQR, onOpen, onAnalytics }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-black/15 dark:hover:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-all hover:shadow-md dark:hover:shadow-none gap-4">
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <a href={`${window.location.origin}/${link.shortCode}`} target="_blank" rel="noreferrer" className="font-semibold text-gray-900 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
            {window.location.host}/{link.shortCode}
          </a>
          <span className="text-[10px] px-2 py-0.5 rounded bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-gray-400">
            Expires in 30d
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate" title={link.targetUrl}>{link.targetUrl}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4 sm:w-auto">
        <div className="flex items-center gap-1.5 text-gray-400 w-20">
          <Activity size={14} />
          <span className="text-sm font-medium">{link.clicks || 0}</span>
        </div>
        <div className="text-xs text-gray-500 w-16 text-right">
          {new Date(link.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
        </div>
        
        <div className="flex items-center gap-1">
          <button onClick={() => onAnalytics(link)} className="p-2 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-400/10 rounded-lg transition-colors" title="Analytics">
            <BarChart2 size={16} />
          </button>

          <button onClick={() => onCopy(link.shortCode)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors" title="Copy">
            <Copy size={16} />
          </button>

          <button onClick={() => onDelete(link)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 rounded-lg transition-colors" title="Delete">
            <Trash2 size={16} />
          </button>
          
          <button onClick={() => onShowQR(link.shortCode)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors" title="Show QR">
            <QrCode size={16} />
          </button>
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              onOpen(link);
            }}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors" 
            title="Open"
          >
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
