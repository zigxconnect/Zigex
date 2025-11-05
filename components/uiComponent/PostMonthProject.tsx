"use client"

import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import { Pencil } from "lucide-react";

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

  function onMainChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setMainFile(f);
    if (f) setPreviewMain(URL.createObjectURL(f));
  }

  function onAddThumb(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setThumbs((s) => [...s, f].slice(0, 4));
  }

  function addContributor() {
    if (!newContributor.trim()) return;
    setContributors((s) => [...s, newContributor.trim()]);
    setNewContributor("");
  }

  async function onSubmit(close: () => void) {
    setSubmitting(true);
    try {
      // For now just log the payload. Integrate with API or Supabase as needed.
      const payload = {
        title,
        description,
        github,
        owner: user?.id,
        contributors,
        mainFileName: mainFile?.name ?? null,
        thumbnails: thumbs.map((t) => t.name),
      };
      console.log("PostMonthProject submit", payload, { mainFile, thumbs });

      // TODO: POST to /api/students/projects or use Supabase storage.
      await new Promise((r) => setTimeout(r, 800));

      setTitle("");
      setDescription("");
      setGithub("");
      setMainFile(null);
      setThumbs([]);
      setContributors([]);
      setPreviewMain(null);

      close();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="secondary"
            className="fixed left-6 bottom-6 rounded-full z-50 inline-flex items-center gap-2 px-4 py-2  md:rounded-lg shadow-lg bg-blue-800"
          >
            <Pencil size={24} color="#fff"/>
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post monthly project</DialogTitle>
            <DialogDescription>Add details and media for your current month project.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 mt-4">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title" />

            <label className="text-sm font-medium">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />

            <label className="text-sm font-medium">GitHub URL</label>
            <Input value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/your/repo" />

            <div>
              <label className="text-sm font-medium">Main image</label>
              <input type="file" accept="image/*" onChange={onMainChange} className="mt-2" />
              {previewMain && (
                <div className="mt-2 w-full h-36 rounded-md overflow-hidden bg-gray-100">
                  <img src={previewMain} alt="main preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Thumbnails (max 4)</label>
              <input type="file" accept="image/*" onChange={onAddThumb} className="mt-2" />
              <div className="mt-2 flex gap-2">
                {thumbs.map((t, i) => (
                  <div key={i} className="w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                    <img src={URL.createObjectURL(t)} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Contributors</label>
              <div className="flex gap-2 mt-2">
                <Input value={newContributor} onChange={(e) => setNewContributor(e.target.value)} placeholder="Name or handle" />
                <Button onClick={addContributor} variant="secondary">Add</Button>
              </div>
              <div className="mt-2 flex gap-2 flex-wrap text-xs">
                {contributors.map((c, i) => (
                  <div key={i} className="px-2 py-1 bg-gray-100 rounded-full">{c}</div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button onClick={() => onSubmit(() => { /* dialog close will happen via state after submit */ })} disabled={submitting}>
              {submitting ? "Posting..." : "Post project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
