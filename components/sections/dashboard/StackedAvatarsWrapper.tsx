'use client';

import { useRouter } from 'next/navigation';
import StackedAvatars from './StackedAvatars';
import { slugifyUsername } from '@/lib/utils';

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
    router.push(`/dashboard/student/${slugifyUsername(studentId)}`);
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