'use client';

import React from 'react';

interface Developer {
  id: string;
  name: string;
  role: string;
  initials?: string;
  color?: string;
  avatar?: string;
}

interface DeveloperAvatarOverlapProps {
  developers?: Developer[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  title?: string;
  subtitle?: string;
}

const defaultDevelopers: Developer[] = [
  {
    id: '1',
    name: 'Abdul Fadiga',
    role: 'AI Research Scientist',
    initials: 'AF',
    avatar: 'https://i.ibb.co/wFVCrg5K/Whats-App-Image-2025-11-23-at-11-14-41-AM.jpg',
  },
  {
    id: '2',
    name: 'Tayuh Favour',
    role: 'Frontend & ML',
    initials: 'TF',
    avatar: 'https://i.ibb.co/JFpCHS9h/Whats-App-Image-2025-11-23-at-11-12-52-AM.jpg',
  },
  {
    id: '3',
    name: 'John Brindi',
    role: 'Backend Engineer',
    initials: 'JB',
    avatar: 'https://i.ibb.co/xqWXw548/Whats-App-Image-2025-11-23-at-12-38-01-PM.jpg',
  },
  {
    id: '4',
    name: 'Tracy Jacy',
    role: 'Cybersecurity',
    initials: 'TJ',
    avatar: 'https://i.ibb.co/zH2c0MhN/Whats-App-Image-2025-11-23-at-2-56-03-PM.jpg',
  },
];

const sizeClasses = {
  sm: 'w-12 h-12 text-xs',
  md: 'w-16 h-16 text-sm',
  lg: 'w-20 h-20 text-base',
};

const negativeMarginsClasses = {
  sm: '-ml-3',
  md: '-ml-4',
  lg: '-ml-6',
};

const borderClasses = {
  sm: 'border-2',
  md: 'border-3',
  lg: 'border-4',
};

export const DeveloperAvatarOverlap: React.FC<DeveloperAvatarOverlapProps> = ({
  developers = defaultDevelopers,
  maxDisplay = 4,
  size = 'md',
  showLabels = false,
  title = 'Meet Our Team',
  subtitle = 'Passionate developers building the future',
}) => {
  const displayedDevelopers = developers.slice(0, maxDisplay);
  const remainingCount = Math.max(0, developers.length - maxDisplay);

  return (
    <div className="space-y-4">
      {/* Title and Subtitle */}
      <div>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {/* Avatar Overlap Container */}
      <div className="flex items-center gap-2">
        {/* Avatars */}
        <div className="flex items-center -space-x-3">
          {displayedDevelopers.map((dev, index) => (
            <div
              key={dev.id}
              className="relative group"
              style={{
                zIndex: displayedDevelopers.length - index,
              }}
            >
              {/* Avatar */}
              {dev.avatar ? (
                <img
                  src={dev.avatar}
                  alt={dev.name}
                  className={`${sizeClasses[size]} rounded-full border-2 border-background object-cover shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:z-50 cursor-pointer flex-shrink-0`}
                  style={{ aspectRatio: '1 / 1' }}
                />
              ) : (
                <div
                  className={`${sizeClasses[size]} ${dev.color || 'bg-gradient-to-br from-muted-foreground to-muted-foreground/80'} rounded-full border-2 border-background flex items-center justify-center text-primary-foreground font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:z-50 cursor-pointer flex-shrink-0`}
                >
                  {dev.initials}
                </div>
              )}

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none shadow-lg z-50">
                <div className="font-semibold">{dev.name}</div>
                <div className="text-muted-foreground">{dev.role}</div>
              </div>
            </div>
          ))}

          {/* Remaining Count */}
          {remainingCount > 0 && (
            <div
              className={`${sizeClasses[size]} bg-gradient-to-br from-muted-foreground to-muted-foreground/80 rounded-full border-background border-2 flex items-center justify-center text-primary-foreground font-bold shadow-lg text-xs`}
            >
              +{remainingCount}
            </div>
          )}
        </div>

        {/* Optional: Total Count */}
        <span className="text-sm font-medium text-muted-foreground">
          {developers.length} {developers.length === 1 ? 'Developer' : 'Developers'}
        </span>
      </div>

      {/* Detailed Labels (Optional) */}
      {showLabels && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {displayedDevelopers.map((dev) => (
            <div
              key={dev.id}
              className="text-center p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <div className="font-semibold text-sm text-foreground">{dev.name}</div>
              <div className="text-xs text-muted-foreground">{dev.role}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeveloperAvatarOverlap;
