"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  MessageCircle, 
  Lightbulb, 
  HelpCircle, 
  AlertTriangle,
  Check,
  X,
  Loader2,
  ChevronDown
} from "lucide-react";

interface BlogFeedbackFormProps {
  postTitle: string;
  postSlug: string;
}

type FeedbackType = 'comment' | 'suggestion' | 'question' | 'issue';

const feedbackTypes: { value: FeedbackType; label: string; icon: any; color: string }[] = [
  { value: 'comment', label: 'Comment', icon: MessageCircle, color: 'blue' },
  { value: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: 'green' },
  { value: 'question', label: 'Question', icon: HelpCircle, color: 'amber' },
  { value: 'issue', label: 'Report Issue', icon: AlertTriangle, color: 'red' },
];

export default function BlogFeedbackForm({ postTitle, postSlug }: BlogFeedbackFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('comment');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/blog/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postTitle,
          postSlug,
          senderName: name,
          senderEmail: email,
          message,
          feedbackType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        // Reset form after success
        setTimeout(() => {
          setName('');
          setEmail('');
          setMessage('');
          setFeedbackType('comment');
          setIsOpen(false);
          setSubmitStatus('idle');
        }, 3000);
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Something went wrong');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = feedbackTypes.find(t => t.value === feedbackType)!;

  return (
    <div className="mt-16 border-t border-slate-100 pt-12">
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group"
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm group-hover:shadow-md transition-shadow">
            <MessageCircle size={24} />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-slate-900">Share Your Thoughts</h3>
            <p className="text-sm text-slate-500">Have feedback? We'd love to hear from you!</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm"
        >
          <ChevronDown size={20} />
        </motion.div>
      </motion.button>

      {/* Form Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="p-6 md:p-8 bg-white rounded-2xl border border-slate-100 mt-4 shadow-sm">
              
              {/* Success State */}
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                    <Check size={32} strokeWidth={3} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Thank You!</h4>
                  <p className="text-slate-500">Your feedback has been sent successfully.</p>
                </motion.div>
              )}

              {submitStatus !== 'success' && (
                <>
                  {/* Feedback Type Selection */}
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Type of Feedback
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {feedbackTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = feedbackType === type.value;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setFeedbackType(type.value)}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                              isSelected
                                ? `border-${type.color}-500 bg-${type.color}-50 text-${type.color}-600`
                                : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                            }`}
                            style={{
                              borderColor: isSelected 
                                ? type.color === 'blue' ? '#3b82f6' 
                                : type.color === 'green' ? '#22c55e'
                                : type.color === 'amber' ? '#f59e0b'
                                : '#ef4444'
                                : undefined,
                              backgroundColor: isSelected
                                ? type.color === 'blue' ? '#eff6ff'
                                : type.color === 'green' ? '#f0fdf4'
                                : type.color === 'amber' ? '#fefce8'
                                : '#fef2f2'
                                : undefined,
                              color: isSelected
                                ? type.color === 'blue' ? '#2563eb'
                                : type.color === 'green' ? '#16a34a'
                                : type.color === 'amber' ? '#d97706'
                                : '#dc2626'
                                : undefined
                            }}
                          >
                            <Icon size={20} />
                            <span className="text-xs font-bold">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Your Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Your Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Share your thoughts, questions, or suggestions..."
                      required
                      rows={5}
                      maxLength={2000}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    />
                    <p className="text-xs text-slate-400 mt-1 text-right">{message.length}/2000</p>
                  </div>

                  {/* Error Message */}
                  {submitStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 mb-4"
                    >
                      <X size={18} />
                      <span className="text-sm font-medium">{errorMessage}</span>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting || !name || !email || !message}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-900/10"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Feedback
                      </>
                    )}
                  </motion.button>

                  <p className="text-xs text-slate-400 text-center mt-4">
                    Your feedback will be sent directly to the Zigex team. We'll respond via email if needed.
                  </p>
                </>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
