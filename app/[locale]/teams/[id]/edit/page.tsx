'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TeamWithStats } from '@/lib/types/database';
import { apiGet, apiPut } from '@/lib/utils/api';

export default function EditTeamPage() {
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations('teams');
  const tc = useTranslations('common');
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    season: '',
    description: '',
    color: '#2563eb',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setIsLoading(true);
        const data = await apiGet<{ team: TeamWithStats }>(`/api/teams/${params.id}`);
        setFormData({
          name: data.team.name,
          category: data.team.category,
          season: data.team.season,
          description: data.team.description || '',
          color: data.team.color,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errorLoading'));
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchTeam();
    }
  }, [params.id, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      await apiPut(`/api/teams/${params.id}`, formData);
      router.push(`/${locale}/teams/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorUpdating'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{tc('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/teams/${params.id}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {tc('back')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{t('editTeam')}</h1>
          <p className="mt-1 text-gray-600">{t('editTeamSubtitle')}</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <Input
                label={t('name')}
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('namePlaceholder')}
                required
              />
            </div>

            {/* Category & Season */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label={t('category')}
                  name="category"
                  type="text"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder={t('categoryPlaceholder')}
                  required
                />
              </div>
              <div>
                <Input
                  label={t('season')}
                  name="season"
                  type="text"
                  value={formData.season}
                  onChange={handleChange}
                  placeholder={t('seasonPlaceholder')}
                  required
                />
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('color')}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="h-12 w-20 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={handleChange}
                  name="color"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="#2563eb"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('description')}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder={t('descriptionPlaceholder')}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSaving}
                className="flex-1"
              >
                {tc('save')}
              </Button>
              <Link href={`/${locale}/teams/${params.id}`} className="flex-1">
                <Button type="button" variant="secondary" className="w-full">
                  {tc('cancel')}
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
