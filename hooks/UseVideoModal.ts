import { useState } from "react";

export const useVideoModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    videoUrl?: string;
    title: string;
    company: string;
    description?: string;
    thumbnail?: string;
    viewerCount?: number;
  } | null>(null);



  

  const openModal = (data: {
    videoUrl?: string;
    title: string;
    company: string;
    description?: string;
    thumbnail?: string;
    viewerCount?: number;
  }) => {
    setModalData(data);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => setModalData(null), 300); // Delay to allow close animation
  };

  return {
    isOpen,
    modalData,
    openModal,
    closeModal,
  };
};