'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GoalkeeperWithTeam, Team } from '@/lib/types/database';
import { apiGet, apiPut } from '@/lib/utils/api';

export default function EditGoalkeeperPage() {
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations('goalkeepers');
  const tc = useTranslations('common');
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    height: '',
    weight: '',
    nationality: '',
    photo: '',
    dominant_hand: '',
    team_id: '',
    jersey_number: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [gkData, teamsData] = await Promise.all([
          apiGet<{ goalkeeper: GoalkeeperWithTeam }>(`/api/goalkeepers/${params.id}`),
          apiGet<{ teams: Team[] }>('/api/teams')
        ]);
        
        const gk = gkData.goalkeeper;
        setFormData({
          first_name: gk.first_name,
          last_name: gk.last_name,
          date_of_birth: gk.date_of_birth ? new Date(gk.date_of_birth).toISOString().split('T')[0] : '',
          height: gk.height?.toString() || '',
          weight: gk.weight?.toString() || '',
          nationality: gk.nationality || '',
          photo: gk.photo || '',
          dominant_hand: gk.dominant_hand || '',
          team_id: gk.team_id?.toString() || '',
          jersey_number: gk.jersey_number?.toString() || '',
          notes: gk.notes || '',
        });
        setTeams(teamsData.teams || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errorLoading'));
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      const payload = {
        ...formData,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        team_id: formData.team_id ? parseInt(formData.team_id) : null,
        jersey_number: formData.jersey_number ? parseInt(formData.jersey_number) : null,
        dominant_hand: formData.dominant_hand || null,
        date_of_birth: formData.date_of_birth || null,
        nationality: formData.nationality || null,
        photo: formData.photo || null,
        notes: formData.notes || null,
      };

      await apiPut(`/api/goalkeepers/${params.id}`, payload);
      router.push(`/${locale}/goalkeepers/${params.id}`);
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
    
      <div>
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/goalkeepers/${params.id}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {tc('back')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{t('editGoalkeeper')}</h1>
          <p className="mt-1 text-gray-600">{t('editGoalkeeperSubtitle')}</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('basicInfo')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label={t('firstName')}
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label={t('lastName')}
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('team')}
                </label>
                <select
                  name="team_id"
                  value={formData.team_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{t('selectTeam')}</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name} - {team.category}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label={t('jerseyNumber')}
                name="jersey_number"
                type="number"
                value={formData.jersey_number}
                onChange={handleChange}
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('physicalStats')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label={t('dateOfBirth')}
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
                <Input
                  label={t('height')}
                  name="height"
                  type="number"
                  step="0.01"
                  value={formData.height}
                  onChange={handleChange}
                />
                <Input
                  label={t('weight')}
                  name="weight"
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('personalInfo')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label={t('nationality')}
                  name="nationality"
                  type="text"
                  value={formData.nationality}
                  onChange={handleChange}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('dominantHand')}
                  </label>
                  <select
                    name="dominant_hand"
                    value={formData.dominant_hand}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{t('selectDominantHand')}</option>
                    <option value="left">{t('leftHand')}</option>
                    <option value="right">{t('rightHand')}</option>
                    <option value="both">{t('bothHands')}</option>
                  </select>
                </div>
              </div>
              <div className="mt-6">
                <Input
                  label={t('photo')}
                  name="photo"
                  type="url"
                  value={formData.photo}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('notes')}
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSaving}
                className="flex-1"
              >
                {tc('save')}
              </Button>
              <Link href={`/${locale}/goalkeepers/${params.id}`} className="flex-1">
                <Button type="button" variant="secondary" className="w-full">
                  {tc('cancel')}
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    
  );
}
