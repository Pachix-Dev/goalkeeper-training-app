'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { GoalkeeperCard } from '@/components/goalkeepers/GoalkeeperCard';
import { Button } from '@/components/ui/Button';
import { GoalkeeperWithTeam, Team } from '@/lib/types/database';
import { apiGet, apiDelete } from '@/lib/utils/api';

export default function GoalkeepersPage() {
  const locale = useLocale();
  const t = useTranslations('goalkeepers');
  
  const [goalkeepers, setGoalkeepers] = useState<GoalkeeperWithTeam[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchGoalkeepers = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = filterTeam === 'all' 
        ? '/api/goalkeepers'
        : `/api/goalkeepers?team_id=${filterTeam}`;
      
      const data = await apiGet<GoalkeeperWithTeam[] | { goalkeepers: GoalkeeperWithTeam[] }>(url);
      setGoalkeepers(Array.isArray(data) ? data : data.goalkeepers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorLoading'));
    } finally {
      setIsLoading(false);
    }
  }, [filterTeam, t]);

  const fetchTeams = useCallback(async () => {
    try {
      const data = await apiGet<{ teams: Team[] }>('/api/teams');
      setTeams(data.teams || []);
    } catch (err) {
      console.error('Error loading teams:', err);
    }
  }, []);

  useEffect(() => {
    fetchGoalkeepers();
    fetchTeams();
  }, [fetchGoalkeepers, fetchTeams]);

  const handleDelete = async (id: number) => {
    if (!confirm(t('confirmDelete'))) {
      return;
    }

    try {
      await apiDelete(`/api/goalkeepers/${id}`);
      setGoalkeepers(goalkeepers.filter(gk => gk.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorDeleting'));
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchGoalkeepers();
      return;
    }

    try {
      setIsLoading(true);
      const data = await apiGet<GoalkeeperWithTeam[] | { goalkeepers: GoalkeeperWithTeam[] }>(
        `/api/goalkeepers?search=${encodeURIComponent(searchTerm)}`
      );
      setGoalkeepers(Array.isArray(data) ? data : data.goalkeepers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorLoading'));
    } finally {
      setIsLoading(false);
    }
  };

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
            <Link href={`/${locale}/goalkeepers/new`}>
              <Button variant="primary">
                {t('createGoalkeeper')}
              </Button>
            </Link>
          </div>

          {/* Filtros y Búsqueda */}
          <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="md:w-64">
              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">{t('allTeams')}</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Errors */}
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
        ) : goalkeepers.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noGoalkeepers')}</h3>
            <p className="text-gray-600 mb-6">{t('noGoalkeepersDescription')}</p>
            <Link href={`/${locale}/goalkeepers/new`}>
              <Button variant="primary">{t('createGoalkeeper')}</Button>
            </Link>
          </div>
        ) : (
          /* Grid de Porteros */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goalkeepers.map(goalkeeper => (
              <GoalkeeperCard
                key={goalkeeper.id}
                goalkeeper={goalkeeper}
                onDelete={() => handleDelete(goalkeeper.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
