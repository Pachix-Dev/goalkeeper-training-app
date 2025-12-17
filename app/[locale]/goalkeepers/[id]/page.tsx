'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { GoalkeeperWithTeam } from '@/lib/types/database';
import { apiGet } from '@/lib/utils/api';

export default function GoalkeeperDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations('goalkeepers');
  const tc = useTranslations('common');
  
  const [goalkeeper, setGoalkeeper] = useState<GoalkeeperWithTeam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGoalkeeper = async () => {
      try {
        setIsLoading(true);
        const data = await apiGet<{ goalkeeper: GoalkeeperWithTeam }>(`/api/goalkeepers/${params.id}`);
        setGoalkeeper(data.goalkeeper);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errorLoading'));
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchGoalkeeper();
    }
  }, [params.id, t]);

  const calculateAge = (dob: Date | undefined) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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

  if (error || !goalkeeper) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error || t('errorLoading')}</p>
          </div>
          <Link href={`/${locale}/goalkeepers`} className="mt-4 inline-block">
            <Button variant="secondary">{tc('back')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const fullName = `${goalkeeper.first_name} ${goalkeeper.last_name}`;
  const initials = `${goalkeeper.first_name.charAt(0)}${goalkeeper.last_name.charAt(0)}`.toUpperCase();
  const age = calculateAge(goalkeeper.date_of_birth);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
        </div>

        {/* Goalkeeper Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Hero Section */}
          <div className="bg-linear-to-r from-blue-500 to-blue-700 p-8">
            <div className="flex items-center gap-6">
              {goalkeeper.photo ? (
                <div 
                  className="w-32 h-32 rounded-full border-4 border-white object-cover bg-cover bg-center"
                  style={{ backgroundImage: `url(${goalkeeper.photo})` }}
                  role="img"
                  aria-label={fullName}
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white bg-blue-300 flex items-center justify-center text-white font-bold text-4xl">
                  {initials}
                </div>
              )}
              <div className="flex-1 text-white">
                <h1 className="text-4xl font-bold mb-2">{fullName}</h1>
                {goalkeeper.jersey_number && (
                  <p className="text-2xl font-semibold text-blue-100">#{goalkeeper.jersey_number}</p>
                )}
                {goalkeeper.team_name && (
                  <p className="text-lg text-blue-100 mt-2">{goalkeeper.team_name}</p>
                )}
              </div>
              <Link href={`/${locale}/goalkeepers/${goalkeeper.id}/edit`}>
                <Button variant="primary" className="bg-slate-950 hover:bg-slate-800 cursor-pointer">
                  {tc('edit')}
                </Button>
              </Link>
            </div>
          </div>

          <div className="p-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {age && (
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600">{age}</p>
                  <p className="text-sm text-gray-600 mt-1">{t('years')}</p>
                </div>
              )}
              {goalkeeper.height && (
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">{goalkeeper.height}</p>
                  <p className="text-sm text-gray-600 mt-1">{t('cm')}</p>
                </div>
              )}
              {goalkeeper.weight && (
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-purple-600">{goalkeeper.weight}</p>
                  <p className="text-sm text-gray-600 mt-1">{t('kg')}</p>
                </div>
              )}
              {goalkeeper.dominant_hand && (
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-bold text-yellow-900">
                    {goalkeeper.dominant_hand === 'left' && t('leftHand')}
                    {goalkeeper.dominant_hand === 'right' && t('rightHand')}
                    {goalkeeper.dominant_hand === 'both' && t('bothHands')}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{t('dominantHand')}</p>
                </div>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {goalkeeper.nationality && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('nationality')}</p>
                  <p className="text-lg font-medium text-gray-900">{goalkeeper.nationality}</p>
                </div>
              )}
              {goalkeeper.date_of_birth && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('dateOfBirth')}</p>
                  <p className="text-lg font-medium text-gray-900">
                    {new Date(goalkeeper.date_of_birth).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Notes */}
            {goalkeeper.notes && (
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('additionalNotes')}</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{goalkeeper.notes}</p>
              </div>
            )}

            {/* Attendance History */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Historial de Asistencia</h2>
                <Link href={`/${locale}/goalkeepers/${goalkeeper.id}/attendance`}>
                  <Button variant="outline" className="text-sm cursor-pointer">Ver Todo</Button>
                </Link>
              </div>
              <p className="text-sm text-gray-500">Accede al historial completo de asistencia del portero</p>
            </div>

            {/* Penalties Section */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Penaltis</h2>
                <Link href={`/${locale}/penalties?goalkeeper_id=${goalkeeper.id}`}>
                  <Button variant="outline" className="text-sm cursor-pointer">Ver Todos</Button>
                </Link>
              </div>
              <p className="text-sm text-gray-500">Registro y análisis de penaltis del portero</p>
            </div>

            {/* Match Analysis Section */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Análisis de Partidos</h2>
                <Link href={`/${locale}/matches?goalkeeper_id=${goalkeeper.id}`}>
                  <Button variant="outline" className="text-sm cursor-pointer">Ver Todos</Button>
                </Link>
              </div>
              <p className="text-sm text-gray-500">Registro de rendimiento y análisis post-partido</p>
            </div>

            {/* Statistics Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">📊 Estadísticas por Temporada</h2>
                <Link href={`/${locale}/statistics?goalkeeper_id=${goalkeeper.id}`}>
                  <Button variant="outline" className="text-sm cursor-pointer">Ver Todas</Button>
                </Link>
              </div>
              <p className="text-sm text-gray-500">Estadísticas detalladas de rendimiento por temporada</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
