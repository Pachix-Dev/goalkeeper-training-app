"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Modal } from '@/components/ui/Modal';

const DesignPreview = dynamic(() => import('./DesignPreview'), { ssr: false });

interface DiagramModalProps {
  designId: number;
  title: string;
  onClose: () => void;
}

export function DiagramModal({ designId, title, onClose }: DiagramModalProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title={title}
      size="xl"
    >
      <div className="w-full h-full p-4">
        <DesignPreview 
          designId={designId} 
          className="w-full max-w-6xl mx-auto rounded-lg border" 
        />
      </div>
    </Modal>
  );
}
