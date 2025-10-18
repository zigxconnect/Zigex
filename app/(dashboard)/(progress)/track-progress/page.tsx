'use client';

import React, { useState, useMemo } from 'react';
import {
    Calendar, Clock, MessageCircle, Send, Edit3, Save, X, Plus, Hash, ThumbsUp, ThumbsDown, AlertTriangle, TreePine, Leaf, Sparkles, Sun, Cloud, ChevronDown, CheckCircle, BrainCircuit, MessageSquare // <-- Added BrainCircuit & MessageSquare
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
const LiveReports = dynamic(() => import('@components/LiveReports/LiveReports'), { ssr: false });

// --- INTERFACES & CONFIG (Unchanged) ---
interface ProgressEntry {
    id: string;
    date: string;
    whatILearned: string;
    lessonFeedback: string;
    skills: string[];
    isSubmitted: boolean;
    mentorComments: MentorComment[];
    pointsGained: number;
}

interface MentorComment {
    id: string;
    mentorName: string;
    content: string;
    remarkType: 'positive' | 'negative' | 'neutral';
    pointsEffect: number;
}

const PROGRESS_CONFIG = {
    dailyPost: 20,
    positiveRemark: 30,
    negativeRemark: -40,
};

// --- MOCK DATA (Unchanged) ---
const createInitialData = () => {
    let referenceDate = new Date();
    referenceDate.setDate(referenceDate.getDate() - 6);

    const entries: ProgressEntry[] = [
        { id: 'day1', date: new Date(referenceDate.setDate(referenceDate.getDate() + 1)).toISOString().split('T')[0], whatILearned: "Initial setup of the React environment using Vite. Learned the basic folder structure and JSX syntax.", lessonFeedback: "The getting started guide was very clear!", skills: ['React', 'Vite', 'JSX'], isSubmitted: true, pointsGained: 20, mentorComments: [] },
        { id: 'day2', date: new Date(referenceDate.setDate(referenceDate.getDate() + 1)).toISOString().split('T')[0], whatILearned: "Dove into components, props, and state. Built a simple counter application to understand how `useState` works.", lessonFeedback: "The concept of state is a bit tricky, but the examples helped. More practice needed.", skills: ['Components', 'Props', 'useState'], isSubmitted: true, pointsGained: 50, mentorComments: [{ id: 'c1', mentorName: 'Elena', content: "Excellent work grasping state so quickly!", remarkType: 'positive', pointsEffect: 30 }] },
        { id: 'day3', date: new Date(referenceDate.setDate(referenceDate.getDate() + 1)).toISOString().split('T')[0], whatILearned: "Tried to manage complex state with multiple `useState` hooks. It got confusing and led to bugs.", lessonFeedback: "Feeling a bit stuck today. The complexity ramped up quickly.", skills: ['State Management', 'Debugging'], isSubmitted: true, pointsGained: -20, mentorComments: [{ id: 'c2', mentorName: 'Elena', content: "This is a common hurdle. Don't worry. We'll introduce `useReducer` tomorrow to solve this exact problem. It's a critical learning moment.", remarkType: 'negative', pointsEffect: -40 }] },
        { id: 'day4', date: new Date(referenceDate.setDate(referenceDate.getDate() + 1)).toISOString().split('T')[0], whatILearned: "The `useReducer` hook is a game-changer! Refactored yesterday's counter and it's so much cleaner. The 'aha!' moment was real.", lessonFeedback: "Today's lesson perfectly addressed yesterday's struggles. Thank you!", skills: ['useReducer', 'Refactoring'], isSubmitted: true, pointsGained: 50, mentorComments: [{ id: 'c3', mentorName: 'Elena', content: "Fantastic turnaround! This is what real-world development feels like. You pushed through a challenge and found a better solution.", remarkType: 'positive', pointsEffect: 30 }] },
        { id: 'day5', date: new Date(referenceDate.setDate(referenceDate.getDate() + 1)).toISOString().split('T')[0], whatILearned: "Learned about the Effect Hook (`useEffect`) for handling side effects like data fetching. Built a component that fetches user data from an API.", lessonFeedback: "The cleanup function in `useEffect` is a bit abstract, but I see why it's important.", skills: ['useEffect', 'API', 'Async'], isSubmitted: true, pointsGained: 20, mentorComments: [] },
    ];
    const totalPoints = entries.reduce((sum, entry) => sum + entry.pointsGained, 100);
    return { entries, totalPoints };
};

// --- CREATIVE PROGRESS TREE VISUAL (Unchanged) ---
const treeStages = [
    { threshold: -Infinity, name: "Withered", trunkHeight: 20, branches: 0, leaves: 0, color: "bg-gray-400", sky: "bg-gray-200", icon: <AlertTriangle className="text-gray-500" /> },
    { threshold: 0, name: "Seed", trunkHeight: 5, branches: 0, leaves: 0, color: "bg-yellow-700", sky: "bg-sky-100", icon: <Leaf className="text-yellow-800" /> },
    { threshold: 50, name: "Sprout", trunkHeight: 30, branches: 0, leaves: 3, color: "bg-lime-600", sky: "bg-sky-200", icon: <Leaf className="text-lime-700" /> },
    { threshold: 150, name: "Sapling", trunkHeight: 60, branches: 2, leaves: 8, color: "bg-green-600", sky: "bg-cyan-200", icon: <TreePine className="text-green-700" /> },
    { threshold: 300, name: "Young Tree", trunkHeight: 90, branches: 4, leaves: 15, color: "bg-emerald-600", sky: "bg-blue-300", icon: <BrainCircuit className="text-emerald-700" /> },
    { threshold: 500, name: "Flourishing Tree", trunkHeight: 120, branches: 6, leaves: 25, color: "bg-teal-600", sky: "bg-indigo-300", icon: <Sparkles className="text-teal-500" /> }
];
const getStage = (points: number) => treeStages.slice().reverse().find(s => points >= s.threshold) || treeStages[0];
const ProgressTreeVisual = ({ points }: { points: number }) => {
    const stage = useMemo(() => getStage(points), [points]);
    const nextStage = treeStages.find(s => s.threshold > points);
    const progressPercentage = useMemo(() => {
        if (!nextStage) return 100;
        const stageStart = stage.threshold;
        const stageEnd = nextStage.threshold;
        return Math.max(0, ((points - stageStart) / (stageEnd - stageStart)) * 100);
    }, [points, stage, nextStage]);

    return (
        <motion.div layout className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-hidden">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                <div className="w-full md:w-1/3 h-48 flex items-center justify-center">
                    <motion.div animate={{ backgroundColor: stage.sky }} className="w-full h-full rounded-lg flex items-end justify-center relative transition-colors duration-500">
                        <AnimatePresence>
                            {points > 300 && (<motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="absolute top-4 right-4"><Sun className="w-10 h-10 text-yellow-400" /></motion.div>)}
                            {points < 0 && (<motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="absolute top-4 left-4"><Cloud className="w-10 h-10 text-gray-400" /></motion.div>)}
                        </AnimatePresence>
                        <div className="relative flex items-end" style={{ height: '100%' }}>
                            <motion.div layout animate={{ height: `${stage.trunkHeight}px`, backgroundColor: stage.color }} className={`w-4 rounded-t-md relative transition-colors duration-500`}>
                                {Array.from({ length: stage.branches }).map((_, i) => (<motion.div key={i} initial={{ scaleX: 0 }} animate={{ scaleX: 1, transition: { delay: i * 0.1 } }} className={`absolute h-1 w-8 ${stage.color} rounded-md`} style={{ top: `${20 + i * 15}%`, left: i % 2 === 0 ? '-100%' : '100%', transformOrigin: i % 2 === 0 ? 'right' : 'left' }} />))}
                                <div className="absolute -top-4 -left-2 w-8 h-8"><AnimatePresence>{Array.from({ length: stage.leaves }).map((_, i) => (<motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: i * 0.05 } }} exit={{ scale: 0 }} className="absolute w-4 h-4 bg-green-500 rounded-full" style={{ top: `${Math.random() * 80}%`, left: `${Math.random() * 80}%`, }} />))}</AnimatePresence></div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
                <div className="w-full md:w-2/3">
                    <div className="flex items-center space-x-3 mb-2">
                        <span className={`p-2 rounded-full ${stage.color} bg-opacity-20`}>{stage.icon}</span>
                        <h2 className="text-2xl font-bold text-gray-800">{stage.name}</h2>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">You have <span className="font-bold text-gray-700">{points}</span> points. {nextStage && `Only ${nextStage.threshold - points} more to reach ${nextStage.name}!`}</p>
                    <div className="w-full bg-gray-200 rounded-full h-3"><motion.div className={`h-3 rounded-full ${stage.color}`} initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} /></div>
                </div>
            </div>
        </motion.div>
    );
};


// --- ACCORDION ITEM COMPONENT (WITH STYLING CHANGES) ---
const AccordionItem = ({ entry, onUpdate, onAddComment, isOpen, onToggle, isEditing, onSetEditing }: { entry: ProgressEntry, onUpdate: (id: string, field: string, value: any) => void, onAddComment: (entryId: string, remarkType: 'positive' | 'negative', content: string) => void, isOpen: boolean, onToggle: () => void, isEditing: boolean, onSetEditing: (isEditing: boolean) => void }) => {
    const [newComment, setNewComment] = useState('');
    const pointsClass = entry.pointsGained > 0 ? "text-green-600" : entry.pointsGained < 0 ? "text-red-600" : "text-gray-500";

    const handleCommentSubmit = (remarkType: 'positive' | 'negative') => {
        if (!newComment.trim()) return;
        onAddComment(entry.id, remarkType, newComment);
        setNewComment('');
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <motion.div layout onClick={onToggle} className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                    {entry.pointsGained > 0 ? <CheckCircle className="w-6 h-6 text-green-500" /> : <AlertTriangle className="w-6 h-6 text-red-500" />}
                    <div>
                        <h3 className="font-bold text-gray-800">Daily Report: {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
                        <p className={`text-sm font-semibold ${pointsClass}`}>{entry.pointsGained > 0 ? '+' : ''}{entry.pointsGained} Points</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    {!isEditing && <button onClick={(e) => { e.stopPropagation(); onSetEditing(true); }} className="text-sm text-blue-600 hover:underline">Edit</button>}
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }}><ChevronDown className="w-5 h-5 text-gray-500" /></motion.div>
                </div>
            </motion.div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="p-6 border-t border-gray-200 space-y-6">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div><label className="font-semibold text-gray-700">What I Learned</label><textarea value={entry.whatILearned} onChange={e => onUpdate(entry.id, 'whatILearned', e.target.value)} className="w-full mt-1 p-2 border rounded-md" /></div>
                                    <div><label className="font-semibold text-gray-700">Lesson Feedback</label><textarea value={entry.lessonFeedback} onChange={e => onUpdate(entry.id, 'lessonFeedback', e.target.value)} className="w-full mt-1 p-2 border rounded-md" /></div>
                                    <div className="flex justify-end"><button onClick={() => onSetEditing(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button></div>
                                </div>
                            ) : (
                                // *** STYLING ENHANCEMENT IS HERE ***
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-blue-100 p-2 rounded-full"><BrainCircuit className="w-5 h-5 text-blue-600" /></div>
                                            <h4 className="text-lg font-bold text-gray-800">What I Learned</h4>
                                        </div>
                                        <div className="prose prose-sm max-w-none mt-2 pl-12 text-gray-600"><ReactMarkdown>{entry.whatILearned || "No details provided."}</ReactMarkdown></div>
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-purple-100 p-2 rounded-full"><MessageSquare className="w-5 h-5 text-purple-600" /></div>
                                            <h4 className="text-lg font-bold text-gray-800">Lesson Feedback</h4>
                                        </div>
                                        <div className="prose prose-sm max-w-none mt-2 pl-12 text-gray-600"><ReactMarkdown>{entry.lessonFeedback || "No feedback provided."}</ReactMarkdown></div>
                                    </div>
                                </div>
                            )}
                            <div className="pt-6 border-t space-y-4">
                                <h4 className="font-semibold">Mentor Feedback</h4>
                                {entry.mentorComments.map(comment => {
                                    const Icon = comment.remarkType === 'positive' ? ThumbsUp : ThumbsDown;
                                    return (
                                        <div key={comment.id} className="flex items-start space-x-3">
                                            <div className={`p-2 rounded-full text-white ${comment.remarkType === 'positive' ? 'bg-green-500' : 'bg-red-500'}`}><Icon size={16} /></div>
                                            <div className="flex-1"><p className="text-sm text-gray-700">{comment.content} <span className={`font-bold ${comment.remarkType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>({comment.pointsEffect > 0 ? '+' : ''}{comment.pointsEffect} pts)</span></p></div>
                                        </div>
                                    );
                                })}
                                {!entry.mentorComments.length && <p className="text-sm text-gray-500">No feedback yet.</p>}
                                <div className="flex items-start space-x-3 pt-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
                                    <div className="flex-1">
                                        <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Provide constructive feedback..." className="w-full text-sm p-2 border rounded-md" />
                                        <div className="flex justify-end space-x-2 mt-2">
                                            <button onClick={() => handleCommentSubmit('negative')} className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200">Needs Work</button>
                                            <button onClick={() => handleCommentSubmit('positive')} className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200">Great Job</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


// --- MAIN COMPONENT (Unchanged) ---
const ProgressTreeTracker: React.FC = () => {
    const { entries: initialEntries, totalPoints: initialPoints } = useMemo(() => createInitialData(), []);
    const [entries, setEntries] = useState<ProgressEntry[]>(initialEntries);
    const [progressPoints, setProgressPoints] = useState<number>(initialPoints);
    const [openAccordionId, setOpenAccordionId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    const todayStr = new Date().toISOString().split('T')[0];
    const hasPostedToday = entries.some(e => e.date === todayStr);
    // TODO: replace with actual authenticated user email from Supabase session
    const currentUserEmail = typeof window !== 'undefined' ? (window as any).__USER_EMAIL__ || '' : '';

    const handleCreateReport = () => {
        const newEntry: ProgressEntry = { id: `day-${Date.now()}`, date: todayStr, whatILearned: "", lessonFeedback: "", skills: [], isSubmitted: true, pointsGained: PROGRESS_CONFIG.dailyPost, mentorComments: [] };
        setEntries(prev => [...prev, newEntry]);
        setProgressPoints(prev => prev + PROGRESS_CONFIG.dailyPost);
        setEditingId(newEntry.id);
        setOpenAccordionId(newEntry.id);
    };

    const handleUpdateEntry = (id: string, field: string, value: any) => {
        setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const handleAddComment = (entryId: string, remarkType: 'positive' | 'negative', content: string) => {
        const pointsEffect = remarkType === 'positive' ? PROGRESS_CONFIG.positiveRemark : PROGRESS_CONFIG.negativeRemark;
        const newComment: MentorComment = { id: `c-${Date.now()}`, mentorName: 'Elena', content, remarkType, pointsEffect };
        setEntries(prev => prev.map(e => (e.id === entryId) ? { ...e, mentorComments: [...e.mentorComments, newComment], pointsGained: e.pointsGained + pointsEffect } : e));
        setProgressPoints(prev => prev + pointsEffect);
    };

    const sortedEntries = useMemo(() => entries.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [entries]);

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <ProgressTreeVisual points={progressPoints} />
                <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Progress History</h2>
                {!hasPostedToday && (
                    <div className="bg-white rounded-xl border-2 border-dashed border-blue-300 p-6 text-center">
                        <h3 className="text-lg font-semibold text-gray-800">Ready to grow?</h3>
                        <p className="text-gray-500 mb-4">Log your progress for today to nurture your tree.</p>
                        <button onClick={handleCreateReport} className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg"><Plus /><span>Create Today's Report</span></button>
                    </div>
                )}
                    <div className="space-y-4">
                    {sortedEntries.map(entry => (
                        <AccordionItem
                            key={entry.id}
                            entry={entry}
                            isOpen={openAccordionId === entry.id}
                            onToggle={() => setOpenAccordionId(openAccordionId === entry.id ? null : entry.id)}
                            isEditing={editingId === entry.id}
                            onSetEditing={(isEditing) => setEditingId(isEditing ? entry.id : null)}
                            onUpdate={handleUpdateEntry}
                            onAddComment={handleAddComment}
                        />
                    ))}
                    </div>
                </div>
                <aside className="md:col-span-1">
                    {/* Live collaborative reports pane */}
                    {process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY ? (
                        <LiveReports programId={"program-1"} studentId={"student-1"} />
                    ) : (
                        <div className="bg-white rounded-xl border p-4 text-sm text-gray-500">Enable Liveblocks by setting <code>NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY</code> in your env to see live collaboration.</div>
                    )}
                    {/* Mentor quick actions (mock gating) */}
                    {currentUserEmail === 'fonyuyjudegita@gmail.com' && (
                        <div className="mt-4 bg-white rounded-xl border p-4">
                            <h4 className="font-semibold">Mentor Actions</h4>
                            <p className="text-sm text-gray-500">As the mentor you can add feedback and sign reports here.</p>
                            {/* TODO: wire mentor actions to feedback endpoint */}
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default ProgressTreeTracker;