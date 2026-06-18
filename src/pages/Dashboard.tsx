import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, LayoutTemplate, Share2, BarChart3, Edit3, Download, ArrowUpRight, TrendingUp, Sparkles, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';

const data = [
  { name: 'Mon', views: 40 },
  { name: 'Tue', views: 30 },
  { name: 'Wed', views: 20 },
  { name: 'Thu', views: 45 },
  { name: 'Fri', views: 18 },
  { name: 'Sat', views: 23 },
  { name: 'Sun', views: 34 },
];

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchCard() {
      if (!user) return;
      try {
        const { data: docSnap, error } = await supabase.from('cards').select('*').eq('id', user.id).single();
        if (docSnap) {
          setProfile(docSnap);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchCard();
  }, [user]);

  const username = profile?.username || user?.user_metadata?.full_name?.replace(/\\s+/g, '').toLowerCase() || 'profile';
  const publicUrl = `${window.location.origin}/${username}`;

  return (
    <div className="min-h-[100dvh] bg-[#09090b] font-sans flex flex-col md:flex-row text-white selection:bg-white/20">
      
      {/* Ambient Glow Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px]" />
      </div>

      {/* Sidebar - Premium Minimalist */}
      <aside className="w-full md:w-64 lg:w-[280px] bg-black/40 border-r border-white/5 p-6 flex flex-col sticky top-0 h-screen z-10 backdrop-blur-2xl shrink-0">
        <div className="flex items-center gap-3 mb-12 pl-2">
          <div className="w-8 h-8 rounded-[10px] bg-white flex items-center justify-center shadow-[0_0_15px_#ffffff20]">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-white">Identity Hub</span>
        </div>
        
        <nav className="flex-1 space-y-1 flex flex-col pt-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 pl-3">Main Workflow</span>
          
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-3 rounded-[12px] bg-white/10 text-white font-medium transition-all border border-white/5 shadow-inner">
            <LayoutTemplate className="w-4 h-4 text-white" />
            Dashboard
          </Link>
          <Link to="/editor" className="flex items-center gap-3 px-3 py-3 hover:bg-white/5 rounded-[12px] text-zinc-400 font-medium transition-all hover:text-white group">
            <Edit3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Profile Editor
          </Link>
          <Link to="/designer" className="flex items-center gap-3 px-3 py-3 hover:bg-white/5 rounded-[12px] text-zinc-400 font-medium transition-all hover:text-white group">
            <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Card Designer
          </Link>
          <button className="flex w-full items-center gap-3 px-3 py-3 hover:bg-white/5 rounded-[12px] text-zinc-400 font-medium transition-all hover:text-white group">
            <BarChart3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Analytics
          </button>
          <button className="flex w-full items-center gap-3 px-3 py-3 hover:bg-white/5 rounded-[12px] text-zinc-400 font-medium transition-all hover:text-white group mt-auto mb-2 border border-transparent hover:border-white/5">
            <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform" />
            Settings
          </button>
        </nav>

        <div className="pt-6 mt-auto border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-[16px] bg-white/5 border border-white/10 mb-4 shadow-sm hover:bg-white/10 transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-[12px] bg-zinc-800 overflow-hidden shrink-0 border border-white/10 shadow-inner group-hover:scale-[1.02] transition-transform">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-zinc-500">U</div>
              )}
            </div>
            <div className="flex flex-col min-w-0 pr-2">
               <span className="text-[13px] font-medium text-white truncate">{user?.user_metadata?.full_name || 'Associate'}</span>
               <span className="text-[10px] font-bold text-indigo-400 truncate uppercase mt-0.5 tracking-wider">Premium Active</span>
            </div>
          </div>
          <button onClick={signOut} className="flex w-full items-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 rounded-[12px] font-semibold transition-all text-[11px] justify-center uppercase tracking-widest border border-red-500/20">
            <LogOut className="w-3.5 h-3.5" />
            Disconnect
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-10 xl:p-12 overflow-y-auto max-w-[1400px] w-full relative z-10 hide-scrollbar scroll-smooth">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-medium tracking-tight text-white flex items-center gap-3 mb-2">
                Mission Control <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse" />
              </h1>
              <p className="text-[14px] text-zinc-400">Platform telemetry and high-level performance insights.</p>
            </div>
            <div className="flex items-center gap-3">
               <Link to="/editor">
                 <Button variant="outline" className="h-10 rounded-[10px] px-5 text-[12px] font-bold gap-2 bg-transparent border-white/10 hover:bg-white/5 text-white">
                   <Edit3 className="w-3.5 h-3.5" />
                   Edit Data
                 </Button>
               </Link>
               <Link to={`/${username}`}>
                 <Button className="h-10 rounded-[10px] px-5 text-[12px] font-bold gap-2 bg-white text-black hover:bg-zinc-200 border-0 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all">
                   <ArrowUpRight className="w-3.5 h-3.5" />
                   View Profile
                 </Button>
               </Link>
            </div>
          </header>

          {/* Premium KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-10">
            <div className="p-8 rounded-[24px] bg-zinc-900/40 border border-white/5 shadow-sm backdrop-blur-md relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-700" />
              <div className="flex justify-between items-start mb-8">
                 <div className="w-10 h-10 rounded-[12px] bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <Activity className="w-5 h-5 text-indigo-400" />
                 </div>
                 <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-[8px]">
                   <TrendingUp className="w-3 h-3" /> +12%
                 </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-medium tracking-wide uppercase text-zinc-500 mb-1">Total Profile Views</span>
                <span className="text-4xl font-medium text-white tracking-[-0.02em]">1,248</span>
              </div>
            </div>
            
            <div className="p-8 rounded-[24px] bg-zinc-900/40 border border-white/5 shadow-sm backdrop-blur-md relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-700" />
              <div className="flex justify-between items-start mb-8">
                 <div className="w-10 h-10 rounded-[12px] bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                    <LayoutTemplate className="w-5 h-5 text-rose-400" />
                 </div>
                 <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-[8px]">
                   <TrendingUp className="w-3 h-3" /> +5%
                 </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-medium tracking-wide uppercase text-zinc-500 mb-1">Card Interactions</span>
                <span className="text-4xl font-medium text-white tracking-[-0.02em]">432</span>
              </div>
            </div>
            
            <div className="p-8 rounded-[24px] bg-zinc-900/40 border border-white/5 shadow-sm backdrop-blur-md relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-700" />
              <div className="flex justify-between items-start mb-8">
                 <div className="w-10 h-10 rounded-[12px] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Download className="w-5 h-5 text-emerald-400" />
                 </div>
                 <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-800 border border-white/5 px-2.5 py-1 rounded-[8px]">
                   Past 30 Days
                 </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-medium tracking-wide uppercase text-zinc-500 mb-1">Contact Saves</span>
                <span className="text-4xl font-medium text-white tracking-[-0.02em]">89</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 xl:gap-8">
            
            {/* Main Chart Section */}
            <div className="xl:col-span-3 p-8 rounded-[32px] bg-zinc-900/40 border border-white/5 shadow-sm backdrop-blur-md flex flex-col relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-10">
                 <div>
                    <h3 className="text-[18px] font-medium tracking-tight mb-1 text-white">Traffic Overview</h3>
                    <p className="text-[12px] text-zinc-500">7-Day Engagement Model</p>
                 </div>
                 <div className="flex gap-1.5 bg-black/40 p-1 rounded-[12px] border border-white/5">
                   <button className="px-4 py-2 rounded-[8px] bg-zinc-800 text-[11px] font-medium text-white shadow-sm">7D</button>
                   <button className="px-4 py-2 rounded-[8px] text-[11px] font-medium text-zinc-500 hover:text-white transition-colors">30D</button>
                   <button className="px-4 py-2 rounded-[8px] text-[11px] font-medium text-zinc-500 hover:text-white transition-colors">ALL</button>
                 </div>
              </div>
              
              <div className="h-72 w-full mt-auto relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12, fontWeight: 500}} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12, fontWeight: 500}} />
                    <Tooltip 
                       cursor={{stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4'}} 
                       contentStyle={{backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)', color: '#fff'}} 
                       itemStyle={{color: '#fff'}}
                    />
                    <Area type="monotone" dataKey="views" stroke="#ffffff" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" activeDot={{r: 6, fill: '#09090b', stroke: '#ffffff', strokeWidth: 2}} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Activity Logs & Preview */}
            <div className="xl:col-span-2 flex flex-col gap-6 xl:gap-8">
              <div className="p-8 rounded-[32px] bg-indigo-600 shadow-xl relative overflow-hidden flex flex-col items-center">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] pointer-events-none" />
                 <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-[80px] pointer-events-none" />
                 
                 <div className="w-full flex justify-between items-center mb-8 z-10 relative">
                    <div>
                      <h3 className="text-xl font-medium tracking-tight mb-1 text-white">Instant Share</h3>
                      <p className="text-[12px] font-medium text-indigo-200">Scan Matrix Active</p>
                    </div>
                    <Link to={`/${username}`}>
                      <Button variant="outline" size="icon" className="w-10 h-10 rounded-[10px] bg-white/10 border-white/20 hover:bg-white/20 text-white">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </Link>
                 </div>
                 
                 <div className="bg-white p-5 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] mb-8 z-10 relative transform hover:scale-105 transition-transform duration-500">
                   <QRCodeSVG id="qr-gen" value={publicUrl} size={150} level="H" fgColor="#000000" />
                 </div>
                 <div className="flex gap-3 w-full z-10">
                   <Button className="flex-1 rounded-[12px] h-12 bg-white text-black font-medium tracking-tight text-[13px] hover:bg-zinc-200 transition-colors shadow-xl">
                     Copy Link
                   </Button>
                 </div>
              </div>

              <div className="p-8 rounded-[32px] bg-zinc-900/40 border border-white/5 shadow-sm backdrop-blur-md flex-1">
                <h3 className="text-[14px] font-medium tracking-wide mb-8 text-white">Recent Events</h3>
                <div className="space-y-6">
                   <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-[12px] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                      <Activity className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-[14px] font-medium text-zinc-300 leading-tight">Profile viewed from LinkedIn</p>
                      <p className="text-[11px] font-medium text-zinc-500 mt-1.5 uppercase tracking-wider">2h ago</p>
                    </div>
                   </div>
                   <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-[12px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Download className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-[14px] font-medium text-zinc-300 leading-tight">vCard Contact Downloaded</p>
                      <p className="text-[11px] font-medium text-zinc-500 mt-1.5 uppercase tracking-wider">5h ago</p>
                    </div>
                   </div>
                   <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-[12px] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                      <LayoutTemplate className="w-4 h-4 text-rose-400" />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-[14px] font-medium text-zinc-300 leading-tight">QR Code Matrix Scanned</p>
                      <p className="text-[11px] font-medium text-zinc-500 mt-1.5 uppercase tracking-wider">1d ago</p>
                    </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
