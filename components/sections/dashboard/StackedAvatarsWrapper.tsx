'use client';

import { useRouter } from 'next/navigation';
import StackedAvatars from './StackedAvatars';

interface StackedAvatarsWrapperProps {
  avatars: Array<{ src?: string; name: string }>;
  maxVisible?: number;
  moreCount?: number;
  studentId: string;
}

export default function StackedAvatarsWrapper({ 
  avatars, 
  maxVisible = 3, 
  moreCount, 
  studentId 
}: StackedAvatarsWrapperProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/dashboard/student/${studentId}`);
  };

  return (
    <StackedAvatars
      avatars={avatars}
      maxVisible={maxVisible}
      moreCount={moreCount}
      onClick={handleClick}
    />
  );
}