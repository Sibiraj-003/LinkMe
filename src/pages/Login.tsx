import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Layers, Sparkles, Loader2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const { user, signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }
    
    try {
      setLoading(true);
      if (isSignUp) {
        await signUp(email, password);
        toast.success('Account created successfully! You can now log in.');
        setIsSignUp(false);
      } else {
        await signIn(email, password);
        toast.success('Successfully logged in!');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-white/20 selection:text-white">
      
      {/* Premium Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[130px]" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/10 blur-[120px]" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] shadow-2xl rounded-[32px] overflow-hidden">
           
           <div className="p-10 pb-8 text-center relative border-b border-white border-opacity-5">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="w-16 h-16 rounded-[18px] bg-indigo-500/10 flex items-center justify-center mx-auto mb-6 shadow-inner border border-indigo-500/20 relative">
                 <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-indigo-500/20 to-transparent rounded-b-[18px]" />
                 <KeyRound className="w-8 h-8 text-indigo-400 relative z-10" />
              </div>
              <h2 className="text-2xl font-medium tracking-tight text-white mb-2 pb-0.5">
                {isSignUp ? 'Create Workspace' : 'Sign in to Workspace'}
              </h2>
              <p className="text-[14px] text-zinc-400 font-medium">
                {isSignUp ? 'Establish your digital presence today.' : 'Welcome back to your identity hub.'}
              </p>
           </div>
           
           <div className="p-8 pt-6">
              <form onSubmit={handleAuth} className="space-y-5">
                 <div className="space-y-2">
                   <Label htmlFor="email" className="text-[12px] font-medium text-zinc-400 uppercase tracking-widest ml-1">Email Address</Label>
                   <Input
                     id="email"
                     type="email"
                     placeholder="you@domain.com"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                     className="h-14 bg-black/40 border-white/10 text-white rounded-[14px] focus-visible:ring-1 focus-visible:ring-indigo-500/50 px-5 text-base transition-all placeholder:text-zinc-600"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="password" className="text-[12px] font-medium text-zinc-400 uppercase tracking-widest ml-1">Secure Password</Label>
                   <Input
                     id="password"
                     type="password"
                     placeholder="••••••••"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                     className="h-14 bg-black/40 border-white/10 text-white rounded-[14px] focus-visible:ring-1 focus-visible:ring-indigo-500/50 px-5 text-base transition-all placeholder:text-zinc-600"
                   />
                 </div>
                 
                 <Button 
                   type="submit"
                   className={`w-full h-14 rounded-[14px] font-medium text-[15px] mt-4 transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] border-0 ${isSignUp ? 'bg-indigo-500 hover:bg-indigo-400 text-white' : 'bg-white text-black hover:bg-zinc-200'} group`} 
                   disabled={loading}
                 >
                   {loading ? (
                     <div className="flex items-center justify-center gap-2">
                       <Loader2 className="w-4 h-4 animate-spin opacity-70" /> 
                       <span>{isSignUp ? 'Creating...' : 'Authenticating...'}</span>
                     </div>
                   ) : (
                     <span className="flex items-center justify-center gap-2">
                       {isSignUp ? 'Establish Identity' : 'Secure Login'} 
                       <Sparkles className="w-4 h-4 opacity-70 group-hover:scale-110 transition-transform" />
                     </span>
                   )}
                 </Button>
              </form>

              <div className="mt-8 flex items-center justify-center gap-4">
                 <div className="flex-1 h-px bg-white border-opacity-5" />
                 <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">OR</span>
                 <div className="flex-1 h-px bg-white border-opacity-5" />
              </div>

              <div className="mt-8">
                 <Button
                   type="button"
                   variant="ghost"
                   className="w-full h-12 rounded-[12px] text-zinc-400 hover:text-white hover:bg-white/5 font-medium tracking-tight"
                   onClick={() => setIsSignUp(!isSignUp)}
                   disabled={loading}
                 >
                   {isSignUp ? 'Already an associate? Sign in' : "Don't have access? Apply here"}
                 </Button>
              </div>
           </div>
        </div>
        
        <p className="text-center text-[11px] text-zinc-600 font-medium tracking-wide mt-8">
          By proceeding, you agree to our <a href="#" className="underline hover:text-zinc-400 transition-colors">Terms of Service</a> & <a href="#" className="underline hover:text-zinc-400 transition-colors">Privacy Policy</a>
        </p>
      </motion.div>
    </div>
  );
}
