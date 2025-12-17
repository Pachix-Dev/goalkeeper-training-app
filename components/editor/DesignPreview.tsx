"use client";

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/utils/api';
import Image from 'next/image';

interface DesignPreviewProps {
  designId: number;
  className?: string;
}

interface DesignData {
  id: number;
  title: string;
  img?: string | null;
  created_at: string;
  updated_at: string;
}

export default function DesignPreview({ designId, className = '' }: DesignPreviewProps) {
  const [design, setDesign] = useState<DesignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDesign = async () => {
      try {
        const data = await apiGet<{ design: DesignData }>(`/api/editor/designs/${designId}`);
        setDesign(data.design);
      } catch (err) {
        console.error('Error loading design:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDesign();
  }, [designId]);
        

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-gray-500">Cargando diagrama...</div>
      </div>
    );
  }

  if (error || !design) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-gray-500">No se pudo cargar el diagrama</div>
      </div>
    );
  }

  if (!design.img) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-gray-500">No hay imagen del diagrama</div>
      </div>
    );
  }

  return (    
    <Image
      src={`/api/designs/${design.img}`}
      alt={design.title || 'Diagrama táctico'}
      className={`relative ${className} border-2 border-black/70`}
      width={1623}                      
      height={1014}
    />    
  );
}
