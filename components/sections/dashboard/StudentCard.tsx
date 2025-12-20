"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Share2, MapPin, Briefcase, CheckCircle2, MoreHorizontal, Linkedin, Zap } from "lucide-react";

interface StudentProps {
  id: string;
  username?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  university?: string | null;
  hard_skills?: string[] | null;
  soft_skills?: string[] | null;
  linkedin_url?: string | null;
}

interface StudentStats {
  internshipsApplied?: number;
  programsApplied?: number;
  eventsApplied?: number;
  projectsCreated?: number;
}

const StudentCard: React.FC<{ student: StudentProps; stats?: StudentStats }> = ({ student, stats: initialStats }) => {
  if (!student) {
    return null;
  }

  const [isLiked, setIsLiked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [stats, setStats] = useState<StudentStats>(initialStats || {});
  const [isLoadingStats, setIsLoadingStats] = useState(!initialStats);
  const cardRef = useRef<HTMLDivElement>(null);

  const initials =
    student.full_name?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ST";

  const primarySkills = (student.hard_skills || []).slice(0, 3);
  const timeAgo = "Active";

  // Fetch stats from API only if not provided by server
  useEffect(() => {
    if (initialStats) {
      setStats(initialStats);
      setIsLoadingStats(false);
      return;
    }

    if (!student.id) {
      setIsLoadingStats(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/students/stats/${student.id}`);
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch student stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, [student.id, initialStats]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setIsVisible(true), Math.random() * 200);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMoreOptions = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const totalActivity = (stats?.internshipsApplied || 0) + 
                        (stats?.programsApplied || 0) + 
                        (stats?.eventsApplied || 0) + 
                        (stats?.projectsCreated || 0);

  return (
    <Link href={`/dashboard/student/${student.username || student.id}`} legacyBehavior>
      <a className="block no-underline">
        <div 
          ref={cardRef}
          className={`
            w-full bg-card border-b border-border hover:bg-muted/30 transition-all duration-300 cursor-pointer group
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
          `}
        >
          <div className="w-full px-4 py-4">
            {/* Header - Profile Info */}
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="relative shrink-0">
                {student.avatar_url ? (
                  <img 
                    src={student.avatar_url} 
                    alt={student.full_name || "Student"} 
                    className="w-12 h-12 rounded-full object-cover transition-opacity hover:opacity-90" 
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-base transition-colors group-hover:bg-primary/90">
                    {initials}
                  </div>
                )}
              </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 flex-wrap">
                  <h3 className="font-heading font-bold text-foreground group-hover:text-primary text-[15px] transition-colors leading-tight">
                    {student.username || student.full_name || "Unnamed Student"}
                  </h3>
                  <div className="shrink-0">
                    <CheckCircle2 size={16} className="text-primary" />
                  </div>
                  <span className="text-muted-foreground text-[15px]">·</span>
                  <span className="text-muted-foreground text-[13px]">{timeAgo}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <MapPin size={14} className="text-muted-foreground shrink-0" />
                  <p className="text-[13px] text-muted-foreground truncate">
                    {student.university || "University not specified"}
                  </p>
                </div>
              </div>

              {/* Connect Button & More */}
              <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
                {student.linkedin_url ? (
                  <Link
                    href={student.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    legacyBehavior
                  >
                    <a 
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-button text-button-foreground hover:bg-primary hover:text-white transition-all duration-300 border border-border"
                      title="Connect on LinkedIn"
                    >
                      <AtSign size={14} />
                    </a>
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground/30 border border-border cursor-not-allowed"
                  >
                    <Linkedin size={14} />
                  </button>
                )}
                <button
                  onClick={handleMoreOptions}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <MoreHorizontal size={16} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="mt-3 ml-[60px]">
          {/* Bio/Status */}
          <p className="text-[14px] text-foreground leading-relaxed mb-3 opacity-90">
            📊 Passionate about growth and impact. Currently focusing on {primarySkills[0] || 'projects'}. 
            {stats && totalActivity > 0 && ` Active contributor to the community.`}
          </p>

          {/* Skills Container */}
          {(primarySkills.length > 0 || (student.soft_skills && student.soft_skills.length > 0)) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {primarySkills.map((skill, i) => (
                <span 
                  key={i} 
                  onClick={(e) => e.preventDefault()}
                  className="text-[12px] bg-muted text-primary px-2.5 py-1 rounded-full font-semibold border border-transparent hover:border-primary transition-colors uppercase tracking-wider"
                >
                  {skill}
                </span>
              ))}
              {student.soft_skills && student.soft_skills.length > 0 && (
                <span 
                  onClick={(e) => e.preventDefault()}
                  className="text-[12px] bg-muted text-primary px-2.5 py-1 rounded-full font-semibold border border-transparent hover:border-primary transition-colors uppercase tracking-wider"
                >
                  {student.soft_skills[0]}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="mt-3 ml-[60px] flex items-center justify-between max-w-[200px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 group/btn hover:bg-muted px-2 py-1.5 rounded-full transition-all"
          >
            <Heart 
              size={16} 
              className={`transition-all ${isLiked 
                ? 'fill-destructive text-destructive' 
                : 'text-muted-foreground group-hover/btn:text-destructive'
              }`}
            />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="flex items-center gap-1.5 group/btn hover:bg-muted px-2 py-1.5 rounded-full transition-all"
          >
            <MessageCircle size={16} className="text-muted-foreground group-hover/btn:text-primary transition-colors" />
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 group/btn hover:bg-muted px-2 py-1.5 rounded-full transition-all"
          >
            <Share2 size={16} className="text-muted-foreground group-hover/btn:text-foreground transition-colors" />
          </button>
        </div>
      </div>
    </div>
  </a>
    </Link>
  );
};

interface StatItemProps {
  value: number;
  label: string;
  color?: string;
}

const StatItem: React.FC<StatItemProps> = ({ value, label, color = "text-gray-600" }) => (
  <div className="text-center">
    <div className={`text-lg font-bold ${color}`}>
      {value}
    </div>
    <div className="text-[10px] text-gray-500 font-medium">{label}</div>
  </div>
);

export default StudentCard;