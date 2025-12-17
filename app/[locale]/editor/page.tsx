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
  const mode = searchParams.get('mode'); // 'task' o 'session'
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
    <div className="h-screen flex flex-col">
      <div className="border-b bg-white px-4 py-2 flex items-center justify-between">
        <h1 className="font-semibold text-gray-800">{t('editor.title')}</h1>
        <div className="text-sm text-gray-500">{t('editor.subtitle')}</div>
      </div>
      <div className="flex-1">
        <TacticalEditor 
          mode={mode || undefined}
          designId={designId}
          onDesignSaved={returnTo ? handleDesignSaved : undefined}
        />
      </div>
    </div>
  );
}
