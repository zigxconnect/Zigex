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
    name: 'Alex Johnson',
    role: 'Lead Developer',
    initials: 'AJ',
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
  },
  {
    id: '2',
    name: 'Sarah Smith',
    role: 'Full Stack',
    initials: 'SS',
    color: 'bg-gradient-to-br from-purple-500 to-purple-600',
  },
  {
    id: '3',
    name: 'Mike Chen',
    role: 'Backend Dev',
    initials: 'MC',
    color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
  },
  {
    id: '4',
    name: 'Emma Davis',
    role: 'Frontend Dev',
    initials: 'ED',
    color: 'bg-gradient-to-br from-orange-500 to-orange-600',
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
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{subtitle}</p>
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
                  className={`${sizeClasses[size]} rounded-full border-2 border-white object-cover shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:z-50 cursor-pointer flex-shrink-0`}
                  style={{ aspectRatio: '1 / 1' }}
                />
              ) : (
                <div
                  className={`${sizeClasses[size]} ${dev.color || 'bg-gradient-to-br from-gray-400 to-gray-500'} rounded-full border-2 border-white flex items-center justify-center text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:z-50 cursor-pointer flex-shrink-0`}
                >
                  {dev.initials}
                </div>
              )}

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none shadow-lg z-50">
                <div className="font-semibold">{dev.name}</div>
                <div className="text-gray-300">{dev.role}</div>
              </div>
            </div>
          ))}

          {/* Remaining Count */}
          {remainingCount > 0 && (
            <div
              className={`${sizeClasses[size]} bg-gradient-to-br from-gray-400 to-gray-500 rounded-full border-2 border-white flex items-center justify-center text-white font-bold shadow-lg text-xs`}
            >
              +{remainingCount}
            </div>
          )}
        </div>

        {/* Optional: Total Count */}
        <span className="text-sm font-medium text-gray-700">
          {developers.length} {developers.length === 1 ? 'Developer' : 'Developers'}
        </span>
      </div>

      {/* Detailed Labels (Optional) */}
      {showLabels && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {displayedDevelopers.map((dev) => (
            <div
              key={dev.id}
              className="text-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="font-semibold text-sm text-gray-900">{dev.name}</div>
              <div className="text-xs text-gray-600">{dev.role}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeveloperAvatarOverlap;
