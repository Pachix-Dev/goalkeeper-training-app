"use client";

import dynamic from 'next/dynamic';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';

const TacticalEditor = dynamic(() => import('@/components/editor/TacticalEditor'), { ssr: false });

export default function EditorPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

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

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b bg-white px-4 py-2 flex items-center justify-between">
        <h1 className="font-semibold text-gray-800">{t('editor.title')}</h1>
        <div className="text-sm text-gray-500">{t('editor.subtitle')}</div>
      </div>
      <div className="flex-1">
        <TacticalEditor />
      </div>
    </div>
  );
}
