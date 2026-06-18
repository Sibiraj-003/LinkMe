import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Mail, Phone, ExternalLink, Download, Share2, Building, Github, Linkedin, Twitter, Code, Terminal, Layout, Dribbble, Globe, Smartphone, ChevronRight, ScanLine } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      if (!username) return;
      try {
        const { data: cards, error: cardsError } = await supabase.from('cards').select('*').eq('username', username);
        
        if (cardsError || !cards || cards.length === 0) {
          setError('Profile not found');
        } else {
          const profileData = cards[0];
          setProfile(profileData);
          
          const { data: portData } = await supabase.from('portfolios').select('*').eq('id', profileData.user_id || profileData.id).single();
          if (portData && portData.items) {
            setPortfolioItems(portData.items);
          }
        }
      } catch (err) {
        console.error("Error loading profile", err);
        setError('Error loading profile');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [username]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#09090b]"><div className="w-8 h-8 rounded-[8px] border-2 border-white/20 border-t-white animate-spin"></div></div>;
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#09090b] text-center px-4 font-sans text-white">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-zinc-900/50 p-10 rounded-[32px] shadow-2xl max-w-sm w-full border border-white/10 backdrop-blur-3xl">
          <div className="w-16 h-16 bg-zinc-800 rounded-[16px] flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-inner">
            <ExternalLink className="w-6 h-6 text-zinc-400" />
          </div>
          <h2 className="text-xl font-medium mb-3 tracking-tight">Identity Not Found</h2>
          <p className="text-[#a1a1aa] mb-8 text-[15px] leading-relaxed">This digital identity could not be located. It may have been relocated or removed.</p>
          <Link to="/">
            <Button className="w-full h-12 rounded-[12px] bg-white text-black hover:bg-zinc-200 font-medium tracking-tight">Create Identity</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const vcfData = `BEGIN:VCARD
VERSION:3.0
FN:${profile.name}
TITLE:${profile.designation}
ORG:${profile.company || ''}
TEL:${profile.mobile || ''}
EMAIL:${profile.email || ''}
URL:${window.location.href}
END:VCARD`;

  const handleDownloadVcard = () => {
    const blob = new Blob([vcfData], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.name.replace(/\s+/g, '_')}_contact.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareProfile = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile.name}'s Profile`,
          text: `Check out ${profile.name}'s digital profile`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Profile link copied to clipboard!');
      }
    } catch (err) {
      console.log('Error sharing', err);
    }
  };

  const themeData = profile.themeData || {};
  const activeTheme = themeData.theme || profile.theme || 'professional';
  const bgColor = themeData.bgColor || '#09090b';
  const fgColor = themeData.fgColor || '#ffffff';
  const accentColor = themeData.accentColor || '#3b82f6';
  const fontFamily = themeData.fontFamily || 'font-sans';

  // Compile Links
  const platformLinks = [];
  if (profile?.github) platformLinks.push({ key: 'github', label: 'GitHub', value: profile.github, sub: 'Repositories & Code', icon: Github });
  if (profile?.linkedin) platformLinks.push({ key: 'linkedin', label: 'LinkedIn', value: profile.linkedin, sub: 'Professional Profile', icon: Linkedin });
  if (profile?.website) platformLinks.push({ key: 'website', label: 'Portfolio', value: profile.website, sub: 'Personal Website', icon: Globe });
  if (profile?.twitter) platformLinks.push({ key: 'twitter', label: 'Twitter / X', value: profile.twitter, sub: 'Social Feed', icon: Twitter });
  if (profile?.behance) platformLinks.push({ key: 'behance', label: 'Behance', value: profile.behance, sub: 'Design Portfolio', icon: Layout });
  if (profile?.dribbble) platformLinks.push({ key: 'dribbble', label: 'Dribbble', value: profile.dribbble, sub: 'UI/UX Shots', icon: Dribbble });
  if (profile?.leetcode) platformLinks.push({ key: 'leetcode', label: 'LeetCode', value: profile.leetcode, sub: 'Problem Solving', icon: Code });
  if (profile?.hackerrank) platformLinks.push({ key: 'hackerrank', label: 'HackerRank', value: profile.hackerrank, sub: 'Coding Challenges', icon: Terminal });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
  };

  return (
    <div 
      className={`min-h-[100dvh] flex justify-center p-4 md:p-8 lg:p-12 ${fontFamily} relative selection:bg-white/20 selection:text-white transition-colors duration-700 antialiased`} 
      style={{ 
        backgroundColor: bgColor,
        color: fgColor,
      } as React.CSSProperties}
    >
      {/* Ambient Glow Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full mix-blend-screen opacity-10 blur-[140px]" style={{ backgroundColor: accentColor }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen opacity-10 blur-[130px]" style={{ backgroundColor: fgColor }} />
      </div>

      <div className="w-full max-w-[1000px] flex flex-col lg:grid lg:grid-cols-12 gap-6 md:gap-8 z-10 relative">
        
        {/* Left Card: Sticky Overview (The Identity Panel) */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full lg:col-span-5 flex flex-col gap-6"
        >
          <div className="rounded-[32px] overflow-hidden relative shadow-2xl lg:sticky lg:top-12 border border-white/10" style={{ backgroundColor: `${fgColor}10`, border: `1px solid ${fgColor}10` }}>
            {/* Header Arthouse Area */}
            <div className="h-48 relative overflow-hidden">
               <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ background: `linear-gradient(135deg, ${accentColor}, transparent)` }} />
               <div className="absolute inset-0 backdrop-blur-[2px]" style={{ background: `linear-gradient(to bottom, transparent, ${bgColor})` }} />
               
               <button onClick={shareProfile} className="absolute top-6 right-6 w-10 h-10 rounded-[12px] bg-black/20 hover:bg-black/40 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 border border-white/10 z-20">
                <Share2 className="w-4 h-4" />
               </button>
            </div>
            
            <div className="px-8 pb-10 relative -mt-16">
              {/* Profile Image */}
              <div 
                className="w-32 h-32 rounded-[24px] mb-6 shadow-xl overflow-hidden flex items-center justify-center relative border-4"
                style={{ borderColor: bgColor, backgroundColor: `${fgColor}05` }}
              >
                  <div className="absolute inset-0 shadow-inner z-20 pointer-events-none" style={{ boxShadow: `inset 0 2px 20px ${fgColor}10` }} />
                 {profile.profilePic ? (
                   <img src={profile.profilePic} alt={profile.name} className="w-full h-full object-cover relative z-10" />
                 ) : (
                   <span className="text-4xl font-medium tracking-tight opacity-40 relative z-10">{profile.name?.charAt(0)}</span>
                 )}
              </div>
              
              <div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border text-[10px] uppercase font-bold tracking-widest"
                       style={{ borderColor: `${accentColor}40`, color: accentColor, backgroundColor: `${accentColor}10` }}>
                       <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor] animate-pulse" />
                       Verified 
                  </div>
                </motion.div>
                
                <h1 className="text-4xl font-medium tracking-[-0.04em] mb-2 leading-none" style={{ color: fgColor }}>
                  {profile.name}
                </h1>
                <p className="text-xl font-normal opacity-80 tracking-tight" style={{ color: accentColor }}>
                  {profile.designation}
                </p>
                {profile.company && (
                  <p className="flex items-center gap-2 mt-2 font-normal opacity-60 text-sm">
                    <Building className="w-4 h-4" />
                    {profile.company}
                  </p>
                )}

                {profile.bio && (
                  <p className="mt-8 text-[15px] leading-[1.6] opacity-70 mb-8 font-normal" style={{ color: fgColor }}>
                    {profile.bio}
                  </p>
                )}

                {/* Primary CTA Block */}
                <div className="flex flex-col gap-3 mt-8">
                  <Button 
                    className="w-full h-14 rounded-[16px] font-medium text-[15px] border-0 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl group"
                    style={{ backgroundColor: accentColor, color: bgColor === '#ffffff' ? '#ffffff' : '#000000' }}
                    onClick={handleDownloadVcard}
                  >
                    Save Contact <Download className="w-4 h-4 ml-2 opacity-80 group-hover:-translate-y-0.5 transition-transform" />
                  </Button>
                  
                  {profile.resumeUrl && (
                    <a 
                      href={profile.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-14 rounded-[16px] font-medium text-[15px] border-2 hover:bg-transparent hover:scale-[1.02] active:scale-[0.98] transition-all group flex flex-row items-center justify-center bg-transparent"
                      style={{ borderColor: `${fgColor}20`, color: fgColor, textDecoration: 'none' }}
                    >
                      View Resume <ExternalLink className="w-4 h-4 ml-2 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Section: Bento Grid Details */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full lg:col-span-7 flex flex-col gap-6"
        >
          {/* Quick Connect Cards */}
          {(profile.email || profile.mobile) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.email && (
                <motion.a 
                  variants={itemVariants}
                  href={`mailto:${profile.email}`}
                  className="p-6 rounded-[24px] border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group flex flex-col justify-between min-h-[140px]"
                  style={{ borderColor: `${fgColor}10`, backgroundColor: `${fgColor}05` }}
                >
                  <div className="w-10 h-10 rounded-[12px] flex items-center justify-center mb-4 transition-colors" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-widest font-bold opacity-50 mb-1" style={{ color: fgColor }}>Email</p>
                    <p className="font-medium text-[15px] truncate" style={{ color: fgColor }}>{profile.email}</p>
                  </div>
                </motion.a>
              )}
              {profile.mobile && (
                <motion.a 
                  variants={itemVariants}
                  href={`tel:${profile.mobile}`}
                  className="p-6 rounded-[24px] border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group flex flex-col justify-between min-h-[140px]"
                  style={{ borderColor: `${fgColor}10`, backgroundColor: `${fgColor}05` }}
                >
                  <div className="w-10 h-10 rounded-[12px] flex items-center justify-center mb-4 transition-colors" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-widest font-bold opacity-50 mb-1" style={{ color: fgColor }}>Phone</p>
                    <p className="font-medium text-[15px] truncate" style={{ color: fgColor }}>{profile.mobile}</p>
                  </div>
                </motion.a>
              )}
            </div>
          )}

          {/* Platform Links Bento */}
          {platformLinks.length > 0 && (
            <motion.div variants={itemVariants} className="p-8 rounded-[32px] border" style={{ borderColor: `${fgColor}10`, backgroundColor: `${fgColor}05` }}>
              <h3 className="text-xl font-medium tracking-tight mb-6" style={{ color: fgColor }}>Digital Presence</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {platformLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a 
                      key={link.key} 
                      href={link.value} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-4 rounded-[20px] border flex items-center gap-4 group hover:scale-[1.02] active:scale-95 transition-all duration-300"
                      style={{ borderColor: `${fgColor}10`, backgroundColor: `${fgColor}03` }}
                    >
                      <div className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 border shadow-sm group-hover:rotate-[5deg] transition-transform duration-300" style={{ backgroundColor: bgColor, borderColor: `${fgColor}10`, color: fgColor }}>
                        <Icon className="w-5 h-5 opacity-80" />
                      </div>
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-medium text-[15px] mb-0.5" style={{ color: fgColor }}>{link.label}</h4>
                        <p className="text-[12px] opacity-50 truncate" style={{ color: fgColor }}>{link.sub}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-transparent group-hover:bg-white/10 transition-colors shrink-0" style={{ color: fgColor }}>
                        <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                    </a>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Portfolio Projects */}
          {portfolioItems && portfolioItems.length > 0 && (
            <motion.div variants={itemVariants} className="p-8 rounded-[32px] border" style={{ borderColor: `${fgColor}10`, backgroundColor: `${fgColor}05` }}>
              <h3 className="text-xl font-medium tracking-tight mb-6" style={{ color: fgColor }}>Selected Works</h3>
              <div className="grid gap-6">
                {portfolioItems.map((item, index) => (
                  <a 
                    key={index} 
                    href={item.url || '#'} 
                    target={item.url ? "_blank" : "_self"} 
                    rel="noopener noreferrer"
                    className="group"
                  >
                   <div className="p-4 rounded-[24px] border shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden relative isolate flex flex-col sm:flex-row gap-5 items-center" style={{ borderColor: `${fgColor}10`, backgroundColor: `${fgColor}03` }}>
                     
                     {item.imageUrl && (
                       <div className="w-full sm:w-40 h-32 rounded-[16px] overflow-hidden shrink-0 border" style={{ borderColor: `${fgColor}10` }}>
                         <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[0.16,1,0.3,1]" />
                       </div>
                     )}
                     <div className="flex-1 w-full text-left py-2 pr-2">
                       <div className="flex items-start justify-between gap-4 mb-2">
                         <h4 className="font-medium text-lg leading-tight" style={{ color: fgColor }}>{item.title}</h4>
                         {item.url && <ExternalLink className="w-4 h-4 opacity-40 shrink-0 mt-1" style={{ color: fgColor }}/>}
                       </div>
                       <p className="text-[14px] leading-relaxed opacity-60 line-clamp-2 font-normal" style={{ color: fgColor }}>
                         {item.description}
                       </p>
                     </div>
                     <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-[0.03] transition-opacity pointer-events-none" />
                   </div>
                  </a>
                ))}
              </div>
            </motion.div>
          )}

          {/* Smart QR Code Connect */}
          <motion.div variants={itemVariants} className="overflow-hidden rounded-[32px] border relative p-8 sm:p-12 flex flex-col sm:flex-row items-center gap-10 sm:justify-between group" style={{ borderColor: `${fgColor}10`, backgroundColor: `${fgColor}05` }}>
            <div className="absolute top-0 right-0 w-64 h-64 mix-blend-overlay opacity-20 pointer-events-none rounded-full blur-[80px]" style={{ backgroundColor: accentColor }} />
            
            <div className="flex-1 text-center sm:text-left z-10 flex flex-col h-full justify-center">
               <div className="w-12 h-12 rounded-[16px] flex items-center justify-center mb-6 shadow-xl mx-auto sm:mx-0 transition-transform duration-300 group-hover:-translate-y-1" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                 <ScanLine className="w-6 h-6" />
               </div>
               <h3 className="text-2xl font-medium tracking-tight mb-3" style={{ color: fgColor }}>Instant Connect.</h3>
               <p className="text-[15px] opacity-60 leading-relaxed font-normal max-w-sm mx-auto sm:mx-0" style={{ color: fgColor }}>
                 Scan this code using any smartphone camera to instantly view and save this identity.
               </p>
            </div>
            
            <div className="p-4 rounded-[24px] bg-white shadow-2xl relative z-10 group-hover:scale-105 transition-transform duration-500 ease-[0.16,1,0.3,1]">
               <QRCodeSVG 
                 value={`${window.location.origin}/${username}`}
                 size={140}
                 bgColor={"#ffffff"}
                 fgColor={"#000000"}
                 level={"M"}
                 includeMargin={false}
                 className="rounded-xl w-32 h-32 sm:w-36 sm:h-36"
               />
            </div>
          </motion.div>
          
        </motion.div>
      </div>
    </div>
  );
}
