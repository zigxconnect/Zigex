"use client"

import React, { useState, useRef } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import { Pencil, Image as ImageIcon, Github, Users, Send, X, Plus } from "lucide-react";
import { toast } from "sonner";
import NextImage from "next/image";

interface Props {
  user?: { id?: string; full_name?: string; avatar_url?: string | null } | null;
}

export default function PostMonthProject({ user }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [github, setGithub] = useState("");
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [thumbs, setThumbs] = useState<File[]>([]);
  const [contributors, setContributors] = useState<string[]>([]);
  const [newContributor, setNewContributor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [previewMain, setPreviewMain] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const mainInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  function onMainChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setMainFile(f);
    if (f) setPreviewMain(URL.createObjectURL(f));
  }

  function onAddThumb(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      if (thumbs.length >= 4) {
        toast.error("Maximum 4 thumbnails allowed");
        return;
      }
      setThumbs((s) => [...s, f]);
    }
  }

  function removeThumb(index: number) {
    setThumbs(thumbs.filter((_, i) => i !== index));
  }

  function addContributor() {
    if (!newContributor.trim()) return;
    if (contributors.includes(newContributor.trim())) {
      toast.error("Contributor already added");
      return;
    }
    setContributors((s) => [...s, newContributor.trim()]);
    setNewContributor("");
  }

  function removeContributor(name: string) {
    setContributors(contributors.filter((c) => c !== name));
  }

  async function onSubmit() {
    if (!title || !description) {
      toast.error("Please fill in the title and description");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        github,
        owner: user?.id,
        contributors,
        mainFileName: mainFile?.name ?? null,
        thumbnails: thumbs.map((t) => t.name),
      };

      // console.log("PostMonthProject submit", payload);

      // Simulate API call
      await new Promise((r) => setTimeout(r, 1500));

      toast.success("Project highlight posted!");

      // Reset
      setTitle("");
      setDescription("");
      setGithub("");
      setMainFile(null);
      setThumbs([]);
      setContributors([]);
      setPreviewMain(null);

      setIsOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to post project");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button
            className="fixed left-6 bottom-6 w-14 h-14 bg-[#155DFC] hover:bg-[#1A3CB9] rounded-full z-50 flex items-center justify-center shadow-2xl shadow-blue-400/40 transition-all duration-300 hover:scale-110 active:scale-95 group cursor-pointer"
            title="Post Monthly Highlight"
          >
            <div className="relative">
              <Pencil size={24} className="text-white group-hover:rotate-12 transition-transform" />
            </div>
            {/* Pulsing ring */}
            <div className="absolute inset-0 rounded-full bg-[#155DFC] animate-ping opacity-20" />
          </button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[500px] bg-white rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-gradient-to-br from-[#155DFC] to-[#1A3CB9] px-8 py-10 text-white relative">
            <DialogHeader className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded text-[10px] font-black uppercase tracking-widest">
                  Monthly Spotlight
                </div>
              </div>
              <DialogTitle className="text-3xl font-black tracking-tight uppercase">Launch Project</DialogTitle>
              <DialogDescription className="text-blue-100 font-medium">
                Ready to showcase your breakthrough this month?
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-8 py-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#155DFC] uppercase tracking-widest ml-1">Project Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's the name of your masterpiece?"
                  className="rounded-2xl border-blue-50 focus:border-[#155DFC] focus:ring-[#155DFC]/10 h-12 bg-slate-50/50 font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#155DFC] uppercase tracking-widest ml-1">The Mission</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the vision and the impact..."
                  className="rounded-2xl border-blue-50 focus:border-[#155DFC] focus:ring-[#155DFC]/10 min-h-[100px] bg-slate-50/50 font-medium leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#155DFC] uppercase tracking-widest ml-1">Codename Repo (GitHub)</label>
                <div className="relative">
                  <Input
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/your/breakthrough"
                    className="rounded-2xl border-blue-50 focus:border-[#155DFC] focus:ring-[#155DFC]/10 h-12 pl-10 bg-slate-50/50 font-medium"
                  />
                  <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#155DFC] uppercase tracking-widest ml-1">Main Intel (Cover Image)</label>
                <div
                  onClick={() => mainInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-100 rounded-3xl p-8 text-center hover:bg-blue-50/50 transition-all cursor-pointer group bg-slate-50/30"
                >
                  {previewMain ? (
                    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg">
                      <img src={previewMain} alt="main preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-black uppercase tracking-widest">Change Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <ImageIcon className="text-[#155DFC]" size={24} />
                      </div>
                      <span className="text-xs font-bold text-slate-500">Upload high-res cover</span>
                      <span className="text-[10px] text-slate-400 font-medium">PNG, JPG, WEBP (Max 5MB)</span>
                    </div>
                  )}
                  <input ref={mainInputRef} type="file" accept="image/*" onChange={onMainChange} className="hidden" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#155DFC] uppercase tracking-widest ml-1">Gallery (Max 4)</label>
                <div className="flex gap-3 flex-wrap">
                  {thumbs.map((t, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-md group">
                      <img src={URL.createObjectURL(t)} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeThumb(i)}
                        className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  {thumbs.length < 4 && (
                    <button
                      onClick={() => thumbInputRef.current?.click()}
                      className="w-20 h-20 rounded-2xl border-2 border-dashed border-blue-100 flex flex-col items-center justify-center gap-1 hover:bg-blue-50 transition-all text-slate-400 hover:text-[#155DFC] cursor-pointer"
                    >
                      <Plus size={20} />
                      <span className="text-[8px] font-black uppercase">Add</span>
                    </button>
                  )}
                </div>
                <input ref={thumbInputRef} type="file" accept="image/*" onChange={onAddThumb} className="hidden" />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#155DFC] uppercase tracking-widest ml-1">Agents Involved (Contributors)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={newContributor}
                      onChange={(e) => setNewContributor(e.target.value)}
                      placeholder="Agent name or handle..."
                      className="rounded-2xl border-blue-50 focus:border-[#155DFC] focus:ring-[#155DFC]/10 h-11 pl-10 bg-slate-50/50 font-medium text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && addContributor()}
                    />
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  </div>
                  <Button onClick={addContributor} className="rounded-2xl bg-[#155DFC] hover:bg-[#1A3CB9] h-11 px-4 font-black text-[10px] uppercase">Join</Button>
                </div>
                <div className="flex gap-2 flex-wrap min-h-[20px]">
                  {contributors.map((c, i) => (
                    <div key={i} className="group flex items-center gap-1.5 px-3 py-1 bg-[#F6F8FF] text-[#155DFC] rounded-full text-[10px] font-bold border border-blue-50 shadow-sm animate-in zoom-in-50">
                      {c}
                      <button onClick={() => removeContributor(c)} className="hover:text-red-500 transition-colors cursor-pointer">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-8 py-6 bg-slate-50/50 border-t border-blue-50 gap-3 sm:gap-0">
            <DialogClose asChild>
              <Button variant="secondary" className="rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 border-none bg-transparent hover:bg-slate-100 shadow-none">Cancel</Button>
            </DialogClose>
            <Button
              onClick={onSubmit}
              disabled={submitting}
              className="rounded-2xl bg-[#155DFC] hover:bg-[#1A3CB9] px-8 h-12 font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-200"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Syncing...
                </>
              ) : (
                <>
                  Publish Now
                  <Send size={14} className="ml-2" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

