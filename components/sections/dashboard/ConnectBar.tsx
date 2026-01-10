"use client";

import React from "react";
import { Linkedin, Mail, Twitter, Handshake, MessageCircle, ExternalLink, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  linkedin?: string | null;
  whatsapp?: string | null;
  x?: string | null;
  email?: string | null;
}

export const ConnectBar: React.FC<Props> = ({ linkedin, whatsapp, x, email }) => {
  const whatsappLink = whatsapp ? `https://wa.me/${whatsapp.replace(/[^\d+]/g, "")}` : null;
  
  const hasLinks = linkedin || whatsappLink || x || email;
  if (!hasLinks) return null;

  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-8 z-[60] w-full max-w-2xl px-6">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-2 pr-6 flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[1.8rem] bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
            <Handshake size={22} className="relative z-10" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-30"
            />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5 leading-none mb-1">
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Live Connection</span>
              <Sparkles size={10} className="text-amber-400" />
            </div>
            <p className="text-xs font-bold text-slate-400">Available for collaboration</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {linkedin && (
            <motion.a
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.9 }}
              href={linkedin}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/20 hover:bg-[#0A66C2] hover:text-white transition-all duration-300 shadow-sm"
              title="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </motion.a>
          )}

          {whatsappLink && (
            <motion.a
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.9 }}
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-sm"
              title="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </motion.a>
          )}

          {x && (
            <motion.a
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.9 }}
              href={x}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/10 text-white border border-white/20 hover:bg-white hover:text-slate-900 transition-all duration-300 shadow-sm"
              title="X"
            >
              <Twitter className="w-4 h-4" />
            </motion.a>
          )}

          {email && (
            <motion.a
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.9 }}
              href={`mailto:${email}`}
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-sm"
              title="Email"
            >
              <Mail className="w-4 h-4" />
            </motion.a>
          )}
          
          <div className="w-px h-6 bg-white/10 mx-2 hidden sm:block" />
          
          <button className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-md">
             <span>Get In Touch</span>
             <ExternalLink size={12} strokeWidth={3} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ConnectBar;
