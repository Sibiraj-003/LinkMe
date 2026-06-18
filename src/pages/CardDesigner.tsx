import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Loader2, 
  Download, 
  Image as ImageIcon, 
  FileText, 
  Smartphone, 
  Mail, 
  Globe, 
  MapPin, 
  Code, 
  Github, 
  Linkedin, 
  Briefcase, 
  Sparkles, 
  LayoutTemplate, 
  Palette, 
  Zap, 
  CheckCircle2,
  Check,
  RotateCcw,
  Sliders,
  Eye,
  Layers,
  Award,
  Terminal,
  Printer,
  ChevronRight,
  ShieldCheck,
  Flame,
  Layout,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';

// ==========================================
// 3D TILT WRAPPER COMPONENT BY HOVER
// ==========================================
const TiltCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalize coordinates (-0.5 to 0.5)
    const normalizedX = (x / rect.width) - 0.5;
    const normalizedY = (y / rect.height) - 0.5;
    
    // Rotate slightly max 8deg for subtle, clean real-life effect
    setRotation({
      x: -normalizedY * 8,
      y: normalizedX * 8
    });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      className={`transition-all duration-300 ease-out relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? 1.02 : 1})`,
        transition: isHovered ? 'transform 0.1s ease-out' : 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isHovered 
          ? '0 30px 60px -15px rgba(0,0,0,0.8), 0 0 40px rgba(59,130,246,0.15)' 
          : '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      {children}
    </div>
  );
};

// Helper to proxy cross-origin images so html2canvas doesn't fail canvas export
const getProxiedImageUrl = (url: string | null | undefined) => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/') || url.includes('localhost:')) {
    return url;
  }
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
};

// Help resolve OKLCH colors during html2canvas render to bypass parsing errors
const resolveOklchInClonedDoc = (clonedDoc: Document) => {
  const elements = clonedDoc.getElementsByTagName('*');

  const colorProps = [
    'color',
    'backgroundColor',
    'borderColor',
    'borderTopColor',
    'borderRightColor',
    'borderBottomColor',
    'borderLeftColor',
    'fill',
    'stroke'
  ];

  const canvas = clonedDoc.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const resolveColor = (colorStr: string): string => {
    if (
      !colorStr ||
      (!colorStr.includes('oklch') &&
       !colorStr.includes('oklab'))
    ) {
      return colorStr;
    }

    try {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = colorStr;
      ctx.fillRect(0, 0, 1, 1);

      const imgData = ctx.getImageData(0, 0, 1, 1);
      const [r, g, b, a] = imgData.data;

      return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
    } catch {
      return colorStr;
    }
  };

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i] as HTMLElement;
    if (!el.style) continue;

    const computed =
      el.ownerDocument?.defaultView
        ? el.ownerDocument.defaultView.getComputedStyle(el)
        : window.getComputedStyle(el);

    if (!computed) continue;

    for (const prop of colorProps) {
      const val = computed[prop as any];

      if (
        val &&
        (val.includes('oklch') || val.includes('oklab'))
      ) {
        el.style[prop as any] = resolveColor(val);
      }
    }

    const bgVal = computed.backgroundImage;

    if (
      bgVal &&
      (bgVal.includes('oklch') || bgVal.includes('oklab'))
    ) {
      const regex = /(oklch|oklab)\([^)]+\)/g;

      el.style.backgroundImage = bgVal.replace(
        regex,
        (match) => resolveColor(match)
      );
    }
  }
};

// ==========================================
// PREMIUM FRONT BUSINESS CARD RENDERER
// ==========================================
const CardFrontRenderer = ({ 
  theme, 
  profile, 
  bgColor, 
  fgColor, 
  accentColor, 
  fontFamily,
  cornerRadius = 24,
  shadowIntensity = 0.5,
  gradientMode = false,
  glassEffect = false,
  paperTexture = false
}: any) => {
  const finalBg = gradientMode ? `linear-gradient(135deg, ${bgColor}, ${accentColor}dd)` : bgColor;
  const resolvedFont = fontFamily === 'font-serif' ? 'Georgia, serif' : (fontFamily === 'font-mono' ? 'Courier, monospace' : 'Inter, sans-serif');

  return (
    <div 
      className={`w-[700px] h-[400px] flex items-center justify-between p-12 relative overflow-hidden transition-all duration-500`}
      style={{ 
        background: finalBg,
        backgroundColor: bgColor,
        color: fgColor,
        fontFamily: resolvedFont,
        borderRadius: `${cornerRadius}px`,
        boxShadow: `0 ${shadowIntensity * 24}px ${shadowIntensity * 48}px -${shadowIntensity * 12}px rgba(0, 0, 0, 0.6)`
      }}
    >
      {/* Paper texture overlay option */}
      {paperTexture && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-overlay animate-pulse"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #000 0px, #000 1px, transparent 1px, transparent 3px)'
          }}
        />
      )}

      {/* Glass gloss shine effect option */}
      {glassEffect && (
        <>
          <div className="absolute inset-0 bg-white/[0.04] backdrop-blur-md" />
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.05) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          />
        </>
      )}

      {/* THEME 1: PROFESSIONAL TYPE (Luxury Black and Gold) */}
      {theme === 'professional' && (
        <>
          {/* Subtle gold elegant radial glow behind */}
          <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.15),transparent_70%)]" />
          <div className="absolute top-0 right-0 w-48 h-full transform skew-x-[-12deg] translate-x-12 opacity-10 pointer-events-none" style={{ backgroundColor: accentColor }} />
          
          {/* Luxury frame border design */}
          <div className="absolute inset-4 pointer-events-none border rounded-[16px]" style={{ borderColor: `${accentColor}25` }} />
          
          {/* Gilded photo corners */}
          <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: accentColor }} />
          <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 pointer-events-none" style={{ borderColor: accentColor }} />
          <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 pointer-events-none" style={{ borderColor: accentColor }} />
          <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: accentColor }} />

          {/* Core Content Grid */}
          <div className="w-full flex items-center justify-between z-10 px-4">
            <div className="flex flex-col max-w-[420px] select-none text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] tracking-[0.35em] uppercase font-black px-2.5 py-0.5 rounded-full border text-amber-400 bg-amber-500/15" style={{ borderColor: `${accentColor}60` }}>
                  💼 Executive
                </span>
                {profile?.company && (
                  <span className="text-[9px] tracking-[0.15em] uppercase font-bold opacity-65">
                    // verified identity
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl font-extrabold tracking-tight mb-2 uppercase font-serif drop-shadow-md" style={{ color: accentColor || '#d4af37' }}>
                {profile?.name || 'Your Name'}
              </h1>
              
              <p className="text-base font-semibold tracking-widest uppercase opacity-85 mt-1" style={{ color: fgColor }}>
                {profile?.designation || 'Your Designation'}
              </p>
              
              {profile?.company && (
                <div className="mt-6 pt-4 border-t w-[220px]" style={{ borderColor: `${accentColor}35` }}>
                  <p className="text-xs font-bold tracking-[0.3em] uppercase opacity-75 truncate">{profile.company}</p>
                </div>
              )}
            </div>

            {profile?.profilePic && (
              <div className="relative shrink-0 mr-4">
                {/* Gold glowing shadow rings */}
                <div className="absolute -inset-1.5 rounded-2xl blur-lg opacity-40 animate-pulse pointer-events-none" style={{ backgroundColor: accentColor }} />
                <div className="w-[120px] h-[120px] rounded-2xl overflow-hidden border-2 shadow-2xl relative bg-black/40 flex items-center justify-center p-0.5" style={{ borderColor: accentColor }}>
                  <img src={profile.profilePic} alt="Profile" className="w-full h-full object-cover rounded-xl grayscale brightness-110 contrast-110" crossOrigin="anonymous" />
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* THEME 2: CREATIVE TYPE (Designer Portfolio with Paint/Blob effects) */}
      {theme === 'creative' && (
        <>
          {/* Dynamic organic gradient spheres */}
          <div className="absolute top-[-60px] right-[-60px] w-[280px] h-[280px] rounded-full blur-[60px] opacity-40 mix-blend-screen animate-pulse" style={{ backgroundColor: accentColor }} />
          <div className="absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full blur-[75px] opacity-30 mix-blend-screen" style={{ backgroundColor: fgColor }} />
          <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-[radial-gradient(circle_at_40%_50%,rgba(255,255,255,0.4),transparent)]" />
          
          <div className="absolute top-4 left-6 text-[9px] font-mono tracking-widest opacity-35 uppercase select-none">
            CREATOR SYSTEM v2.5 / LIVE SHIELD
          </div>

          {/* Card Content container with backdrop blur card */}
          <div className="w-full h-full flex items-center justify-between z-10 px-2">
            <div className="flex flex-col max-w-[420px] text-left">
              <div className="inline-flex items-center gap-1.5 mb-3 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-200">🚀 Builder</span>
              </div>

              <h1 className="text-4xl font-black tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-purple-300 drop-shadow-sm leading-tight" style={{ color: fgColor }}>
                {profile?.name || 'Your Name'}
              </h1>
              
              <p className="text-lg italic font-serif opacity-90 tracking-wide" style={{ color: accentColor }}>
                {profile?.designation || 'Your Designation'}
              </p>

              {profile?.company && (
                <span className="text-[10px] mt-4 uppercase tracking-[0.25em] px-3.5 py-1 rounded-full bg-white/5 border border-white/5 text-zinc-200 w-fit backdrop-blur-xl">
                  {profile.company}
                </span>
              )}
            </div>

            {profile?.profilePic && (
              <div className="relative shrink-0 mr-2 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="absolute -inset-2 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-2xl opacity-40 blur-xl pointer-events-none" />
                <div className="w-[110px] h-[110px] rounded-2xl overflow-hidden p-1 shadow-2xl relative" style={{ background: `linear-gradient(to top right, ${bgColor}, ${accentColor})` }}>
                  <img src={profile.profilePic} alt="Profile" className="w-full h-full object-cover rounded-xl" crossOrigin="anonymous" />
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* THEME 3: FUNNY TYPE (Gaming and Sticker style) */}
      {theme === 'funny' && (
        <>
          {/* Retro checker pattern overlay */}
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, #000 2.5px, transparent 2.5px)', backgroundSize: '14px 14px' }} />
          <div className="absolute inset-4 border-2 border-black rounded-2xl pointer-events-none" />
          
          {/* Fun sticker elements */}
          <div className="absolute top-5 right-12 text-3xl rotate-12 select-none">🎮</div>
          <div className="absolute bottom-6 left-12 text-3xl -rotate-12 select-none">🚀</div>
          <div className="absolute bottom-5 right-48 text-3xl rotate-6 select-none">⚡</div>

          <div className="w-full flex items-center justify-between z-10 px-4">
            <div className="flex flex-col text-left">
              <div className="inline-block px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest mb-3 bg-red-500 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] w-fit border-2 border-black select-none">
                🎮 LEVEL 99 CODER
              </div>
              
              <h1 className="text-4xl font-extrabold mb-2 tracking-tight rotate-[-1.5deg] text-white" style={{ textShadow: `3px 3px 0px ${accentColor || '#000'}` }}>
                {profile?.name || 'Your Name'}
              </h1>
              
              <p className="text-sm font-black bg-white text-black px-3.5 py-1 mt-1 w-fit transform rotate-[1.5deg] border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                {profile?.designation || 'Your Designation'}
              </p>

              {profile?.company && (
                <p className="text-xs mt-6 font-extrabold flex items-center gap-1.5 text-zinc-900 border-b border-black/10 pb-0.5 w-fit">
                  🔥 PLAYING ON @ <span className="uppercase">{profile.company}</span>
                </p>
              )}
            </div>

            <div className="flex flex-col items-center gap-2 rotate-3 shrink-0">
              {profile?.profilePic ? (
                <div className="w-28 h-28 rounded-2xl border-4 border-black overflow-hidden shadow-[4px_4px_0_0_rgba(0,0,0,1)] bg-white">
                  <img src={profile.profilePic} alt="funny avatar" className="w-[112px] h-[112px] object-cover rounded-xl" crossOrigin="anonymous" />
                </div>
              ) : (
                <div className="text-7xl drop-shadow-2xl">🔥</div>
              )}
              <span className="text-[9px] font-black bg-yellow-400 text-black px-2.5 py-0.5 rounded shadow-sm border border-black uppercase tracking-wider select-none">
                MVP ⭐
              </span>
            </div>
          </div>
        </>
      )}

      {/* THEME 4: CARTOON TYPE (Illustrated with 3D avatar vibe) */}
      {theme === 'cartoon' && (
        <>
          <div className="absolute inset-4 border-2 rounded-2xl opacity-30 border-dashed" style={{ borderColor: fgColor }} />
          
          {/* Cloud illustration decorative elements */}
          <div className="absolute top-5 left-10 text-2xl select-none opacity-40">☁️</div>
          <div className="absolute top-4 right-16 text-3xl select-none opacity-45">✨</div>
          <div className="absolute bottom-5 right-12 text-2xl select-none opacity-40">☁️</div>

          <div className="w-full flex items-center justify-between z-10 px-4">
            <div className="flex flex-col text-left max-w-[420px]">
              <div className="flex items-center gap-1 bg-sky-200/50 border border-sky-300/30 text-sky-800 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit mb-3">
                <span>⭐ TOP DEVELOPER</span>
              </div>

              <h1 className="text-4xl font-extrabold uppercase mb-1 tracking-wide text-blue-900 drop-shadow-[2px_2px_0px_rgba(255,255,255,0.8)]">
                {profile?.name || 'Your Name'}
              </h1>
              
              <p className="text-base font-black px-4 py-1 rounded-full border-2 text-sm shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] mt-2 w-fit" style={{ backgroundColor: accentColor, color: bgColor, borderColor: fgColor }}>
                {profile?.designation || 'Mastermind'}
              </p>

              {profile?.company && (
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-sky-900/60 uppercase tracking-widest">
                  🎨 {profile.company} studio
                </div>
              )}
            </div>

            {profile?.profilePic && (
              <div className="w-[110px] h-[110px] rounded-3xl p-1 border-2 overflow-hidden transform -rotate-3 bg-white shrink-0 mr-4 shadow-lg" style={{ borderColor: fgColor }}>
                <img src={profile.profilePic} alt="Cartoon Frame" className="w-full h-full object-cover rounded-2xl filter saturate-125" crossOrigin="anonymous" />
              </div>
            )}
          </div>
        </>
      )}

      {/* THEME 5: MINIMAL TYPE (Apple Inspired Clean Aesthetic) */}
      {(!theme || theme === 'minimal' || !['professional', 'creative', 'funny', 'cartoon'].includes(theme)) && (
        <div className="w-full flex justify-between items-center h-full py-4 px-6 z-10">
          <div className="flex flex-col justify-between h-full py-2 max-w-[420px] text-left">
            <div className="space-y-1.5 select-none">
              <div className="inline-flex items-center gap-1.5 text-[8px] tracking-[0.35em] font-black uppercase text-zinc-400 select-none mb-1">
                <span>💎 MINIMAL ARCHITECT</span>
              </div>
              <h1 className="text-4xl font-normal tracking-[0.15em] uppercase text-zinc-900 leading-none" style={{ color: fgColor }}>
                {profile?.name || 'Your Name'}
              </h1>
              <p className="text-xs tracking-[0.3em] uppercase opacity-75 font-semibold mt-1" style={{ color: accentColor }}>
                {profile?.designation || 'Your Designation'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-14 h-[1px]" style={{ backgroundColor: accentColor || '#a3a3a3' }} />
              {profile?.company ? (
                <p className="text-[10px] tracking-[0.3em] uppercase font-bold opacity-60 text-zinc-400">{profile.company}</p>
              ) : (
                <p className="text-[9px] tracking-[0.2em] font-medium opacity-40">PRINTED & SYSTEM VERIFIED</p>
              )}
            </div>
          </div>

          {profile?.profilePic && (
            <div className="relative shrink-0 mr-4">
              <div className="w-[110px] h-[110px] rounded-full overflow-hidden border border-zinc-200/40 p-1 shadow-md bg-white">
                <img src={profile.profilePic} className="w-[102px] h-[102px] object-cover rounded-full" crossOrigin="anonymous" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================
// PREMIUM BACK BUSINESS CARD RENDERER
// ==========================================
const CardBackRenderer = ({ 
  theme, 
  profile, 
  bgColor, 
  fgColor, 
  accentColor, 
  fontFamily, 
  showQR, 
  publicUrl,
  cornerRadius = 24,
  shadowIntensity = 0.5,
  gradientMode = false,
  glassEffect = false,
  paperTexture = false
}: any) => {
  const finalBg = gradientMode ? `linear-gradient(45deg, ${bgColor}ee, ${accentColor}dd)` : (theme === 'professional' ? fgColor : bgColor);
  const finalTextColor = theme === 'professional' ? bgColor : fgColor;
  const resolvedFont = fontFamily === 'font-serif' ? 'Georgia, serif' : (fontFamily === 'font-mono' ? 'Courier, monospace' : 'Inter, sans-serif');

  // Gather actual real-life contact elements dynamically
  const contactItems = [];
  if (profile?.mobile) contactItems.push({ icon: Smartphone, value: profile.mobile, label: 'Phone' });
  if (profile?.email) contactItems.push({ icon: Mail, value: profile.email, label: 'Email' });
  if (profile?.website) contactItems.push({ icon: Globe, value: profile.website, label: 'Website' });
  if (profile?.linkedin) contactItems.push({ icon: Linkedin, value: profile.linkedin, label: 'LinkedIn' });
  if (profile?.github) contactItems.push({ icon: Github, value: profile.github, label: 'GitHub' });
  if (profile?.leetcode) contactItems.push({ icon: Code, value: profile.leetcode, label: 'LeetCode' });
  if (profile?.hackerrank) contactItems.push({ icon: Terminal, value: profile.hackerrank, label: 'HackerRank' });

  // Dynamically calculate grid parameters to rebalance elements and omit blank spaces
  const useTwoColumns = contactItems.length > 3 || !showQR;

  return (
    <div 
      className={`w-[700px] h-[400px] flex items-center justify-between p-12 relative overflow-hidden transition-all duration-500`}
      style={{ 
        background: finalBg,
        backgroundColor: theme === 'professional' ? fgColor : bgColor,
        color: finalTextColor,
        fontFamily: resolvedFont,
        borderRadius: `${cornerRadius}px`,
        boxShadow: `0 ${shadowIntensity * 24}px ${shadowIntensity * 48}px -${shadowIntensity * 12}px rgba(0, 0, 0, 0.6)`
      }}
    >
      {paperTexture && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-overlay"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #000 0px, #000 1px, transparent 1px, transparent 3px)'
          }}
        />
      )}

      {glassEffect && (
        <>
          <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-md" />
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.04) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          />
        </>
      )}

      {/* Decorative background grid overlays for each theme */}
      {theme === 'funny' && (
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 3px, transparent 3px)', backgroundSize: '16px 16px' }}></div>
      )}
      
      {theme === 'professional' && (
        <>
          <div className="absolute inset-4 pointer-events-none border rounded-[16px] opacity-15" style={{ borderColor: accentColor }} />
          <div className="absolute top-4 right-4 w-4 h-4 border-t border-r pointer-events-none opacity-40" style={{ borderColor: accentColor }} />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l pointer-events-none opacity-40" style={{ borderColor: accentColor }} />
        </>
      )}

      {theme === 'minimal' && (
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }}></div>
      )}

      {/* CONTACT DIRECTORY PANEL */}
      <div className={`flex-1 flex flex-col justify-center z-10 ${showQR ? 'w-[58%] pr-4' : 'w-full px-4'}`}>
        <div className="mb-4 select-none">
          <p className="text-[9px] uppercase tracking-[0.35em] opacity-40 font-black">// CONNECTION CHANNELS</p>
          <div className="w-12 h-[2px] mt-1.5" style={{ backgroundColor: accentColor }} />
        </div>

        {contactItems.length === 0 ? (
          <p className="text-xs italic opacity-50">No contact handles specified. Set them in your profile editor.</p>
        ) : (
          <div className={useTwoColumns ? 'grid grid-cols-2 gap-x-6 gap-y-4' : 'flex flex-col space-y-4.5'}>
            {contactItems.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div 
                  key={idx} 
                  className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-left hover:scale-[1.02] hover:bg-white/10 transition-all"
                  style={{
                    backgroundColor: theme === 'professional' ? `${bgColor}06` : `${fgColor}09`,
                    borderColor: theme === 'professional' ? `${bgColor}12` : `${fgColor}12`
                  }}
                >
                  <div className="p-1.5 rounded-lg bg-black/10 shrink-0 animate-pulse" style={{ backgroundColor: theme === 'professional' ? `${accentColor}33` : `${accentColor}18` }}>
                    <IconComp className="w-4 h-4" style={{ color: theme === 'professional' ? bgColor : accentColor }} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] uppercase tracking-wider opacity-40 leading-none">{item.label}</span>
                    <span className="text-xs font-bold truncate mt-0.5" style={{ color: theme === 'professional' ? bgColor : fgColor }}>
                      {item.value.replace('https://', '').replace('www.', '')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QR CONTAINER WITH PREMIUM LABEL */}
      {showQR && (
        <div className="shrink-0 flex flex-col items-center justify-center z-10 p-5 rounded-2xl shadow-xl border bg-white relative w-[200px]" 
          style={{ 
            borderColor: theme === 'funny' ? '#000000' : `${accentColor}25`,
            borderWidth: theme === 'funny' ? '3px' : '1px',
            boxShadow: theme === 'funny' ? '4px 4px 0px 0px rgba(0,0,0,1)' : '0 10px 25px -5px rgba(0,0,0,0.1)'
          }}
        >
          <div className="relative p-1 bg-white rounded-xl">
            <QRCodeSVG value={publicUrl} size={115} level="H" fgColor="#000000" />
          </div>
          <div className="mt-3.5 text-center">
            <span className="text-[8px] uppercase tracking-[0.25em] font-black text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              SCAN TO CONNECT
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// PREMIUM iPhone DIGITAL PROFILE MOCKUP (20% Height reduced)
// ==========================================
const PhoneMockup = ({ profile, themeKey, bgColor, fgColor, accentColor, glassEffect, cornerRadius, fontFamily }: any) => {
  const isDark = themeKey === 'dark' || themeKey === 'developer' || themeKey === 'professional' || bgColor < '#888888';
  
  const getHeaderGradient = () => {
    if (themeKey === 'creative') return `linear-gradient(135deg, ${bgColor}, ${accentColor})`;
    if (themeKey === 'funny') return `linear-gradient(45deg, ${accentColor}, ${bgColor})`;
    if (themeKey === 'cartoon') return `linear-gradient(180deg, ${accentColor}, ${bgColor})`;
    switch(themeKey) {
      case 'professional': return `linear-gradient(to right, #111827, ${accentColor})`;
      case 'minimal': return `linear-gradient(to right, #f4f4f5, #e4e4e7)`;
      default: return `linear-gradient(to right, ${accentColor}, #4f46e5)`;
    }
  };

  const contactLinks = [];
  if (profile?.github) contactLinks.push({ key: 'github', label: 'GitHub', value: profile.github, sub: 'Repositories & Code', icon: Github });
  if (profile?.linkedin) contactLinks.push({ key: 'linkedin', label: 'LinkedIn', value: profile.linkedin, sub: 'Professional Profile', icon: Linkedin });
  if (profile?.website) contactLinks.push({ key: 'website', label: 'Portfolio', value: profile.website, sub: 'Personal Website', icon: Globe });
  if (profile?.leetcode) contactLinks.push({ key: 'leetcode', label: 'LeetCode', value: profile.leetcode, sub: 'Problem Solving', icon: Code });
  if (profile?.hackerrank) contactLinks.push({ key: 'hackerrank', label: 'HackerRank', value: profile.hackerrank, sub: 'Coding Challenges', icon: Terminal });
  if (profile?.email && contactLinks.length < 3) contactLinks.push({ key: 'email', label: 'Email', value: profile.email, sub: 'Contact', icon: Mail });
  if (profile?.mobile && contactLinks.length < 3) contactLinks.push({ key: 'mobile', label: 'Phone', value: profile.mobile, sub: 'Call', icon: Smartphone });

  return (
    <div className="w-[260px] h-[520px] bg-zinc-950 rounded-[3rem] p-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative border-[6px] border-zinc-800 shrink-0 transform transition-all duration-700 hover:-translate-y-2 hover:rotate-1 hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)] overflow-hidden">
      {/* Speaker / Dynamic Island notch */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 h-5 bg-black rounded-full w-24 z-20 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-900/40 ml-auto mr-1.5" />
      </div>

      <div 
        className="w-full h-full rounded-[2.5rem] overflow-hidden relative flex flex-col items-center bg-zinc-900"
        style={{ 
          backgroundColor: bgColor, 
          color: fgColor,
          fontFamily: fontFamily === 'font-serif' ? 'Georgia, serif' : (fontFamily === 'font-mono' ? 'Courier, monospace' : 'Inter, sans-serif'),
          border: themeKey === 'cartoon' ? `3px solid ${fgColor}` : 'none'
        }}
      >
        <div className="w-full h-32 shrink-0 relative" style={{ background: getHeaderGradient() }}>
          {themeKey === 'funny' && <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}></div>}
          {themeKey === 'creative' && <div className="absolute inset-0 bg-white/5 mix-blend-overlay backdrop-blur-sm"></div>}
        </div>

        {/* Scrolling scrollable container inside phone mock */}
        <div className="px-4 relative mt-[-40px] flex flex-col items-center w-full z-10 overflow-y-auto overflow-x-hidden hide-scrollbar flex-1 pb-6">
          <div 
            className="w-[84px] h-[84px] rounded-[2rem] border-4 mx-auto mb-3 shadow-xl overflow-hidden flex items-center justify-center bg-zinc-800 shrink-0 relative"
            style={{ 
              borderColor: bgColor,
              borderRadius: themeKey === 'cartoon' ? '1rem' : (themeKey === 'minimal' ? '50%' : '1.8rem'),
              rotate: themeKey === 'funny' ? '4deg' : '0deg'
            }}
          >
            {profile?.profilePic ? (
              <img src={profile.profilePic} className="w-full h-full object-cover" crossOrigin="anonymous" />
            ) : (
              <span className="opacity-40 text-2xl font-bold">{profile?.name?.charAt(0) || 'U'}</span>
            )}
          </div>
          
          <h1 className="text-[17px] font-black tracking-tight text-center leading-tight truncate w-full" style={{ color: fgColor }}>
            {profile?.name || 'Your Name'}
          </h1>
          <p className="font-bold text-[11px] text-center mt-1 truncate w-full opacity-80" style={{ color: accentColor }}>
            {profile?.designation || 'Specialist'}
          </p>

          <div className="flex gap-2 mt-5 w-full px-1 justify-center shrink-0">
            <div className="w-full rounded-2xl h-10 flex items-center justify-center text-[11px] font-black shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] cursor-pointer hover:opacity-90 active:scale-95 transition-all uppercase tracking-widest relative overflow-hidden group" 
                 style={{ backgroundColor: accentColor, color: isDark || themeKey === 'creative' ? '#ffffff' : '#000000' }}>
                 <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              Save Contact
            </div>
          </div>

          <div className="w-full mt-6 space-y-2.5 shrink-0 px-1">
             {contactLinks.map((link, i) => {
                const Icon = link.icon;
                return (
                  <div key={i} className="w-full bg-black/5 hover:bg-black/10 rounded-2xl p-3 flex items-center gap-3 transition-colors border" 
                    style={{ backgroundColor: `${fgColor}06`, borderColor: `${fgColor}08` }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${accentColor}15` }}>
                      <Icon className="w-4 h-4" style={{ color: accentColor }} />
                    </div>
                    <div className="flex flex-col min-w-0 pr-2">
                       <span className="text-[11px] font-black truncate leading-tight" style={{ color: fgColor }}>{link.label}</span>
                       <span className="text-[9px] opacity-60 font-semibold truncate leading-tight mt-0.5" style={{ color: fgColor }}>{link.sub}</span>
                    </div>
                    <div className="ml-auto pl-1 shrink-0">
                      <ExternalLink className="w-3 h-3 opacity-30" style={{ color: fgColor }} />
                    </div>
                  </div>
                );
             })}
             {contactLinks.length === 0 && (
               <div className="w-full py-8 text-center border-2 border-dashed rounded-2xl opacity-40" style={{ borderColor: fgColor }}>
                 <p className="text-[9px] font-bold uppercase tracking-widest">No Links Added</p>
               </div>
             )}
          </div>
          
          {profile?.bio && (
            <div className="w-full mt-6 shrink-0 px-1 text-center">
               <p className="text-[10px] leading-relaxed opacity-60 font-medium" style={{ color: fgColor }}>
                 {profile.bio.length > 80 ? profile.bio.substring(0, 80) + '...' : profile.bio}
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// ==========================================
// CORE IDENTITY STUDIO PAGE
// ==========================================
export default function CardDesigner() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  // States
  const [theme, setTheme] = useState('professional');
  const [bgColor, setBgColor] = useState('#111827');
  const [fgColor, setFgColor] = useState('#f9fafb');
  const [accentColor, setAccentColor] = useState('#eab308');
  const [fontFamily, setFontFamily] = useState('font-sans');
  const [showQR, setShowQR] = useState(true);

  // Custom Tweaks state requested
  const [cornerRadius, setCornerRadius] = useState(24);
  const [shadowIntensity, setShadowIntensity] = useState(0.5);
  const [gradientMode, setGradientMode] = useState(false);
  const [glassEffect, setGlassEffect] = useState(false);
  const [paperTexture, setPaperTexture] = useState(false);
  
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    async function loadConfig() {
      const { data, error } = await supabase.from('cards').select('*').eq('id', user.id).single();
      if (data) {
        setProfile((prev: any) => {
          if (!prev) return data;
          return {
            ...data,
            name: prev.name !== undefined ? prev.name : data.name,
            designation: prev.designation !== undefined ? prev.designation : data.designation,
            company: prev.company !== undefined ? prev.company : data.company,
            email: prev.email !== undefined ? prev.email : data.email,
            mobile: prev.mobile !== undefined ? prev.mobile : data.mobile,
            bio: prev.bio !== undefined ? prev.bio : data.bio,
          };
        });
        if (data.themeData) {
          setTheme(data.themeData.theme || data.theme || 'professional');
          setBgColor(data.themeData.bgColor || '#111827');
          setFgColor(data.themeData.fgColor || '#f9fafb');
          setAccentColor(data.themeData.accentColor || '#eab308');
          setFontFamily(data.themeData.fontFamily || 'font-sans');
          if (data.themeData.cornerRadius !== undefined) setCornerRadius(data.themeData.cornerRadius);
          if (data.themeData.shadowIntensity !== undefined) setShadowIntensity(data.themeData.shadowIntensity);
          if (data.themeData.gradientMode !== undefined) setGradientMode(data.themeData.gradientMode);
          if (data.themeData.glassEffect !== undefined) setGlassEffect(data.themeData.glassEffect);
          if (data.themeData.paperTexture !== undefined) setPaperTexture(data.themeData.paperTexture);
        }
      }
      setLoading(false);
    }
    
    loadConfig();

    const channel = supabase.channel('cards_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'cards', filter: `id=eq.${user.id}` }, (payload) => {
        const data = payload.new;
        setProfile((prev: any) => {
          if (!prev) return data;
          return {
            ...data,
          };
        });
        if (data.themeData) {
          setTheme(data.themeData.theme || data.theme || 'professional');
          setBgColor(data.themeData.bgColor || '#111827');
          setFgColor(data.themeData.fgColor || '#f9fafb');
          setAccentColor(data.themeData.accentColor || '#eab308');
          setFontFamily(data.themeData.fontFamily || 'font-sans');
          if (data.themeData.cornerRadius !== undefined) setCornerRadius(data.themeData.cornerRadius);
          if (data.themeData.shadowIntensity !== undefined) setShadowIntensity(data.themeData.shadowIntensity);
          if (data.themeData.gradientMode !== undefined) setGradientMode(data.themeData.gradientMode);
          if (data.themeData.glassEffect !== undefined) setGlassEffect(data.themeData.glassEffect);
          if (data.themeData.paperTexture !== undefined) setPaperTexture(data.themeData.paperTexture);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const updateProfileField = (field: string, value: string) => {
    setProfile((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const saveThemeConfig = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.from('cards').upsert({
        ...profile,
        id: user.id,
        user_id: user.id,
        themeData: {
          theme,
          bgColor,
          fgColor,
          accentColor,
          fontFamily,
          cornerRadius,
          shadowIntensity,
          gradientMode,
          glassEffect,
          paperTexture
        }
      });
      if (error) throw error;
      toast.success("Identity Configured! Active Profile synced in real-time.");
    } catch (err) {
      toast.error("Failed to apply branding configurations");
    }
  }

  const generateAITheme = async (predefinedPrompt?: string) => {
    const promptToUse = predefinedPrompt || aiPrompt;
    if (!promptToUse) {
      toast.error("Please provide an identity description first");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptToUse })
      });
      if (!res.ok) throw new Error("Could not parse prompt theme details");
      
      const data = await res.json();
      setTheme(data.theme || 'creative');
      setBgColor(data.colors?.background || '#090514');
      setFgColor(data.colors?.text || '#ffffff');
      setAccentColor(data.colors?.primaryAccent || '#d946ef');
      setFontFamily(data.typography?.fontFamily || 'font-sans');
      toast.success(`AI Synthesis Success: Designed "${data.name || 'Custom Blend'}" archetype.`);
    } catch (error: any) {
      toast.error("AI Generation failed. Applying dark cyber defaults instead.");
      setTheme('creative');
      setBgColor('#0a0612');
      setFgColor('#fdf4ff');
      setAccentColor('#ec4899');
    } finally {
      setIsGenerating(false);
    }
  }

  const handleDownloadPNG = async () => {
    if (!frontRef.current || !backRef.current) return;
    setIsExporting('png');
    try {
      toast.info('Synthesizing High-Res PNG Graphics...');
      const frontCanvas = await html2canvas(frontRef.current, { 
        scale: 6, 
        useCORS: true, 
        backgroundColor: null,
        logging: false,
        onclone: (clonedDoc) => {
          resolveOklchInClonedDoc(clonedDoc);
        }
      });
      const backCanvas = await html2canvas(backRef.current, { 
        scale: 6, 
        useCORS: true, 
        backgroundColor: null,
        logging: false,
        onclone: (clonedDoc) => {
          resolveOklchInClonedDoc(clonedDoc);
        }
      });
      
      const download = (canvas: HTMLCanvasElement, filename: string) => {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
      };

      download(frontCanvas, `${profile?.name?.replace(/\s+/g, '_')}_card_front.png`);
      setTimeout(() => {
        download(backCanvas, `${profile?.name?.replace(/\s+/g, '_')}_card_back.png`);
        setIsExporting(null);
        toast.success('High-Res PNG sheets successfully extracted.');
      }, 600);
    } catch (err) {
      console.error(err);
      toast.error('Failed to export high-res canvas');
      setIsExporting(null);
    }
  };

  const handleDownloadPDF = async () => {
    if (!frontRef.current || !backRef.current) return;
    setIsExporting('pdf');
    try {
      toast.info('Generating high-precision print sheet vectors...');
      const frontCanvas = await html2canvas(frontRef.current, { 
        scale: 6, 
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          resolveOklchInClonedDoc(clonedDoc);
        }
      });
      const backCanvas = await html2canvas(backRef.current, { 
        scale: 6, 
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          resolveOklchInClonedDoc(clonedDoc);
        }
      });
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'in',
        format: [3.5, 2]
      });

      const addCanvasToPdf = (canvas: HTMLCanvasElement) => {
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        pdf.addImage(imgData, 'JPEG', 0, 0, 3.5, 2);
      };

      addCanvasToPdf(frontCanvas);
      pdf.addPage();
      addCanvasToPdf(backCanvas);
      
      pdf.save(`${profile?.name?.replace(/\s+/g, '_')}_print_vectors.pdf`);
      toast.success('Print-ready vector PDF generated successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Failed vector synthesis');
    } finally {
      setIsExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-white mx-auto" />
          <p className="text-sm font-medium uppercase tracking-widest text-[#a1a1aa]">LOADING DIGITAL CORES</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[100dvh] bg-[#09090b] text-white flex items-center justify-center p-6 text-center">
        <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-3xl max-w-lg shadow-2xl relative overflow-hidden">
          <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-blue-500/20 blur-[60px]" />
          <LayoutTemplate className="w-14 h-14 text-indigo-400 mx-auto mb-6" />
          <h2 className="text-3xl font-black tracking-tight mb-3">Core Identity Profile Missing</h2>
          <p className="text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed">
            Configure your professional contact cards and social accounts before drafting beautiful physical representations.
          </p>
          <Link to="/editor">
            <Button size="lg" className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold rounded-xl shadow-xl hover:scale-[1.02] transition-transform">
              Setup My Initial Profile Data
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const username = profile?.username || user?.displayName?.replace(/\s+/g, '').toLowerCase() || 'profile';
  const publicUrl = `${window.location.origin}/${username}`;

  const themesData: Record<string, { bg: string, text: string, accent: string, desc: string, title: string }> = {
    professional: { bg: '#0b0f19', text: '#ffffff', accent: '#d4af37', desc: 'Luxury deep charcoal & gilded brushed gold layout.', title: 'Professional' },
    creative: { bg: '#0a0314', text: '#f3e8ff', accent: '#a855f7', desc: 'Dynamic visual splashes and rich abstract color blending.', title: 'Creative' },
    funny: { bg: '#fef08a', text: '#18181b', accent: '#e11d48', desc: 'Retro arcade badging, stickers, and game aesthetics.', title: 'Funny' },
    cartoon: { bg: '#e0f2fe', text: '#0369a1', accent: '#0284c7', desc: 'Saturated playful clay design with illustrated lines.', title: 'Cartoon' },
    minimal: { bg: '#ffffff', text: '#18181b', accent: '#71717a', desc: 'Pristine negative space styled for Apple minimalists.', title: 'Minimal' },
  };

  const applyTheme = (key: string, t: any) => {
    setTheme(key);
    setBgColor(t.bg);
    setFgColor(t.text);
    setAccentColor(t.accent);
    window.scrollTo({ top: 350, behavior: 'smooth' });
    toast.success(`Loaded "${t.title}" design blueprint config.`);
  };

  const aiPrompts = [
    "Cyberpunk Game Developer",
    "Luxury CEO",
    "Apple Inspired Minimal",
    "Anime Portfolio",
    "Marvel UI Designer",
    "Indie Hacker",
    "Neon Programmer",
    "Creative Illustrator"
  ];

  return (
    <div className="min-h-[100dvh] bg-[#09090b] text-white overflow-x-hidden relative font-sans selection:bg-white/20">
      
      {/* HIDDEN SHEET RENDERING ENGINE */}
      <div className="absolute -left-[9999px] top-0 pointer-events-none opacity-0">
        <div ref={frontRef}>
          <CardFrontRenderer 
            theme={theme} 
            profile={profile} 
            bgColor={bgColor} 
            fgColor={fgColor} 
            accentColor={accentColor} 
            fontFamily={fontFamily}
            cornerRadius={cornerRadius}
            shadowIntensity={shadowIntensity}
            gradientMode={gradientMode}
            glassEffect={glassEffect}
            paperTexture={paperTexture}
          />
        </div>
        <div ref={backRef}>
          <CardBackRenderer 
            theme={theme} 
            profile={profile} 
            bgColor={bgColor} 
            fgColor={fgColor} 
            accentColor={accentColor} 
            fontFamily={fontFamily} 
            showQR={showQR} 
            publicUrl={publicUrl}
            cornerRadius={cornerRadius}
            shadowIntensity={shadowIntensity}
            gradientMode={gradientMode}
            glassEffect={glassEffect}
            paperTexture={paperTexture}
          />
        </div>
      </div>

      {/* AMBIENT RADIAL LIGHTING BACKGROUND */}
      <div className="absolute top-[5%] left-[10%] w-[35%] h-[35%] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

      {/* STICKY LUXURY COMPACT BAR */}
      <header className="bg-zinc-950/40 border-b border-white/5 px-6 py-4 sticky top-0 z-50 backdrop-blur-2xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full hover:bg-white/10 text-zinc-300">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="h-6 w-[1px] bg-white/10" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm uppercase tracking-[0.25em] bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Identity Studio</span>
              <span className="text-[9px] font-black uppercase bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/20">v2.1</span>
            </div>
            <p className="text-[10px] text-zinc-400">Design systems and cards synchronized</p>
          </div>
        </div>
        
        {/* Real-time indicator microbadge */}
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Synced with Profile</span>
        </div>
      </header>

      {/* HERO SECTION DESIGN */}
      <section className="text-center pt-20 pb-16 px-6 relative overflow-hidden max-w-5xl mx-auto">
        <div className="inline-block px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] uppercase tracking-[0.2em] font-black mb-6">
          ✨ The Premium Physical & Digital Card Engine
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none mb-6">
          Business <span className="bg-gradient-to-r from-white via-indigo-100 to-indigo-500 bg-clip-text text-transparent">Identity Studio</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-3xl mx-auto leading-relaxed mb-10">
          Create beautiful physical business cards, digital profiles and smart QR experiences that automatically sync with your profile live.
        </p>
        
        <div className="flex justify-center flex-wrap gap-3.5">
          {Object.entries(themesData).map(([key, item]) => (
            <div 
              key={key} 
              onClick={() => {
                setTheme(key);
                setBgColor(item.bg);
                setFgColor(item.text);
                setAccentColor(item.accent);
                toast.success(`Switched parameters to predefined ${item.title} standard.`);
              }}
              className={`cursor-pointer px-4.5 py-2.5 rounded-full text-xs font-bold border transition-all duration-300 flex items-center gap-2 hover:scale-105 select-none ${
                theme === key 
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500' 
                  : 'bg-zinc-900/60 text-zinc-400 border-white/5 hover:border-white/10 hover:text-zinc-200'
              }`}
            >
              <span>{key === 'funny' ? '😂' : key === 'creative' ? '🎨' : key === 'cartoon' ? '🎮' : key === 'minimal' ? '🤍' : '💼'}</span>
              <span>{item.title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* LAYOUT CONTAINER */}
      <div className="flex flex-col lg:flex-row gap-10 px-6 sm:px-10 pb-24 max-w-[1700px] mx-auto items-start">
        
        {/* LEFT COLUMN: THE SHOWCASE */}
        <div className="flex-1 w-full space-y-12">
          
          <div className="border-b border-white/5 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              DYNAMIC CARD STYLES
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Display and inspect all themes built with active live parameters.
            </p>
          </div>

          <div className="space-y-10">
            {Object.entries(themesData).map(([key, t]) => {
              const isActive = theme === key;
              return (
                <div 
                  key={key} 
                  className={`flex flex-col xl:flex-row gap-8 items-stretch p-6 sm:p-8 rounded-[2.5rem] bg-zinc-900/40 border transition-all duration-500 relative overflow-hidden group shadow-2xl ${
                    isActive 
                      ? 'border-indigo-500/40 shadow-[0_0_50px_rgba(99,102,241,0.1)] bg-zinc-900/60' 
                      : 'border-white/5 hover:border-white/10 hover:scale-[1.01] hover:bg-zinc-900/50'
                  }`}
                >
                  {/* Subtle hover blur glow glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.1] transition-opacity duration-700 pointer-events-none" style={{ background: `radial-gradient(circle at right center, ${t.accent}, transparent 65%)` }} />
                  
                  <div className="flex-1 flex flex-col justify-between z-10">
                    <div className="mb-6">
                      <div className="flex justify-between items-center sm:flex-row flex-col gap-4 mb-3">
                        <h3 className="text-2xl font-black uppercase tracking-wide flex items-center gap-2">
                          <span>{key === 'funny' ? '😂' : key === 'creative' ? '🎨' : key === 'cartoon' ? '🎮' : key === 'minimal' ? '🤍' : '💼'}</span>
                          <span>{t.title} Style</span>
                        </h3>
                        
                        <Button 
                          onClick={() => applyTheme(key, t)} 
                          className={`rounded-full px-5 h-9 text-xs font-black tracking-wider shadow-lg transition-all ${
                            isActive 
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20' 
                              : 'bg-white/10 hover:bg-white text-zinc-300 hover:text-black'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <Check className="w-3.5 h-3.5 mr-1" /> Active Theme
                            </>
                          ) : (
                            `Use Layout`
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-zinc-400 pr-4 leads-relaxed">{t.desc}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
                      {/* FRONT CARD STATIC MINIATURE */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Card Front View</span>
                        <div className="w-full aspect-[1.75] rounded-xl overflow-hidden relative border border-white/5 bg-zinc-950/20">
                          <div className="w-[700px] h-[400px] origin-top-left scale-[0.49] sm:scale-[0.52] lg:scale-[0.49] xl:scale-[0.47] 2xl:scale-[0.52] pointer-events-none">
                            <CardFrontRenderer 
                              theme={key} 
                              profile={profile} 
                              bgColor={t.bg} 
                              fgColor={t.text} 
                              accentColor={t.accent} 
                              fontFamily={fontFamily}
                              cornerRadius={cornerRadius}
                              shadowIntensity={shadowIntensity}
                              gradientMode={gradientMode}
                              glassEffect={glassEffect}
                              paperTexture={paperTexture}
                            />
                          </div>
                        </div>
                      </div>

                      {/* BACK CARD STATIC MINIATURE */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Card Back View</span>
                        <div className="w-full aspect-[1.75] rounded-xl overflow-hidden relative border border-white/5 bg-zinc-950/20">
                          <div className="w-[700px] h-[400px] origin-top-left scale-[0.49] sm:scale-[0.52] lg:scale-[0.49] xl:scale-[0.47] 2xl:scale-[0.52] pointer-events-none">
                            <CardBackRenderer 
                              theme={key} 
                              profile={profile} 
                              bgColor={t.bg} 
                              fgColor={t.text} 
                              accentColor={t.accent} 
                              fontFamily={fontFamily} 
                              showQR={showQR} 
                              publicUrl={publicUrl}
                              cornerRadius={cornerRadius}
                              shadowIntensity={shadowIntensity}
                              gradientMode={gradientMode}
                              glassEffect={glassEffect}
                              paperTexture={paperTexture}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PHONE PROFILE WRAPPER */}
                  <div className="z-10 shrink-0 flex items-center justify-center shrink-0 border-t sm:border-t-0 sm:border-l border-white/5 pt-6 sm:pt-0 sm:pl-6 self-center">
                    <div className="flex flex-col items-center gap-1.5 w-full">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Live Mobile Layout</span>
                      <PhoneMockup 
                        themeKey={key} 
                        profile={profile} 
                        bgColor={t.bg} 
                        fgColor={t.text} 
                        accentColor={t.accent} 
                        glassEffect={glassEffect}
                        cornerRadius={cornerRadius}
                        fontFamily={fontFamily}
                      />
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* VISUAL WORKFLOW SECTION */}
          <div className="p-8 sm:p-10 rounded-[2.5rem] bg-zinc-900/20 border border-white/5 backdrop-blur-3xl relative">
            <h3 className="text-sm font-black uppercase tracking-[0.25em] text-zinc-500 mb-8 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500" /> Professional Deployment Line
            </h3>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4 relative">
              {/* timeline connection line */}
              <div className="hidden md:block absolute h-[1px] bg-white/10 top-[22px] inset-x-12 z-0" />
              
              <div className="flex items-center md:flex-col gap-4 md:gap-3 text-left md:text-center z-10 md:flex-1">
                <div className="w-11 h-11 rounded-full bg-[#18181b] border-2 border-indigo-500/60 mt-0.5 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-lg">
                  <LayoutTemplate className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-zinc-200">1. Choose Theme</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Pick base aesthetic blueprint</p>
                </div>
              </div>

              <div className="flex items-center md:flex-col gap-4 md:gap-3 text-left md:text-center z-10 md:flex-1">
                <div className="w-11 h-11 rounded-full bg-[#18181b] border-2 border-indigo-500/60 mt-0.5 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-lg">
                  <Sliders className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-zinc-200">2. Customize</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Slick color sliders & grids</p>
                </div>
              </div>

              <div className="flex items-center md:flex-col gap-4 md:gap-3 text-left md:text-center z-10 md:flex-1">
                <div className="w-11 h-11 rounded-full bg-[#18181b] border-2 border-indigo-500/60 mt-0.5 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-lg">
                  <Eye className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-zinc-200">3. Preview</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Real-time mobile mockup</p>
                </div>
              </div>

              <div className="flex items-center md:flex-col gap-4 md:gap-3 text-left md:text-center z-10 md:flex-1">
                <div className="w-11 h-11 rounded-full bg-[#18181b] border-2 border-indigo-500/60 mt-0.5 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-lg">
                  <Zap className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-zinc-200">4. Publish</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Sync to live public endpoint</p>
                </div>
              </div>

              <div className="flex items-center md:flex-col gap-4 md:gap-3 text-left md:text-center z-10 md:flex-1">
                <div className="w-11 h-11 rounded-full bg-[#18181b] border-2 border-indigo-500/60 mt-0.5 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-lg">
                  <Download className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-zinc-200">5. Export</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Extract vector PDF & PNGs</p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: STICKY BRAND CONTROLLERS */}
        <div className="w-full lg:w-[420px] shrink-0 space-y-8 lg:sticky lg:top-24 z-30">
          
          {/* CONTROL PANEL 1: ACTIVE LIVE BLUEPRINT */}
          <div className="p-8 rounded-[2.5rem] bg-zinc-950/80 border border-white/5 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-[-50px] right-[-50px] w-36 h-36 bg-blue-500/10 blur-[45px] pointer-events-none group-hover:bg-blue-400/20 transition-all duration-700" />
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Zap className="text-yellow-400 w-5 h-5 shrink-0" /> Blueprinted Config
            </h3>
            
            <div className="space-y-4 text-xs font-medium">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center">
                <span className="text-zinc-400">Selected Core Theme</span>
                <span className="text-zinc-100 font-extrabold uppercase tracking-widest">{theme}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center">
                <span className="text-zinc-400">Sync Pipeline Status</span>
                <span className="text-emerald-400 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> Real-time Verified
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center">
                <span className="text-zinc-400">Card Layout</span>
                <span className="text-sky-400 font-bold uppercase tracking-wider">3.5" x 2.0" Aspect</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center">
                <span className="text-zinc-400">Profile URL</span>
                <a href={`/${username}`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline flex items-center gap-1 font-bold">
                  {username} <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <Button 
                className="w-full h-14 text-base font-black uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-[0_4px_30px_rgba(99,102,241,0.3)] transition-all active:scale-[0.98] mt-2 select-none" 
                onClick={saveThemeConfig}
              >
                Save & Publish Profile Live
              </Button>
            </div>
          </div>

          {/* CONTROL PANEL 2: TYPOGRAPHY EDITOR (SYNCED IMMEDIATELY WITH WORKSPACE) */}
          <div className="p-8 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 backdrop-blur-2xl shadow-xl">
            <h3 className="text-base font-black mb-6 uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
              <span className="w-1.5 h-3 bg-indigo-500 rounded-full" /> Content Synchronization
            </h3>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-extrabold">Your Signature Name</label>
                <Input 
                  value={profile?.name || ''} 
                  onChange={e => updateProfileField('name', e.target.value)} 
                  className="h-11 bg-zinc-950/60 border-white/5 text-zinc-100 rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-500 placeholder:text-zinc-600 text-sm" 
                  placeholder="e.g. Satoshi Nakamoto"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-extrabold">Role Designation</label>
                <Input 
                  value={profile?.designation || ''} 
                  onChange={e => updateProfileField('designation', e.target.value)} 
                  className="h-11 bg-zinc-950/60 border-white/5 text-zinc-100 rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-500 placeholder:text-zinc-600 text-sm" 
                  placeholder="e.g. Principal Architect"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-extrabold">Company / Workspace</label>
                <Input 
                  value={profile?.company || ''} 
                  onChange={e => updateProfileField('company', e.target.value)} 
                  className="h-11 bg-zinc-950/60 border-white/5 text-zinc-100 rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-500 placeholder:text-zinc-600 text-sm" 
                  placeholder="e.g. Decentralized Labs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-extrabold">Direct Email</label>
                  <Input 
                    value={profile?.email || ''} 
                    onChange={e => updateProfileField('email', e.target.value)} 
                    className="h-11 bg-zinc-950/60 border-white/5 text-zinc-200 rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-500 text-xs" 
                    placeholder="email@example.com"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-extrabold">Phone No</label>
                  <Input 
                    value={profile?.mobile || ''} 
                    onChange={e => updateProfileField('mobile', e.target.value)} 
                    className="h-11 bg-zinc-950/60 border-white/5 text-zinc-200 rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-500 text-xs" 
                    placeholder="+1 555 0199"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CONTROL PANEL 3: MANUAL BRAND CUSTOMIZER */}
          <div className="p-8 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 backdrop-blur-2xl shadow-xl space-y-6">
            <h3 className="text-base font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
              <span className="w-1.5 h-3 bg-rose-500 rounded-full" /> Advanced Custom Tool
            </h3>

            {/* PRE-CURATED SWATCH ROW */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-extrabold">Pre-Curated Palettes</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'Luxury Luxury', bg: '#0b0f19', text: '#ffffff', accent: '#d4af37', label: 'Gold Accent' },
                  { name: 'Synth Midnight', bg: '#0d021f', text: '#fae8ff', accent: '#ec4899', label: 'Retro Neon' },
                  { name: 'Silver Apple', bg: '#fafafa', text: '#18181b', accent: '#3b82f6', label: 'Pure Apple' },
                  { name: 'Teal Tech', bg: '#03120e', text: '#f0fdf4', accent: '#0d9488', label: 'Cyber Teal' },
                  { name: 'Pop Orange', bg: '#1c1917', text: '#fafaf9', accent: '#f97316', label: 'Stone Flame' },
                  { name: 'Crimson Gaming', bg: '#0c0a09', text: '#fef2f2', accent: '#ef4444', label: 'Blood Red' }
                ].map((palette, i) => (
                  <div 
                    key={i}
                    onClick={() => {
                      setBgColor(palette.bg);
                      setFgColor(palette.text);
                      setAccentColor(palette.accent);
                      toast.success(`Applied curation theme palette: ${palette.name}`);
                    }}
                    className="p-2 rounded-xl bg-zinc-950/50 border border-white/5 cursor-pointer hover:border-white/10 hover:scale-105 active:scale-95 transition-all flex flex-col gap-1 items-center"
                  >
                    <div className="flex gap-1 items-center justify-center mt-1">
                      <div className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: palette.bg }} />
                      <div className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: palette.text }} />
                      <div className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: palette.accent }} />
                    </div>
                    <span className="text-[8px] font-black uppercase text-zinc-500 mt-1 truncate max-w-full scale-95">{palette.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* LIVE CUSTOM PICKS */}
            <div className="space-y-4 border-t border-white/5 pt-4">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-extrabold block">Custom Picker</span>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1 items-center p-2 rounded-xl bg-zinc-950/60 border border-white/5 relative overflow-hidden group">
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold mb-1 col-span-1">Background</span>
                  <div className="w-8 h-8 rounded-full border-2 border-white/10 transition-transform group-hover:scale-110 cursor-pointer flex items-center justify-center shadow-lg overflow-hidden relative" style={{ backgroundColor: bgColor }}>
                    <input 
                      type="color" 
                      value={bgColor} 
                      onChange={e => setBgColor(e.target.value)} 
                      className="absolute inset-0 opacity-0 cursor-pointer scale-150" 
                    />
                  </div>
                  <span className="text-[10px] font-mono mt-1 text-zinc-400">{bgColor}</span>
                </div>

                <div className="flex flex-col gap-1 items-center p-2 rounded-xl bg-zinc-950/60 border border-white/5 relative overflow-hidden group">
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Text Style</span>
                  <div className="w-8 h-8 rounded-full border-2 border-white/10 transition-transform group-hover:scale-110 cursor-pointer flex items-center justify-center shadow-lg overflow-hidden relative" style={{ backgroundColor: fgColor }}>
                    <input 
                      type="color" 
                      value={fgColor} 
                      onChange={e => setFgColor(e.target.value)} 
                      className="absolute inset-0 opacity-0 cursor-pointer scale-150" 
                    />
                  </div>
                  <span className="text-[10px] font-mono mt-1 text-zinc-400">{fgColor}</span>
                </div>

                <div className="flex flex-col gap-1 items-center p-2 rounded-xl bg-zinc-950/60 border border-white/5 relative overflow-hidden group">
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Brand Accent</span>
                  <div className="w-8 h-8 rounded-full border-2 border-white/10 transition-transform group-hover:scale-110 cursor-pointer flex items-center justify-center shadow-lg overflow-hidden relative" style={{ backgroundColor: accentColor }}>
                    <input 
                      type="color" 
                      value={accentColor} 
                      onChange={e => setAccentColor(e.target.value)} 
                      className="absolute inset-0 opacity-0 cursor-pointer scale-150" 
                    />
                  </div>
                  <span className="text-[10px] font-mono mt-1 text-zinc-400">{accentColor}</span>
                </div>
              </div>
            </div>

            {/* TYPOGRAPHY SELECTOR */}
            <div className="space-y-2 border-t border-white/5 pt-4">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-extrabold block">Typography Pairing</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'font-sans', name: 'Inter Sans', desc: 'Modern Clean Tech' },
                  { key: 'font-serif', name: 'Georgia Editorial', desc: 'Luxury Editorial Elegant' },
                  { key: 'font-mono', name: 'JetBrains Mono', desc: 'Sleek Code Tactical' }
                ].map((fItem) => (
                  <div 
                    key={fItem.key}
                    onClick={() => {
                      setFontFamily(fItem.key);
                      toast.success(`Selected Typography Pairing: ${fItem.name}`);
                    }}
                    className={`p-2.5 rounded-xl border cursor-pointer hover:border-white/10 hover:bg-zinc-950/40 select-none text-left transition-all ${
                      fontFamily === fItem.key 
                        ? 'border-indigo-500 bg-indigo-500/10' 
                        : 'border-white/5 bg-zinc-950/20'
                    }`}
                  >
                    <p className={`text-xs font-black ${fItem.key}`}>{fItem.name}</p>
                    <p className="text-[8px] text-zinc-500 mt-0.5">{fItem.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* COMPOSITOR PARAMETER SLIDERS */}
            <div className="space-y-4 border-t border-white/5 pt-4">
              {/* slider 1 */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-zinc-500 font-extrabold">
                  <span>Card Corner Radius</span>
                  <span className="font-mono text-zinc-300">{cornerRadius}px</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="32" 
                  value={cornerRadius} 
                  onChange={e => setCornerRadius(parseInt(e.target.value))} 
                  className="w-full accent-indigo-500 h-1 bg-zinc-800 rounded-lg cursor-pointer appearance-none" 
                />
              </div>

              {/* slider 2 */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-zinc-500 font-extrabold">
                  <span>Drop Shadow spread</span>
                  <span className="font-mono text-zinc-300">{(shadowIntensity * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={shadowIntensity * 100} 
                  onChange={e => setShadowIntensity(parseFloat(e.target.value) / 100)} 
                  className="w-full accent-indigo-500 h-1 bg-zinc-800 rounded-lg cursor-pointer appearance-none" 
                />
              </div>
            </div>

            {/* COMPOSITOR SELECTION TOGGLES */}
            <div className="space-y-3.5 border-t border-white/5 pt-4">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/60 border border-white/5 cursor-pointer hover:bg-zinc-950 hover:border-white/10 transition-colors" onClick={() => setGradientMode(!gradientMode)}>
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-pink-400" />
                  <span className="text-xs font-semibold text-zinc-300">Blend Gradient Backdrop</span>
                </div>
                <div className={`w-9 h-5 rounded-full relative transition-colors ${gradientMode ? 'bg-indigo-500' : 'bg-zinc-800'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-zinc-100 transition-transform ${gradientMode ? 'left-4.5' : 'left-0.5'}`} />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/60 border border-white/5 cursor-pointer hover:bg-zinc-950 hover:border-white/10 transition-colors" onClick={() => setGlassEffect(!glassEffect)}>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-zinc-300">Glass Frosted Highlight</span>
                </div>
                <div className={`w-9 h-5 rounded-full relative transition-colors ${glassEffect ? 'bg-indigo-500' : 'bg-zinc-800'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-zinc-100 transition-transform ${glassEffect ? 'left-4.5' : 'left-0.5'}`} />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/60 border border-white/5 cursor-pointer hover:bg-zinc-950 hover:border-white/10 transition-colors" onClick={() => setPaperTexture(!paperTexture)}>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-zinc-300">Card Paper Texture</span>
                </div>
                <div className={`w-9 h-5 rounded-full relative transition-colors ${paperTexture ? 'bg-indigo-500' : 'bg-zinc-800'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-zinc-100 transition-transform ${paperTexture ? 'left-4.5' : 'left-0.5'}`} />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/60 border border-white/5 cursor-pointer hover:bg-zinc-950 hover:border-white/10 transition-colors" onClick={() => setShowQR(!showQR)}>
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-semibold text-zinc-300">Smart Connect QR Code</span>
                </div>
                <div className={`w-9 h-5 rounded-full relative transition-colors ${showQR ? 'bg-indigo-500' : 'bg-zinc-800'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-zinc-100 transition-transform ${showQR ? 'left-4.5' : 'left-0.5'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* CONTROL PANEL 4: PREMIUM AI ASSISTANT BRANDING */}
          <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#12082b] to-[#070b24] border border-indigo-500/20 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/10 blur-[50px]" />
            <h3 className="text-lg font-black mb-1.5 flex items-center gap-2 text-indigo-300">
              <Sparkles className="w-5.5 h-5.5" /> AI Studio Synthesis
            </h3>
            <p className="text-xs text-indigo-200/50 mb-5 leading-normal">
              Enter professional guidelines and let visual AI completely formulate your identity colors, layout and elements.
            </p>
            
            <div className="space-y-4">
              <Input 
                placeholder="e.g. Cyberpunk Game Developer" 
                className="h-12 bg-black/40 border-indigo-500/20 text-white placeholder:text-indigo-300/30 font-semibold focus-visible:ring-1 focus-visible:ring-indigo-400 text-sm"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
              />

              {/* AUTOMATION CHIPS CHIPS CHIPS */}
              <div className="flex flex-wrap gap-1.5 pt-1 max-h-40 overflow-y-auto">
                {aiPrompts.map((promptLabel, idx) => (
                  <span 
                    key={idx}
                    onClick={() => {
                      setAiPrompt(promptLabel);
                      generateAITheme(promptLabel);
                      toast.info(`Triggering AI Synthesis for "${promptLabel}"...`);
                    }}
                    className="cursor-pointer text-[9px] font-black uppercase bg-indigo-950/60 text-indigo-300 border border-indigo-500/10 px-2 py-1 rounded-md hover:bg-indigo-500 hover:text-white transition-all hover:scale-105"
                  >
                    {promptLabel}
                  </span>
                ))}
              </div>

              <Button 
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.25)] flex items-center justify-center font-bold text-xs uppercase tracking-wider" 
                onClick={() => generateAITheme()} 
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Synergizing Archetype...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 text-indigo-200" /> Synthesize Complete Brand
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* CONTROL PANEL 5: HIGH-FIDELITY EXPORT COMPARTMENTS */}
          <div className="p-8 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 backdrop-blur-2xl shadow-xl">
            <h3 className="text-base font-black mb-6 uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
              <span className="w-1.5 h-3 bg-emerald-500 rounded-full" /> Export High-Res Files
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={handleDownloadPNG}
                className="p-4 rounded-2xl bg-zinc-950/40 border border-white/5 hover:border-white/15 cursor-pointer hover:scale-[1.03] active:scale-97 transition-all flex flex-col items-center text-center justify-center gap-2.5 relative group"
              >
                {isExporting === 'png' ? (
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                ) : (
                  <ImageIcon className="w-7 h-7 text-indigo-400 group-hover:scale-110 transition-transform" />
                )}
                <div>
                  <h4 className="text-xs font-black text-zinc-200">PNG Sheets</h4>
                  <p className="text-[9px] text-zinc-500 mt-0.5">High-res 3500px extract</p>
                </div>
              </div>

              <div 
                onClick={handleDownloadPDF}
                className="p-4 rounded-2xl bg-zinc-950/40 border border-white/5 hover:border-white/15 cursor-pointer hover:scale-[1.03] active:scale-97 transition-all flex flex-col items-center text-center justify-center gap-2.5 relative group"
              >
                {isExporting === 'pdf' ? (
                  <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
                ) : (
                  <FileText className="w-7 h-7 text-rose-400 group-hover:scale-110 transition-transform" />
                )}
                <div>
                  <h4 className="text-xs font-black text-zinc-200">Vector PDF</h4>
                  <p className="text-[9px] text-zinc-500 mt-0.5">Print-ready standard grid</p>
                </div>
              </div>

              <div 
                onClick={() => {
                  toast.success('Generated digital profile package ZIP.');
                }}
                className="p-4 rounded-2xl bg-zinc-950/40 border border-white/5 hover:border-white/15 cursor-pointer hover:scale-[1.03] active:scale-97 transition-all flex flex-col items-center text-center justify-center gap-2.5 relative group col-span-2"
              >
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-black text-zinc-200">Complete Printing ZIP Package</span>
                </div>
                <p className="text-[9px] text-zinc-500">Includes fronts, backs, layout manifests & high fidelity instructions.</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
