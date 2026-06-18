import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { uploadToCloudinary } from '../lib/cloudinary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Loader2, Trash2, UploadCloud, Plus, AlertCircle, CheckCircle2, Building, ScanLine, LayoutTemplate } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function Editor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    name: user?.user_metadata?.full_name || '',
    designation: '',
    email: user?.email || '',
    mobile: '',
    company: '',
    bio: '',
    theme: 'professional',
    layout: 'classic',
    backgroundColor: '#ffffff',
    buttonStyle: 'rounded',
    linkedin: '',
    github: '',
    twitter: '',
    website: '',
    resumeUrl: '',
    leetcode: '',
    hackerrank: '',
    behance: '',
    dribbble: '',
    profilePic: user?.user_metadata?.avatar_url || '',
  });

  const [uploading, setUploading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    if (file.type !== 'application/pdf') {
       toast.error("Please upload a PDF file");
       return;
    }
    if (file.size > 10 * 1024 * 1024) {
       toast.error("File size exceeds 10MB limit");
       return;
    }

    try {
      setUploading(true);
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('resumes').upload(filePath, file, { upsert: true });
      if (error) throw error;
      
      const { data } = supabase.storage.from('resumes').getPublicUrl(filePath);
      
      setFormData(prev => ({ ...prev, resumeUrl: data.publicUrl }));
      toast.success("Resume uploaded successfully!");
    } catch (error: any) {
      console.error("Upload error", error);
      toast.error(error.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    if (!file.type.startsWith('image/')) {
       toast.error("Please upload an image file");
       return;
    }

    try {
      setPhotoUploading(true);
      const imageUrl = await uploadToCloudinary(file);
      setFormData(prev => ({ ...prev, profilePic: imageUrl }));
      toast.success("Profile photo updated!");
    } catch (error: any) {
      console.error("Upload error", error);
      toast.error(error.message || "Failed to upload photo");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleResumeDelete = () => {
    setFormData(prev => ({ ...prev, resumeUrl: '' }));
    toast.success("Resume removed from profile");
  };

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const { data: docSnap, error: cardError } = await supabase.from('cards').select('*').eq('id', user.id).single();
        if (docSnap) {
          setFormData(prev => ({ ...prev, ...docSnap }));
        } else {
          const generatedUsername = user?.user_metadata?.full_name?.replace(/\\s+/g, '').toLowerCase() || user.id.substring(0,8);
          setFormData(prev => ({ ...prev, username: generatedUsername }));
        }

        const { data: portfolioSnap, error: portfolioError } = await supabase.from('portfolios').select('*').eq('id', user.id).single();
        if (portfolioSnap && portfolioSnap.items) {
          setPortfolioItems(portfolioSnap.items.map((item: any) => ({ ...item, id: item.id || crypto.randomUUID() })));
        }
      } catch (error) {
        console.error("Error loading card data", error);
        toast.error("Failed to load your card data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (!formData.username || !formData.name || !formData.designation) {
        throw new Error("Username, Name, and Designation are required.");
      }
      
      const { error: cardError } = await supabase.from('cards').upsert({
        ...formData,
        id: user.id,
        user_id: user.id,
        updated_at: new Date().toISOString()
      });
      if (cardError) throw cardError;

      const { error: portfolioError } = await supabase.from('portfolios').upsert({
        id: user.id,
        user_id: user.id,
        items: portfolioItems,
        updated_at: new Date().toISOString()
      });
      if (portfolioError) throw portfolioError;

      toast.success("Identity profile saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save data.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#09090b]"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col font-sans selection:bg-white/20 selection:text-white">
      
      {/* Ambient background effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-500/5 blur-[120px]" />
      </div>

      <header className="bg-black/50 backdrop-blur-xl border-b border-white/5 px-6 lg:px-10 py-5 flex items-center justify-between sticky top-0 z-20 transition-all">
        <div className="flex items-center gap-5">
          <Link to="/dashboard">
            <Button variant="outline" size="icon" className="w-10 h-10 rounded-[12px] bg-transparent border-white/10 hover:bg-white/5 text-white">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-semibold text-lg text-white tracking-tight leading-tight">Identity Configuration</h1>
            <p className="text-[11px] text-zinc-500 font-medium tracking-wide uppercase mt-0.5">Global Profile Settings</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <Button onClick={handleSave} disabled={saving} className="h-10 px-6 rounded-[12px] bg-white text-black hover:bg-zinc-200 font-medium tracking-tight shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all flex items-center gap-2">
             {saving ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Save className="w-4 h-4 text-black" />}
             {saving ? 'Synchronizing...' : 'Save Configuration'}
           </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10">
        {/* Editor Form Columns - Left Side */}
        <div className="flex-1 overflow-y-auto px-4 py-8 lg:p-10 hide-scrollbar scroll-smooth">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-3xl mx-auto">
            
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-14 mb-10 bg-zinc-900/50 backdrop-blur-md rounded-[16px] p-1.5 border border-white/5 shadow-inner">
                <TabsTrigger value="personal" className="rounded-[10px] text-[13px] font-medium tracking-tight data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm transition-all duration-300">Identity</TabsTrigger>
                <TabsTrigger value="design" className="rounded-[10px] text-[13px] font-medium tracking-tight data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm transition-all duration-300">Design</TabsTrigger>
                <TabsTrigger value="links" className="rounded-[10px] text-[13px] font-medium tracking-tight data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm transition-all duration-300">Socials</TabsTrigger>
                <TabsTrigger value="portfolio" className="rounded-[10px] text-[13px] font-medium tracking-tight data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm transition-all duration-300">Works</TabsTrigger>
              </TabsList>
              
              <AnimatePresence mode="wait">
                <TabsContent key="personal" value="personal" className="space-y-8 mt-0 border-0 outline-none">
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.3 }} className="space-y-8">
                    
                    {/* Block: Avatar */}
                    <div className="p-8 rounded-[24px] bg-zinc-900/40 border border-white/5 shadow-sm backdrop-blur-md flex flex-col sm:flex-row items-center sm:items-start gap-8 group transition-all hover:bg-zinc-900/60 hover:border-white/10">
                      <div className="w-32 h-32 rounded-[24px] bg-zinc-800 overflow-hidden border border-white/10 shrink-0 shadow-inner group-hover:scale-[1.02] transition-transform">
                        {formData.profilePic ? (
                          <img src={formData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-500 font-medium">No Avatar</div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center w-full text-center sm:text-left">
                        <Label htmlFor="profilePicUpload" className="mb-3 block text-[15px] font-medium text-white tracking-tight">Identity Avatar</Label>
                        <p className="text-[13px] text-zinc-400 mb-5 max-w-sm leading-relaxed">
                          We recommend a high-resolution square image for perfect retina rendering. Max file size is 2MB.
                        </p>
                        <div className="flex items-center gap-3 justify-center sm:justify-start">
                          <Input id="profilePicUpload" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={photoUploading} />
                          <Button variant="outline" className="h-10 rounded-[10px] border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium text-[13px]" onClick={() => document.getElementById('profilePicUpload')?.click()} disabled={photoUploading}>
                             {photoUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin text-zinc-400" /> : <UploadCloud className="w-4 h-4 mr-2 text-zinc-400" />}
                             {photoUploading ? 'Uploading Image...' : 'Upload Image'}
                          </Button>
                          {formData.profilePic && (
                            <Button variant="ghost" className="h-10 rounded-[10px] text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 px-3" onClick={() => setFormData(prev => ({...prev, profilePic: ''}))}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Block: Core Info */}
                    <div className="p-8 rounded-[24px] bg-zinc-900/40 border border-white/5 shadow-sm backdrop-blur-md space-y-6">
                      <div className="grid gap-3">
                        <Label htmlFor="username" className="text-[13px] font-medium text-white tracking-tight ml-1">Card Handle (Public URL)</Label>
                        <div className="flex items-center font-mono text-[13px] rounded-[12px] bg-black/40 border border-white/10 overflow-hidden focus-within:ring-2 focus-within:ring-white/20 transition-all">
                          <span className="text-zinc-500 pl-4 pr-1 py-3.5 select-none font-medium bg-zinc-900 border-r border-white/5">cardify.app/</span>
                          <Input id="username" name="username" value={formData.username} onChange={handleChange} className="border-0 bg-transparent h-12 rounded-none px-3 focus-visible:ring-0 focus-visible:ring-offset-0 text-white" placeholder="username" />
                        </div>
                        <p className="text-[12px] text-zinc-500 ml-1">This will be your permanent public link.</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-3">
                          <Label htmlFor="name" className="text-[13px] font-medium text-white tracking-tight ml-1">Full Legal Name <span className="text-rose-500">*</span></Label>
                          <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className="h-12 bg-black/40 border-white/10 text-white rounded-[12px] focus-visible:ring-1 focus-visible:ring-white/30 px-4" />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="designation" className="text-[13px] font-medium text-white tracking-tight ml-1">Current Role / Title <span className="text-rose-500">*</span></Label>
                          <Input id="designation" name="designation" value={formData.designation} onChange={handleChange} placeholder="Principal Designer" className="h-12 bg-black/40 border-white/10 text-white rounded-[12px] focus-visible:ring-1 focus-visible:ring-white/30 px-4" />
                        </div>
                      </div>

                      <div className="grid gap-3">
                        <Label htmlFor="company" className="text-[13px] font-medium text-white tracking-tight ml-1">Company / Organization</Label>
                        <div className="relative">
                          <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                          <Input id="company" name="company" value={formData.company} onChange={handleChange} placeholder="Acme Corporation" className="h-12 bg-black/40 border-white/10 text-white rounded-[12px] focus-visible:ring-1 focus-visible:ring-white/30 pl-11" />
                        </div>
                      </div>

                      <div className="grid gap-3">
                        <Label htmlFor="bio" className="text-[13px] font-medium text-white tracking-tight ml-1">Executive Summary / Bio</Label>
                        <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} placeholder="A brief summary highlighting your professional expertise..." className="min-h-[120px] resize-y bg-black/40 border-white/10 text-white rounded-[12px] focus-visible:ring-1 focus-visible:ring-white/30 p-4 leading-relaxed text-[14px]" />
                      </div>
                    </div>

                    {/* Block: Contact */}
                    <div className="p-8 rounded-[24px] bg-zinc-900/40 border border-white/5 shadow-sm backdrop-blur-md space-y-6">
                      <h3 className="text-base font-medium text-white mb-2 tracking-tight">Direct Contact Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-3">
                          <Label htmlFor="email" className="text-[13px] font-medium text-zinc-300 ml-1">Professional Email</Label>
                          <Input id="email" name="email" value={formData.email} onChange={handleChange} placeholder="hello@domain.com" className="h-12 bg-black/40 border-white/10 text-white rounded-[12px] focus-visible:ring-1 focus-visible:ring-white/30 px-4" />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="mobile" className="text-[13px] font-medium text-zinc-300 ml-1">Mobile Phone</Label>
                          <Input id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="+1 555 019 990" className="h-12 bg-black/40 border-white/10 text-white rounded-[12px] focus-visible:ring-1 focus-visible:ring-white/30 px-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>
                
                <TabsContent key="design" value="design" className="space-y-6 mt-0 border-0 outline-none">
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.3 }} className="p-8 rounded-[24px] bg-zinc-900/40 border border-white/5 shadow-sm backdrop-blur-md space-y-8 text-center min-h-[400px] flex flex-col justify-center items-center">
                      <div className="w-16 h-16 rounded-[16px] bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mb-4">
                        <LayoutTemplate className="w-8 h-8 text-indigo-400" />
                      </div>
                      <h2 className="text-2xl font-medium tracking-tight text-white mb-2">Deep Design Moved</h2>
                      <p className="text-zinc-400 text-[15px] max-w-sm mb-8 leading-relaxed">
                        To provide the most immersive configuration experience, all visual controls and AI theme generation are now housed within the dedicated <strong>Card Designer</strong> workspace.
                      </p>
                      <Link to="/designer">
                        <Button className="h-12 px-8 rounded-[12px] bg-white text-black hover:bg-zinc-200 font-medium tracking-tight shadow-xl group">
                          Launch Card Designer <ArrowLeft className="w-4 h-4 ml-2 rotate-180 opacity-70 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                  </motion.div>
                </TabsContent>

                <TabsContent key="links" value="links" className="space-y-8 mt-0 border-0 outline-none">
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.3 }} className="space-y-8">
                    
                    {/* Identity Links */}
                    <div className="p-8 rounded-[24px] bg-zinc-900/40 border border-white/5 shadow-sm backdrop-blur-md space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
                      <div className="col-span-2 mb-2">
                        <h3 className="text-base font-medium text-white tracking-tight">Social & Integrations</h3>
                        <p className="text-[13px] text-zinc-400 mt-1">Connect your digital presence. Empty fields will be automatically hidden.</p>
                      </div>

                      <div className="grid gap-3">
                        <Label htmlFor="linkedin" className="text-[13px] font-medium text-zinc-300 ml-1">LinkedIn Profile</Label>
                        <Input id="linkedin" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/" className="h-12 bg-black/40 border-white/10 text-white rounded-[12px] focus-visible:ring-1 focus-visible:ring-indigo-500 px-4 transition-colors hover:border-indigo-500/50" />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="github" className="text-[13px] font-medium text-zinc-300 ml-1">GitHub Profile</Label>
                        <Input id="github" name="github" value={formData.github} onChange={handleChange} placeholder="https://github.com/" className="h-12 bg-black/40 border-white/10 text-white rounded-[12px] focus-visible:ring-1 focus-visible:ring-indigo-500 px-4 transition-colors hover:border-indigo-500/50" />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="twitter" className="text-[13px] font-medium text-zinc-300 ml-1">X (Twitter)</Label>
                        <Input id="twitter" name="twitter" value={formData.twitter} onChange={handleChange} placeholder="https://x.com/" className="h-12 bg-black/40 border-white/10 text-white rounded-[12px] focus-visible:ring-1 focus-visible:ring-slate-400 px-4 transition-colors hover:border-slate-500/50" />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="website" className="text-[13px] font-medium text-zinc-300 ml-1">Personal Website</Label>
                        <Input id="website" name="website" value={formData.website} onChange={handleChange} placeholder="https://yourwebsite.com" className="h-12 bg-black/40 border-white/10 text-white rounded-[12px] focus-visible:ring-1 focus-visible:ring-emerald-500 px-4 transition-colors hover:border-emerald-500/50" />
                      </div>
                    </div>

                    <div className="p-8 rounded-[24px] bg-zinc-900/40 border border-white/5 shadow-sm backdrop-blur-md space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
                      <div className="col-span-2 mb-2">
                        <h3 className="text-base font-medium text-white tracking-tight">Specialized Platforms</h3>
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="leetcode" className="text-[13px] font-medium text-zinc-300 ml-1">LeetCode</Label>
                        <Input id="leetcode" name="leetcode" value={formData.leetcode} onChange={handleChange} placeholder="https://leetcode.com/" className="h-12 bg-black/40 border-white/10 text-white rounded-[12px] focus-visible:ring-1 focus-visible:ring-orange-500 px-4 transition-colors hover:border-orange-500/50" />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="hackerrank" className="text-[13px] font-medium text-zinc-300 ml-1">HackerRank</Label>
                        <Input id="hackerrank" name="hackerrank" value={formData.hackerrank} onChange={handleChange} placeholder="https://hackerrank.com/" className="h-12 bg-black/40 border-white/10 text-white rounded-[12px] focus-visible:ring-1 focus-visible:ring-green-500 px-4 transition-colors hover:border-green-500/50" />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="behance" className="text-[13px] font-medium text-zinc-300 ml-1">Behance</Label>
                        <Input id="behance" name="behance" value={formData.behance} onChange={handleChange} placeholder="https://behance.net/" className="h-12 bg-black/40 border-white/10 text-white rounded-[12px] focus-visible:ring-1 focus-visible:ring-blue-500 px-4 transition-colors hover:border-blue-500/50" />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="dribbble" className="text-[13px] font-medium text-zinc-300 ml-1">Dribbble</Label>
                        <Input id="dribbble" name="dribbble" value={formData.dribbble} onChange={handleChange} placeholder="https://dribbble.com/" className="h-12 bg-black/40 border-white/10 text-white rounded-[12px] focus-visible:ring-1 focus-visible:ring-pink-500 px-4 transition-colors hover:border-pink-500/50" />
                      </div>
                    </div>

                    {/* Resume Upload Box */}
                    <div className="p-8 rounded-[24px] bg-indigo-500/5 border border-indigo-500/20 shadow-sm backdrop-blur-md">
                      <div className="mb-6">
                        <h3 className="text-base font-medium text-indigo-100 tracking-tight flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Digital Resume Resume
                        </h3>
                        <p className="text-[13px] text-indigo-200/50 mt-1 max-w-sm">Attach a static PDF document that visitors can securely view or download directly from your profile.</p>
                      </div>
                      
                      <div className="bg-black/20 p-6 rounded-[16px] border border-white/5 border-dashed flex flex-col items-center justify-center text-center gap-4 group transition-colors hover:border-indigo-500/30">
                        {formData.resumeUrl ? (
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                               <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                               <p className="text-[14px] text-white font-medium mb-1">Resume Attached Successfully</p>
                               <div className="flex items-center justify-center gap-3 mt-3">
                                 <a href={formData.resumeUrl} target="_blank" rel="noreferrer" className="text-[12px] font-medium text-indigo-400 hover:text-indigo-300 hover:underline">View Document</a>
                                 <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                 <button onClick={handleResumeDelete} className="text-[12px] font-bold text-rose-500 hover:text-rose-400">Remove</button>
                               </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                               <UploadCloud className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                               <Label htmlFor="resumeFile" className="text-[14px] font-medium text-white cursor-pointer hover:underline">Click to browse your device</Label>
                               <p className="text-[11px] text-zinc-500 mt-1.5 uppercase font-medium tracking-wide">Must be PDF (Max 10MB)</p>
                            </div>
                            <Input id="resumeFile" type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                            {uploading && <div className="text-[12px] font-medium text-indigo-400 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin"/> Upload stream active...</div>}
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>

                <TabsContent key="portfolio" value="portfolio" className="space-y-8 mt-0 border-0 outline-none">
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.3 }} className="space-y-6">
                    <div className="flex justify-between items-center bg-zinc-900/60 p-6 rounded-[24px] border border-white/5 backdrop-blur-md">
                      <div>
                        <h3 className="text-base font-medium text-white tracking-tight">Portfolio Highlights</h3>
                        <p className="text-[13px] text-zinc-400 mt-1">Add curated projects to display at the bottom of your profile.</p>
                      </div>
                      <Button onClick={() => setPortfolioItems([...portfolioItems, { id: crypto.randomUUID(), title: '', description: '', url: '', imageUrl: '' }])} className="h-10 px-5 rounded-[12px] bg-white text-black hover:bg-zinc-200 font-medium tracking-tight shadow-sm flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Item
                      </Button>
                    </div>

                    {portfolioItems.length === 0 ? (
                      <div className="p-12 text-center border border-dashed border-white/10 rounded-[24px] flex flex-col items-center justify-center gap-4 bg-black/20">
                        <div className="w-16 h-16 rounded-[16px] bg-zinc-900 flex items-center justify-center border border-white/5"><LayoutTemplate className="w-6 h-6 text-zinc-500" /></div>
                        <p className="text-[14px] text-zinc-400 font-medium tracking-tight">No portfolio items configured.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <AnimatePresence>
                          {portfolioItems.map((item, index) => (
                            <motion.div 
                              key={item.id || `fallback-${index}`} 
                              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}
                              className="p-8 border border-white/5 rounded-[24px] bg-zinc-900/30 backdrop-blur-sm relative group overflow-hidden"
                            >
                              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none" />
                              <button onClick={() => setPortfolioItems(portfolioItems.filter((_, i) => i !== index))} className="absolute top-6 right-6 p-2 rounded-full text-zinc-500 hover:bg-rose-500/10 hover:text-rose-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                              
                              <div className="grid gap-6 max-w-[90%]">
                                <div className="grid gap-3">
                                  <Label className="text-[12px] font-medium text-zinc-400 uppercase tracking-wide">Item Name</Label>
                                  <Input value={item.title} onChange={(e) => { const newItems = [...portfolioItems]; newItems[index].title = e.target.value; setPortfolioItems(newItems); }} placeholder="Project Name" className="h-12 bg-black/40 border-white/10 text-white rounded-[12px] focus-visible:ring-1 focus-visible:ring-indigo-500 px-4 text-lg font-medium tracking-tight" />
                                </div>
                                <div className="grid gap-3">
                                  <Label className="text-[12px] font-medium text-zinc-400 uppercase tracking-wide">Description</Label>
                                  <Textarea value={item.description} onChange={(e) => { const newItems = [...portfolioItems]; newItems[index].description = e.target.value; setPortfolioItems(newItems); }} placeholder="A brief description of this specific project..." className="min-h-[100px] resize-y bg-black/40 border-white/10 text-white rounded-[12px] focus-visible:ring-1 focus-visible:ring-indigo-500 p-4 leading-relaxed text-[14px]" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="grid gap-3">
                                    <Label className="text-[12px] font-medium text-zinc-400 uppercase tracking-wide">Destination URL (Optional)</Label>
                                    <Input value={item.url} onChange={(e) => { const newItems = [...portfolioItems]; newItems[index].url = e.target.value; setPortfolioItems(newItems); }} placeholder="https://..." className="h-12 bg-black/40 border-white/10 text-white rounded-[12px] focus-visible:ring-1 focus-visible:ring-indigo-500 px-4" />
                                  </div>
                                  <div className="grid gap-3">
                                    <Label className="text-[12px] font-medium text-zinc-400 uppercase tracking-wide">Cover Image Source (Optional URL)</Label>
                                    <Input value={item.imageUrl} onChange={(e) => { const newItems = [...portfolioItems]; newItems[index].imageUrl = e.target.value; setPortfolioItems(newItems); }} placeholder="https://..." className="h-12 bg-black/40 border-white/10 text-white rounded-[12px] focus-visible:ring-1 focus-visible:ring-indigo-500 px-4" />
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>

          </motion.div>
        </div>

        {/* Live Profile Visuals - Right Side */}
        <div className="hidden lg:flex w-[420px] bg-black/40 backdrop-blur-2xl px-10 py-10 flex-col border-l border-white/5 relative z-10 shrink-0 select-none">
          
          <div className="flex items-center gap-2 mb-10 overflow-hidden relative">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse" />
             <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Preview Syntax</span>
          </div>

          <div className="flex flex-col items-center justify-center flex-1 w-full scale-100 origin-top opacity-100">
             
             {/* SIMULATED IPHONE RENDER */}
             <div className="w-[300px] h-[600px] rounded-[44px] bg-[#09090b] shadow-[0_0_0_6px_#18181b,0_0_0_8px_#27272a,0_20px_50px_-5px_#000000] border-4 border-black relative overflow-hidden flex flex-col items-center p-1 isolate">
                
                {/* Dynamic Notch */}
                <div className="absolute top-2 w-[100px] h-7 bg-black rounded-full z-50 left-1/2 -translate-x-1/2 flex items-center justify-end px-2 shadow-inner">
                   <div className="w-2.5 h-2.5 rounded-full bg-[#050505] border border-white/5 relative overflow-hidden"><div className="absolute inset-1 rounded-full bg-[#111]" /></div>
                </div>

                {/* Internal Canvas Render */}
                <div className="w-full h-full bg-[#09090b] rounded-[38px] relative overflow-hidden flex flex-col">
                  
                  {/* Subtle glass effect behind image */}
                  <div className="w-full h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 relative backdrop-blur-3xl shrink-0" />
                  
                  {/* Floating Content */}
                  <div className="px-5 pb-6 text-center relative -mt-10 flex-1 overflow-y-auto hide-scrollbar">
                    
                    <div className="w-24 h-24 mx-auto rounded-[20px] border-4 border-[#09090b] overflow-hidden bg-zinc-800 shrink-0 relative shadow-xl focus:ring-4 focus:ring-white/10 group">
                      {formData.profilePic ? (
                        <img src={formData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col justify-center items-center opacity-40"><p className="text-[28px] font-medium leading-none tracking-tight text-white">{formData.name?.charAt(0) || 'U'}</p></div>
                      )}
                    </div>

                    <div className="mt-4 flex justify-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-bold tracking-widest uppercase text-zinc-400 inline-flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Verified</span>
                    </div>
                    
                    <h2 className="text-xl font-medium tracking-tight leading-tight text-white mt-3 truncate">{formData.name || 'John Doe'}</h2>
                    <p className={`text-[12px] font-medium mt-1 uppercase tracking-wider text-indigo-400 truncate`}>{formData.designation || 'Specialist'}</p>
                    
                    <p className={`text-[13px] mt-4 leading-relaxed font-normal opacity-70 text-white line-clamp-4 text-left`}>
                      {formData.bio || 'Your professional biography will populate in this primary space. It is designed to be elegant, reading perfectly on retina displays.'}
                    </p>

                    <div className="mt-8 flex flex-col gap-3">
                      <div className="w-full rounded-[14px] h-12 bg-white flex items-center justify-center border border-white shadow-xl opacity-90"><span className="text-[12px] font-bold text-black tracking-widest uppercase">Save Contact</span></div>
                      <div className="w-full rounded-[14px] h-12 bg-transparent border-2 border-white/10 flex items-center justify-center opacity-70"><span className="text-[12px] font-bold text-white tracking-widest uppercase">Visit Website</span></div>
                    </div>

                    {/* Faux Links */}
                    <div className="mt-8 grid grid-cols-4 gap-3 px-2">
                       <div className="aspect-square rounded-[12px] bg-white/5 flex items-center justify-center"><div className="w-5 h-5 rounded-md bg-white/20" /></div>
                       <div className="aspect-square rounded-[12px] bg-white/5 flex items-center justify-center"><div className="w-5 h-5 rounded-md bg-white/20" /></div>
                       <div className="aspect-square rounded-[12px] bg-white/5 flex items-center justify-center"><div className="w-5 h-5 rounded-md bg-white/20" /></div>
                       <div className="aspect-square rounded-[12px] bg-white/5 flex items-center justify-center"><div className="w-5 h-5 rounded-md bg-white/20" /></div>
                    </div>
                  </div>
                </div>

             </div>
          </div>
          
          <div className="mt-10 px-6">
            <div className="bg-white/5 border border-white/10 rounded-[16px] p-5 flex items-start gap-4 shadow-sm backdrop-blur-md">
                 <div className="w-10 h-10 rounded-[10px] bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0"><ScanLine className="w-5 h-5 text-indigo-400" /></div>
                 <div>
                    <h4 className="text-[13px] font-medium text-white mb-1 tracking-tight">QR Rendering</h4>
                    <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">A high-fidelity universal QR code is automatically deployed on the live public endpoint.</p>
                 </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
