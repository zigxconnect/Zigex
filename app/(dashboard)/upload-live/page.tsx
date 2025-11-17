"use client";

import React, { useState, useRef } from "react";
import { uploadHappeningNow } from "@/lib/actions/happening-now.actions";
import { Upload, X, Play, Image as ImageIcon } from "lucide-react";

const MAX_IMAGES = 6;
const MAX_VIDEO_SIZE_MB = 30;

export default function UploadLivePage() {
  const [company, setCompany] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [captions, setCaptions] = useState<string[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, MAX_IMAGES - images.length);
      setImages([...images, ...newFiles]);
      // Initialize captions for new images
      setCaptions([...captions, ...newFiles.map(() => "")]);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) {
      const sizeInMB = file.size / (1024 * 1024);
      if (sizeInMB > MAX_VIDEO_SIZE_MB) {
        setMessage({
          type: "error",
          text: `Video size exceeds ${MAX_VIDEO_SIZE_MB}MB limit`,
        });
        return;
      }
      setVideo(file);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newCaptions = captions.filter((_, i) => i !== index);
    setImages(newImages);
    setCaptions(newCaptions);
  };

  const removeVideo = () => {
    setVideo(null);
  };

  const updateCaption = (index: number, text: string) => {
    const newCaptions = [...captions];
    newCaptions[index] = text;
    setCaptions(newCaptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (!company.trim()) {
      setMessage({ type: "error", text: "Company name is required" });
      return;
    }

    if (images.length === 0) {
      setMessage({ type: "error", text: "Please upload at least one image" });
      return;
    }

    setLoading(true);

    try {
      // Build FormData
      const formData = new FormData();
      formData.append("company", company);
      formData.append("is_live", isLive.toString());
      formData.append("captions", JSON.stringify(captions));

      console.log("📋 Form Data Before Upload:");
      console.log("  - Company:", company);
      console.log("  - Is Live:", isLive);
      console.log("  - Images:", images.length);
      console.log("  - Captions:", captions);
      console.log("  - Captions JSON:", JSON.stringify(captions));

      // Add images
      images.forEach((img) => {
        formData.append("images", img);
      });

      // Add video if present
      if (video) {
        formData.append("video", video);
      }

      // Call server action
      const result = await uploadHappeningNow(formData);

      if (result.success) {
        setMessage({
          type: "success",
          text: "Content uploaded successfully!",
        });
        // Reset form
        setCompany("");
        setImages([]);
        setVideo(null);
        setCaptions([]);
        setIsLive(false);
        if (imageInputRef.current) imageInputRef.current.value = "";
        if (videoInputRef.current) videoInputRef.current.value = "";
      } else {
        setMessage({
          type: "error",
          text: result.error || "Upload failed",
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Upload failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Upload Live Content</h1>
          <p className="text-gray-600">
            Share what's happening now with your company's updates, images, and videos.
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
              message.type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="text-lg font-bold opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 space-y-8">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Enter your company name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Images Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Images ({images.length}/{MAX_IMAGES}) *
              </label>

              <div className="space-y-4">
                {/* Upload Button */}
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={images.length >= MAX_IMAGES}
                  className="w-full border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ImageIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload images or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to {MAX_IMAGES} images
                  </p>
                </button>

                <input
                  ref={imageInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {/* Image Previews */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-40 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <input
                        type="text"
                        value={captions[index] || ""}
                        onChange={(e) => updateCaption(index, e.target.value)}
                        placeholder="Caption"
                        className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Video Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">Video</label>

              {!video ? (
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-purple-300 rounded-lg p-8 text-center hover:border-purple-500 hover:bg-purple-50 transition"
                >
                  <Play className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload video or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    MP4, WebM up to {MAX_VIDEO_SIZE_MB}MB
                  </p>
                </button>
              ) : (
                <div className="relative bg-gray-100 rounded-lg overflow-hidden p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Play className="w-6 h-6 text-purple-600" />
                      <span className="text-sm text-gray-700 font-medium">{video.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(video.size / (1024 * 1024)).toFixed(2)}MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />
            </div>

            {/* Live Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isLive"
                checked={isLive}
                onChange={(e) => setIsLive(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="isLive" className="text-sm font-medium text-gray-700">
                Mark as Live <span className="text-red-600">🔴</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || images.length === 0}
              className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              {loading ? "Uploading..." : "Upload Content"}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Tips:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Upload up to {MAX_IMAGES} images per update</li>
            <li>• Video size limit is {MAX_VIDEO_SIZE_MB}MB</li>
            <li>• Add captions for each image to provide context</li>
            <li>• Mark as Live to highlight this content on the feed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
