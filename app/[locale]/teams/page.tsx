'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { TeamCard } from '@/components/teams/TeamCard';
import { Button } from '@/components/ui/Button';
import { TeamWithStats } from '@/lib/types/database';
import { apiGet, apiDelete } from '@/lib/utils/api';

export default function TeamsPage() {
  const locale = useLocale();
  const t = useTranslations('teams');
  const tc = useTranslations('common');
  
  const [teams, setTeams] = useState<TeamWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterSeason, setFilterSeason] = useState<string>('all');

  const fetchTeams = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = filterSeason === 'all' 
        ? '/api/teams'
        : `/api/teams?season=${filterSeason}`;
      
      const data = await apiGet<{ teams: TeamWithStats[] }>(url);
      setTeams(data.teams || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorLoading'));
    } finally {
      setIsLoading(false);
    }
  }, [filterSeason, t]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleDelete = async (id: number) => {
    if (!confirm(t('confirmDelete'))) {
      return;
    }

    try {
      await apiDelete(`/api/teams/${id}`);
      setTeams(teams.filter(team => team.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorDeleting'));
    }
  };

  const seasons = Array.from(new Set(teams.map(t => t.season)));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
              <p className="mt-1 text-gray-600">{t('subtitle')}</p>
            </div>
            <Link href={`/${locale}/teams/new`}>
              <Button variant="primary">
                {t('createTeam')}
              </Button>
            </Link>
          </div>

          {/* Filters */}
          {seasons.length > 0 && (
            <div className="flex gap-4">
              <select
                value={filterSeason}
                onChange={(e) => setFilterSeason(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">{tc('all')}</option>
                {seasons.map(season => (
                  <option key={season} value={season}>{season}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : teams.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('noTeams')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('noTeamsDescription')}</p>
            <div className="mt-6">
              <Link href={`/${locale}/teams/new`}>
                <Button variant="primary">{t('createTeam')}</Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Teams Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onDelete={() => handleDelete(team.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
