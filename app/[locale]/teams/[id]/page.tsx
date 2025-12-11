'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TeamWithStats } from '@/lib/types/database';
import { apiGet } from '@/lib/utils/api';

export default function TeamDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations('teams');
  const tc = useTranslations('common');
  
  const [team, setTeam] = useState<TeamWithStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setIsLoading(true);
        const data = await apiGet<{ team: TeamWithStats }>(`/api/teams/${params.id}`);
        setTeam(data.team);
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

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error || t('errorLoading')}</p>
          </div>
          <Link href={`/${locale}/teams`} className="mt-4 inline-block">
            <Button variant="secondary">{tc('back')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/teams`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {tc('back')}
          </Link>
        </div>

        {/* Team Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Color Bar */}
          <div 
            className="h-3"
            style={{ backgroundColor: team.color }}
          />

          <div className="p-8">
            {/* Title Section */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {team.name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {team.category}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {team.season}
                  </span>
                </div>
              </div>
              <Link href={`/${locale}/teams/${team.id}/edit`}>
                <Button variant="primary">{tc('edit')}</Button>
              </Link>
            </div>

            {/* Description */}
            {team.description && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{team.description}</p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <p className="text-4xl font-bold text-blue-600 mb-2">
                  {team.total_goalkeepers || 0}
                </p>
                <p className="text-sm text-gray-600">{t('totalGoalkeepers')}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <p className="text-4xl font-bold text-green-600 mb-2">
                  {team.total_goalkeepers || 0}
                </p>
                <p className="text-sm text-gray-600">{t('activePlayers')}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-6 text-center">
                <p className="text-4xl font-bold text-purple-600 mb-2">
                  0
                </p>
                <p className="text-sm text-gray-600">{t('trainingSessions')}</p>
              </div>
            </div>

            {/* Coach Info */}
            {team.coach_name && (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  {t('coachInfo')}
                </h2>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {team.coach_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{team.coach_name}</p>
                    <p className="text-sm text-gray-600">{t('headCoach')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Goalkeepers Section */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {t('goalkeepers')}
                </h2>
                <Button variant="secondary" className="px-4 py-1 text-sm">
                  {t('addGoalkeeper')}
                </Button>
              </div>
              
              {team.total_goalkeepers === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-600">{t('noGoalkeepers')}</p>
                  <p className="text-sm text-gray-500 mt-2">{t('addFirstGoalkeeper')}</p>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">{t('goalkeeperListComingSoon')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
