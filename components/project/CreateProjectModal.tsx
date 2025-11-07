"use client";

import React, { useState, useRef } from "react";
import { X, Image as ImageIcon, Github, Calendar, Sparkles, Share } from "lucide-react";
import Image from "next/image";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: ProjectFormData) => void;
}

export interface ProjectFormData {
  title: string;
  description: string;
  coverImage: File | null;
  githubLink: string;
  duration: string;
}

const PROJECT_DURATIONS = [
  "2 months",
  "3 months",
  "5 months",
  "6 months",
  "1 year",
  "1+ years",
  "Ongoing"
];

export default function CreateProjectModal({ isOpen, onClose, onSubmit }: CreateProjectModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [githubLink, setGithubLink] = useState("");
  const [duration, setDuration] = useState("3 months");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeImage = () => {
    setCoverImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Please fill in title and description");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        description,
        coverImage,
        githubLink,
        duration,
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setCoverImage(null);
      setPreviewUrl(null);
      setGithubLink("");
      setDuration("3 months");
      onClose();
    } catch (error) {
      console.error("Error submitting project:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X size={20} className="text-gray-600" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">Share Your Project</h2>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !description.trim()}
            className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Inspirational Message */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Share size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Share what you're building!</h3>
                <p className="text-sm text-gray-600">
                  Tell others about your project so they can collaborate and build something great together. 
                  Your next co-founder or teammate might be here! 🚀
                </p>
              </div>
            </div>
          </div>

          {/* Project Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your project called?"
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              maxLength={100}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {title.length}/100
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project, what problem it solves, and what kind of collaborators you're looking for..."
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
              rows={6}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {description.length}/500
            </div>
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cover Image
            </label>
            
            {previewUrl ? (
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-300">
                <Image
                  src={previewUrl}
                  alt="Cover preview"
                  fill
                  className="object-cover"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-2 group"
              >
                <ImageIcon size={32} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                <span className="text-sm text-gray-500 group-hover:text-blue-500 font-medium">
                  Click to upload cover image
                </span>
              </button>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* GitHub Link */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              GitHub Repository
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Github size={20} className="text-gray-400" />
              </div>
              <input
                type="url"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                placeholder="https://github.com/username/repo"
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Project Duration */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Project Duration
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Calendar size={20} className="text-gray-400" />
              </div>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer bg-white"
              >
                {PROJECT_DURATIONS.map((dur) => (
                  <option key={dur} value={dur}>
                    {dur}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}