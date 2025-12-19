"use client";

import dynamic from 'next/dynamic';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';

const TacticalEditor = dynamic(() => import('@/components/editor/TacticalEditor'), { ssr: false });

export default function EditorPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  
  const returnTo = searchParams.get('returnTo');
  const designIdParam = searchParams.get('design_id');
  const designId = designIdParam ? parseInt(designIdParam) : undefined;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isAuthenticated, isLoading, router, locale]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const handleDesignSaved = (designId: number) => {
    if (returnTo) {
      const url = new URL(decodeURIComponent(returnTo), window.location.origin);
      url.searchParams.set('design_id', designId.toString());
      router.push(url.pathname + url.search);
    }
  };

  return (
    <div className="flex flex-col">      
      <div className="flex-1">
        <TacticalEditor           
          designId={designId}
          onDesignSaved={returnTo ? handleDesignSaved : undefined}          
        />
      </div>
    </div>
  );
}
