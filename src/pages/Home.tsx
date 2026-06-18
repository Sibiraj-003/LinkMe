import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, ScanLine, LayoutTemplate, Share2, Layers, Smartphone, Github, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col relative overflow-hidden font-sans selection:bg-white/30">
      
      {/* Dynamic Ambient Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-violet-500/5 blur-[180px] rounded-full mix-blend-screen" />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0 pointer-events-none" />

      <header className="py-6 px-6 lg:px-10 max-w-[1400px] mx-auto w-full flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-tr from-zinc-800 to-zinc-900 flex items-center justify-center border border-white/10 shadow-xl transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:-translate-y-0.5">
             <div className="w-4 h-4 rounded-[4px] bg-white group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white group-hover:text-white/90 transition-colors">Identity</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-6">
          <Link to="/login" className="hidden sm:block">
            <span className="text-[13px] font-medium text-zinc-400 hover:text-white transition-colors">Sign in</span>
          </Link>
          <Link to="/login">
            <Button className="rounded-full px-5 h-9 bg-white text-black hover:bg-zinc-200 font-medium text-[13px] tracking-tight transition-all active:scale-95 border border-white">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start px-6 pt-24 pb-32 relative z-10 w-full max-w-[1200px] mx-auto text-center">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[12px] font-medium text-zinc-300">Identity Platform 2.0 is now available</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-6xl sm:text-7xl md:text-[90px] font-medium tracking-[-0.04em] max-w-[1000px] leading-[0.95] text-white selection:bg-white/20"
        >
          The standard for <br className="hidden sm:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">digital identity.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-8 text-[18px] md:text-[21px] text-zinc-400 max-w-2xl leading-[1.4] font-normal"
        >
          Craft premium physical business cards, smart QR experiences, and a unified digital presence. Built for the modern professional.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-12 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link to="/login" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto rounded-full h-14 px-8 text-[15px] font-medium bg-white hover:bg-zinc-100 text-black border-0 shadow-[0_0_40px_8px_rgba(255,255,255,0.15)] gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]">
              Start building your identity <ArrowRight className="w-4 h-4 ml-1 opacity-70 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full text-left"
        >
          <motion.div variants={itemVariants} className="p-8 rounded-[24px] bg-zinc-900/40 border border-white/[0.05] hover:bg-zinc-900/80 transition-all duration-500 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-12 h-12 rounded-[16px] bg-zinc-800 border border-white/10 flex items-center justify-center mb-8 shadow-sm group-hover:scale-105 transition-transform duration-500">
              <LayoutTemplate className="w-5 h-5 text-white/80" />
            </div>
            <h3 className="text-xl font-medium text-white mb-3">Premium Architecture</h3>
            <p className="text-[#a1a1aa] leading-[1.6] text-[15px] font-normal">Choose from meticulously crafted templates designed by industry experts. Fully responsive.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="p-8 rounded-[24px] bg-zinc-900/40 border border-white/[0.05] hover:bg-zinc-900/80 transition-all duration-500 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-12 h-12 rounded-[16px] bg-zinc-800 border border-white/10 flex items-center justify-center mb-8 shadow-sm group-hover:scale-105 transition-transform duration-500">
              <ScanLine className="w-5 h-5 text-white/80" />
            </div>
            <h3 className="text-xl font-medium text-white mb-3">Print Intelligence</h3>
            <p className="text-[#a1a1aa] leading-[1.6] text-[15px] font-normal">Export high-fidelity, print-ready PDFs with automatic bleed margins and CMYK profile support.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="p-8 rounded-[24px] bg-zinc-900/40 border border-white/[0.05] hover:bg-zinc-900/80 transition-all duration-500 overflow-hidden relative group md:col-span-2 lg:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-12 h-12 rounded-[16px] bg-zinc-800 border border-white/10 flex items-center justify-center mb-8 shadow-sm group-hover:scale-105 transition-transform duration-500">
              <Share2 className="w-5 h-5 text-white/80" />
            </div>
            <h3 className="text-xl font-medium text-white mb-3">Unified Ecosystem</h3>
            <p className="text-[#a1a1aa] leading-[1.6] text-[15px] font-normal">Centralize your GitHub, LinkedIn, portfolios and resumes into one elegantly composed destination.</p>
          </motion.div>
        </motion.div>

        {/* Bento Grid Preview Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mt-32 w-full max-w-[1200px] border border-white/10 rounded-[32px] bg-zinc-900/20 backdrop-blur-3xl overflow-hidden flex flex-col md:flex-row relative"
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 via-transparent to-black/40 pointer-events-none" />
          
          <div className="flex-1 p-12 md:p-16 flex flex-col justify-center text-left relative z-10 border-b md:border-b-0 md:border-r border-white/10">
            <div className="w-12 h-12 rounded-[16px] bg-white text-black flex items-center justify-center mb-6 shadow-xl">
              <Smartphone className="w-6 h-6" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-white mb-4">Your pocket portfolio.</h2>
            <p className="text-zinc-400 text-[17px] leading-[1.6] mb-8 font-normal max-w-md">
              A meticulously designed mobile experience that acts as your living resume. Shareable via QR code in a single tap.
            </p>
            <ul className="space-y-4">
              {['Lightning fast loading', 'Customizable typography', 'Real-time synchronization'].map((feat, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <span className="text-zinc-300 text-[15px]">{feat}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-8 relative z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_100%)] min-h-[400px]">
            {/* Mockup Card */}
            <div className="w-[280px] h-[500px] bg-[#09090b] rounded-[32px] border border-zinc-800 shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative flex flex-col overflow-hidden rotate-[-2deg] hover:rotate-0 transition-transform duration-700">
              <div className="absolute top-0 inset-x-0 h-40 bg-zinc-900/50" />
              <div className="px-6 pt-24 pb-6 flex flex-col items-center flex-1 z-10">
                <div className="w-20 h-20 rounded-2xl bg-zinc-800 border-2 border-zinc-700 mb-4 shadow-xl flex items-center justify-center text-zinc-500 font-medium text-xs">Photo</div>
                <div className="h-5 w-32 bg-zinc-800 rounded-md mb-2" />
                <div className="h-3 w-24 bg-zinc-800/60 rounded-md mb-8" />
                
                <div className="w-full space-y-3 mb-6">
                  <div className="h-[46px] w-full bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-xl" />
                  <div className="h-[46px] w-full bg-zinc-800/40 rounded-xl" />
                </div>

                <div className="mt-auto w-full flex justify-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-800" />
                  <div className="w-10 h-10 rounded-full bg-zinc-800" />
                  <div className="w-10 h-10 rounded-full bg-zinc-800" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </main>

      <footer className="border-t border-white/10 py-12 px-6 w-full relative z-10 bg-black">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-80">
            <div className="w-6 h-6 rounded-[8px] bg-zinc-800 flex items-center justify-center border border-white/10">
              <div className="w-2 h-2 rounded-[2px] bg-white" />
            </div>
            <span className="font-medium text-[14px] tracking-tight text-white">Identity</span>
          </div>
          <div className="flex items-center gap-6 text-[13px] text-zinc-500 font-medium">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
