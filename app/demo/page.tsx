"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Star, GitFork, Users, FileText, Github } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// this is just testing the new enpoint i created.

export default function GithubDemoPage() {
  const [owner, setOwner] = useState("facebook");
  const [repo, setRepo] = useState("react");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch(`/api/github-test?owner=${owner}&repo=${repo}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to fetch data");
      }
      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-4"
          >
            <Github className="w-8 h-8 text-indigo-400" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            GitHub API Explorer
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Test the live endpoint by fetching repository metadata, contributors, and raw README content in real-time.
          </p>
        </div>

        {/* Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-3xl shadow-2xl backdrop-blur-sm"
        >
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <label className="text-sm font-medium text-neutral-400 ml-1">Owner</label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-neutral-700"
                placeholder="e.g. vercel"
              />
            </div>
            <div className="flex-1 space-y-2 w-full">
              <label className="text-sm font-medium text-neutral-400 ml-1">Repository</label>
              <input
                type="text"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 outline-none transition-all placeholder:text-neutral-700"
                placeholder="e.g. next.js"
              />
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-[50px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Inspect Repo"}
            </button>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Results */}
        {data && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-xl">
                  <Star className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Stars</p>
                  <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-500">
                    {data.stars.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <GitFork className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Forks</p>
                  <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-blue-500">
                    {data.forks.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <FileText className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Primary Language</p>
                  <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-200 to-green-500">
                    {data.language}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Info & Contributors */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    Top Contributors
                  </h3>
                  <div className="space-y-4">
                    {data.contributors.map((contributor: any) => (
                      <div key={contributor.login} className="flex items-center gap-3 p-2 hover:bg-neutral-800 rounded-xl transition-colors">
                        <img 
                          src={contributor.avatar_url} 
                          alt={contributor.login}
                          className="w-10 h-10 rounded-full border border-neutral-700" 
                        />
                        <div className="overflow-hidden">
                          <p className="font-medium truncate">{contributor.login}</p>
                          <p className="text-xs text-neutral-500">{contributor.contributions} commits</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Readme */}
              <div className="lg:col-span-2">
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 h-[800px] overflow-y-auto custom-scrollbar">
                   <div className="flex items-center justify-between mb-6 sticky top-0 bg-neutral-900 z-10 py-2 border-b border-neutral-800">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-pink-400" />
                        README.md
                      </h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-neutral-800 text-neutral-400 uppercase tracking-wider">Markdown</span>
                   </div>
                   <div className="prose prose-invert prose-neutral max-w-none prose-img:rounded-xl prose-a:text-indigo-400 hover:prose-a:text-indigo-300">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {data.readme_content}
                      </ReactMarkdown>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
