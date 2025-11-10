import { PROJECT_DURATIONS } from "@/app/types/project.types";

export interface ProjectDuration {
  startDate: Date;
  endDate: Date;
  isExpired: boolean;
}

export function calculateProjectEndDate(duration: string, startDate: Date = new Date()): Date {
  const durationMap = {
    "1-month": 1,
    "2-months": 2,
    "3-months": 3,
    "6-months": 6,
    "1-year": 12,
    "1-year-plus": 24,
    "ongoing": 0
  };

  const months = durationMap[duration as keyof typeof durationMap] || 0;
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + months);
  return endDate;
}

export function isProjectExpired(endDate: Date): boolean {
  return new Date() > endDate;
}

export function formatRemainingTime(endDate: Date): string {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  
  if (diff <= 0) return "Expired";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  
  if (months > 0) {
    return `${months} month${months > 1 ? 's' : ''} remaining`;
  }
  return `${days} day${days > 1 ? 's' : ''} remaining`;
}

export function getProjectDurationInfo(project: { startDate: Date; duration: string }): ProjectDuration {
  const startDate = new Date(project.startDate);
  const endDate = calculateProjectEndDate(project.duration, startDate);
  const isExpired = isProjectExpired(endDate);

  return {
    startDate,
    endDate,
    isExpired
  };
}