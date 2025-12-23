'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { apiGet } from '@/lib/utils/api';
import MatchCard from '@/components/matches/MatchCard';

interface MatchAnalysis {
  id: number;
  opponent: string;
  match_date: string;
  competition: string | null;
  result: string | null;
  goals_conceded: number;
  saves: number;
  rating: number | null;
  goalkeeper_name?: string;
}

interface Goalkeeper {
  id: number;
  first_name: string;
  last_name: string;
}

export default function MatchesPage({ params }: { params: Promise<{ locale: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ locale: string } | null>(null);
  const [matches, setMatches] = useState<MatchAnalysis[]>([]);
  const [goalkeepers, setGoalkeepers] = useState<Goalkeeper[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoalkeeper, setSelectedGoalkeeper] = useState<string>('');

  const t = useTranslations('matches');
  const tCommon = useTranslations('common');

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Load goalkeepers for filter
      if (goalkeepers.length === 0) {
        const gkData = await apiGet('/api/goalkeepers');
        setGoalkeepers(Array.isArray(gkData) ? gkData : gkData.goalkeepers || []);
      }

      // Load matches with filters
      let url = '/api/matches';
      
      if (selectedGoalkeeper) {
        url += `?goalkeeper_id=${selectedGoalkeeper}`;
      }

      const matchesData = await apiGet(url);
      setMatches(matchesData);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  }, [goalkeepers.length, selectedGoalkeeper]);

  useEffect(() => {
    if (resolvedParams) {
      loadData();
    }
  }, [resolvedParams, loadData]);

  if (!resolvedParams) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{tCommon('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-2 text-gray-600">{t('subtitle')}</p>
        </div>
        <Link
          href={`/${resolvedParams.locale}/matches/new`}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('newAnalysis')}
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
        <div className="flex items-center gap-4">
          <label className="block text-sm font-medium text-gray-700">
            {t('filters.byGoalkeeper')}
          </label>
          <select
            value={selectedGoalkeeper}
            onChange={(e) => setSelectedGoalkeeper(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{t('filters.all')}</option>
            {goalkeepers.map((gk) => (
              <option key={gk.id} value={gk.id}>
                {gk.first_name} {gk.last_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Matches List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{tCommon('loading')}</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 mb-4">{t('noMatches')}</p>
          <Link
            href={`/${resolvedParams.locale}/matches/new`}
            className="text-blue-600 hover:text-blue-700"
          >
            {t('newAnalysis')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              locale={resolvedParams.locale}
              showGoalkeeper={!selectedGoalkeeper}
            />
          ))}
        </div>
      )}
    </div>
  );
}
