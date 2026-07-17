import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft, Clock, Globe, Laptop, Activity } from 'lucide-react';
import StatCard from '../components/StatCard';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function LinkAnalytics() {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
        
        const apiUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/analytics/${shortCode}` : `/api/analytics/${shortCode}`;
        const res = await fetch(apiUrl, { headers });
        
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (shortCode) {
      fetchAnalytics();
    }
  }, [shortCode, session]);

  const { clicksByDate, referrerData, deviceData } = useMemo(() => {
    if (!data?.events) return { clicksByDate: [], referrerData: [], deviceData: [] };
    
    const dateMap = {};
    const refMap = {};
    const devMap = {};

    data.events.forEach(event => {
      // Date processing
      const date = new Date(event.timestamp).toLocaleDateString();
      dateMap[date] = (dateMap[date] || 0) + 1;
      
      // Referrer processing
      let ref = event.referrer || 'Direct';
      if (ref !== 'Direct' && ref.startsWith('http')) {
        try { ref = new URL(ref).hostname; } catch(e){}
      }
      refMap[ref] = (refMap[ref] || 0) + 1;
      
      // Device processing (simple heuristic)
      const ua = (event.userAgent || '').toLowerCase();
      let device = 'Desktop';
      if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) device = 'Mobile';
      if (ua.includes('tablet') || ua.includes('ipad')) device = 'Tablet';
      devMap[device] = (devMap[device] || 0) + 1;
    });

    // Formatting for Recharts
    const clicksByDate = Object.entries(dateMap).map(([date, clicks]) => ({ date, clicks }));
    const referrerData = Object.entries(refMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5);
    const deviceData = Object.entries(devMap).map(([name, value]) => ({ name, value }));
    
    // Sort clicks by date
    clicksByDate.sort((a, b) => new Date(a.date) - new Date(b.date));

    return { clicksByDate, referrerData, deviceData };
  }, [data]);

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

  const { link, events } = data;

  return (
    <div className="w-full text-gray-900 dark:text-white bg-gray-50 dark:bg-black min-h-screen p-4 md:p-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/dashboard')} className="p-2 bg-white dark:bg-[#111] border border-black/15 dark:border-white/10 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Analytics for /{shortCode}</h1>
            <a href={link.targetUrl} target="_blank" rel="noreferrer" className="text-sm text-gray-500 hover:text-blue-500 truncate block max-w-md mt-1">{link.targetUrl}</a>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Clicks" value={link.clicks || 0} icon={Activity} />
          <StatCard title="Unique Events" value={events.length} icon={Globe} />
          <StatCard title="Created" value={new Date(link.createdAt).toLocaleDateString()} icon={Clock} />
          <StatCard title="Top Referrer" value={referrerData[0]?.name || 'N/A'} icon={Laptop} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          
          <div className="bg-white dark:bg-[#111111] border border-black/15 dark:border-white/10 rounded-3xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-6">Clicks Over Time</h3>
            <div className="h-64">
              {clicksByDate.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={clicksByDate}>
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}`} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: 'rgba(0,0,0,0.8)', color: 'white' }} />
                    <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">Not enough data to display</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#111111] border border-black/15 dark:border-white/10 rounded-3xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-6">Traffic Sources (Referrers)</h3>
            <div className="h-64">
              {referrerData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={referrerData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                      {referrerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: 'rgba(0,0,0,0.8)', color: 'white' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">Not enough data to display</div>
              )}
              
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {referrerData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                    <span className="text-gray-600 dark:text-gray-300">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
        
      </div>
    </div>
  );
}
