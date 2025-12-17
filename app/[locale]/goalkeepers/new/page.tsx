'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Team } from '@/lib/types/database';
import { apiPost, apiGet } from '@/lib/utils/api';

export default function NewGoalkeeperPage() {
  const router = useRouter();
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await apiGet<{ teams: Team[] }>('/api/teams');
        setTeams(data.teams || []);
      } catch (err) {
        console.error('Error loading teams:', err);
      }
    };
    fetchTeams();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

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

      await apiPost('/api/goalkeepers', payload);
      router.push(`/${locale}/goalkeepers`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorCreating'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/goalkeepers`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {tc('back')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{t('createGoalkeeper')}</h1>
          <p className="mt-1 text-gray-600">{t('subtitle')}</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('basicInfo')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label={t('firstName')}
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder={t('firstNamePlaceholder')}
                  required
                />
                <Input
                  label={t('lastName')}
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder={t('lastNamePlaceholder')}
                  required
                />
              </div>
            </div>

            {/* Equipo y Número */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('team')}
                </label>
                <select
                  name="team_id"
                  value={formData.team_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
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
                placeholder={t('jerseyNumberPlaceholder')}
              />
            </div>

            {/* Estadísticas Físicas */}
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
                  placeholder={t('heightPlaceholder')}
                />
                <Input
                  label={t('weight')}
                  name="weight"
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder={t('weightPlaceholder')}
                />
              </div>
            </div>

            {/* Información Personal */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('personalInfo')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label={t('nationality')}
                  name="nationality"
                  type="text"
                  value={formData.nationality}
                  onChange={handleChange}
                  placeholder={t('nationalityPlaceholder')}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('dominantHand')}
                  </label>
                  <select
                    name="dominant_hand"
                    value={formData.dominant_hand}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
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
                  placeholder={t('photoPlaceholder')}
                />
              </div>
            </div>

            {/* Notas */}
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
                placeholder={t('notesPlaceholder')}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="flex-1"
              >
                {tc('create')}
              </Button>
              <Link href={`/${locale}/goalkeepers`} className="flex-1">
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
