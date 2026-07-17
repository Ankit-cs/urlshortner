import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Activity, Link as LinkIcon, BarChart3, Clock } from 'lucide-react';
import StatCard from '../components/StatCard';

export default function Analytics() {
  const navigate = useNavigate();
  const { session } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
        
        const apiUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/links` : '/api/links';
        const res = await fetch(apiUrl, { headers });
        
        if (!res.ok) throw new Error('Failed to fetch links');
        const json = await res.json();
        setLinks(json.links || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLinks();
  }, [session]);

  const { totalClicks, activeLinks, topLinks, linksByDate } = useMemo(() => {
    if (!links.length) return { totalClicks: 0, activeLinks: 0, topLinks: [], linksByDate: [] };
    
    let clicks = 0;
    const dateMap = {};
    
    links.forEach(link => {
      clicks += (link.clicks || 0);
      
      const date = new Date(link.createdAt).toLocaleDateString();
      dateMap[date] = (dateMap[date] || 0) + 1;
    });

    const topLinks = [...links].sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).slice(0, 5);
    const linksByDate = Object.entries(dateMap).map(([date, count]) => ({ date, count })).sort((a,b) => new Date(a.date) - new Date(b.date));

    return { totalClicks: clicks, activeLinks: links.length, topLinks, linksByDate };
  }, [links]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black dark:border-[#333] dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-black p-6 text-center text-gray-900 dark:text-white">
        <div className="text-red-500 mb-4">{error}</div>
        <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Go Back</button>
      </div>
    );
  }

  return (
    <div className="w-full text-gray-900 dark:text-white bg-gray-50 dark:bg-black min-h-screen p-4 md:p-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/dashboard')} className="p-2 bg-white dark:bg-[#111] border border-black/15 dark:border-white/10 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Overall Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">Metrics across all your active links.</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Clicks" value={totalClicks} icon={BarChart3} colorClass="text-blue-500" />
          <StatCard title="Active Links" value={activeLinks} icon={LinkIcon} colorClass="text-green-500" />
          <StatCard title="Avg Clicks / Link" value={activeLinks ? Math.round(totalClicks / activeLinks) : 0} icon={Activity} colorClass="text-purple-500" />
          <StatCard title="Avg Lifetime" value="30d" icon={Clock} colorClass="text-amber-500" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          
          <div className="bg-white dark:bg-[#111111] border border-black/15 dark:border-white/10 rounded-3xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-6">Links Created Over Time</h3>
            <div className="h-64">
              {linksByDate.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={linksByDate}>
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: 'rgba(0,0,0,0.8)', color: 'white' }} />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">Not enough data to display</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#111111] border border-black/15 dark:border-white/10 rounded-3xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-6">Top Performing Links</h3>
            <div className="flex flex-col gap-4">
              {topLinks.length > 0 ? (
                topLinks.map((link, i) => (
                  <div key={link.shortCode} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                    <div className="flex flex-col truncate pr-4">
                      <span className="font-medium text-blue-500">/{link.shortCode}</span>
                      <span className="text-xs text-gray-500 truncate">{link.targetUrl}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-200 dark:bg-white/10 px-3 py-1 rounded-full whitespace-nowrap">
                      <Activity size={12} className="text-gray-500" />
                      <span className="text-sm font-semibold">{link.clicks || 0}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 py-10">No links found</div>
              )}
            </div>
          </div>

        </div>
        
      </div>
    </div>
  );
}
