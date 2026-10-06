"use client";

import { useState } from "react";
import { Mail, Send, ChevronLeft, MapPin, Phone, MessageSquare, Globe, Sparkles } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { sendContactEmail } from "@/lib/actions/contact.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await sendContactEmail(formData);
      if (result.success) {
        toast.success("Message sent successfully! We'll get back to you soon.");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error(result.error || "Failed to send message. Please try again.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation */}
        <Link 
          href="/feed"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-[#155DFC] transition-colors font-bold text-sm group"
        >
          <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:bg-[#155DFC] group-hover:text-white transition-all shadow-sm">
            <ChevronLeft size={16} />
          </div>
          Back to Feed
        </Link>

        {/* Header Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 text-[#155DFC]">
              <div className="p-2 bg-[#155DFC]/10 rounded-xl">
                <Sparkles size={20} />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.3em]">Zigex Support Hub</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.1]">
              How can we <span className="text-[#155DFC]">help you</span> today?
            </h1>
            
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-lg leading-relaxed">
              Have a question about the platform, opportunities, or collaboration? Our administration team is here to support your journey.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#155DFC]">
                  <Mail size={20} />
                </div>
                <h3 className="font-black text-sm uppercase tracking-wider text-slate-400">Email Us</h3>
                <p className="font-bold text-slate-900 dark:text-white text-sm">zigexconnect.com@gmail.com</p>
              </div>
              
              <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                  <Globe size={20} />
                </div>
                <h3 className="font-black text-sm uppercase tracking-wider text-slate-400">Platform</h3>
                <p className="font-bold text-slate-900 dark:text-white text-sm">www.zigexconnect.com</p>
              </div>
            </div>
          </motion.div>

          {/* Form Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            {/* Background decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#155DFC]/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />

            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-800 rounded-[3rem] p-8 md:p-10 shadow-2xl shadow-blue-500/5 relative">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-4">Full Name</label>
                    <Input 
                      required
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-[#155DFC]/20 transition-all font-bold px-6"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-4">Email Address</label>
                    <Input 
                      required
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-[#155DFC]/20 transition-all font-bold px-6"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-4">Subject</label>
                  <Input 
                    required
                    placeholder="Inquiry about Programs"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-[#155DFC]/20 transition-all font-bold px-6"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-4">Message</label>
                  <Textarea 
                    required
                    placeholder="Tell us how we can help..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="min-h-[160px] rounded-[2rem] bg-slate-50 border-transparent focus:bg-white focus:border-[#155DFC]/20 transition-all font-bold p-6"
                  />
                </div>

                <Button 
                  disabled={isSubmitting}
                  className="w-full h-16 bg-[#155DFC] hover:bg-[#0D47A1] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Send Message</span>
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Trusted Partners / Ecosystem Footer */}
        <div className="pt-20 border-t border-slate-100 dark:border-slate-800">
           <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8">
             Empowering the next generation of professionals
           </p>
           <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
             {/* Ecosystem placeholders logic if needed, otherwise just branding */}
             <div className="font-black text-2xl tracking-tighter">ZIGEX</div>
             <div className="font-black text-2xl tracking-tighter italic">CONNECT</div>
           </div>
        </div>
      </div>
    </div>
  );
}
