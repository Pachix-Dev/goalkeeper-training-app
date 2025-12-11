'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { GoalkeeperStatistics } from '@/lib/db/models/GoalkeeperStatisticsModel';
import StatsGrid from '@/components/statistics/StatsGrid';

interface PageProps {
  params: Promise<{ locale: string }>;
}

interface Goalkeeper {
  id: number;
  first_name: string;
  last_name: string;
}

export default function StatisticsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const t = useTranslations('statistics');

  const [statistics, setStatistics] = useState<GoalkeeperStatistics[]>([]);
  const [goalkeepers, setGoalkeepers] = useState<Goalkeeper[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoalkeeper, setSelectedGoalkeeper] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<string>('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Cargar porteros
      const gkResponse = await fetch('/api/goalkeepers');
      const gkData = await gkResponse.json();
      const goalkeeperArray = Array.isArray(gkData) ? gkData : gkData.goalkeepers || [];
      setGoalkeepers(goalkeeperArray);

      // Cargar temporadas
      const seasonsResponse = await fetch('/api/statistics?action=seasons');
      const seasonsData = await seasonsResponse.json();
      setSeasons(Array.isArray(seasonsData) ? seasonsData : []);

      // Si hay temporada seleccionada, usar esa; sino, la más reciente
      let seasonToUse = selectedSeason;
      if (!seasonToUse && seasonsData.length > 0) {
        seasonToUse = seasonsData[0];
        setSelectedSeason(seasonToUse);
      }

      // Cargar estadísticas según los filtros
      let url = '/api/statistics?';
      if (selectedGoalkeeper) {
        url += `goalkeeper_id=${selectedGoalkeeper}`;
      } else if (seasonToUse) {
        url += `season=${seasonToUse}`;
      }

      if (url !== '/api/statistics?') {
        const statsResponse = await fetch(url);
        const statsData = await statsResponse.json();
        setStatistics(Array.isArray(statsData) ? statsData : []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedGoalkeeper, selectedSeason]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGoalkeeperChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGoalkeeper(e.target.value);
  };

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSeason(e.target.value);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">{t('loadingStatistics')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📊 {t('title')}</h1>
        <Link
          href={`/${resolvedParams.locale}/statistics/new`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          ➕ {t('newStatistics')}
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('filters.byGoalkeeper')}
            </label>
            <select
              value={selectedGoalkeeper}
              onChange={handleGoalkeeperChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('filters.all')}</option>
              {goalkeepers.map((gk) => (
                <option key={gk.id} value={gk.id}>
                  {gk.first_name} {gk.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('filters.bySeason')}
            </label>
            <select
              value={selectedSeason}
              onChange={handleSeasonChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!!selectedGoalkeeper}
            >
              <option value="">{t('filters.all')}</option>
              {seasons.map((season) => (
                <option key={season} value={season}>
                  {season}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de estadísticas */}
      {statistics.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-xl text-gray-500">{t('noStatistics')}</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {statistics.map((stat) => (
            <div key={stat.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {stat.goalkeeper_name}
                  </h2>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span>🏆 {stat.season}</span>
                    {stat.team_name && <span>🔵 {stat.team_name}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/${resolvedParams.locale}/statistics/${stat.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('actions.view')}
                  </Link>
                </div>
              </div>

              <StatsGrid statistics={stat} />
            </div>
          ))}
        </div>
      )}

      {/* Enlaces rápidos */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href={`/${resolvedParams.locale}/statistics/compare`}
          className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition-colors text-center"
        >
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-xl font-bold">{t('comparison.title')}</div>
          <div className="text-sm opacity-90 mt-1">{t('comparison.selectGoalkeepers')}</div>
        </Link>

        <Link
          href={`/${resolvedParams.locale}/statistics/top-performers`}
          className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors text-center"
        >
          <div className="text-4xl mb-2">⭐</div>
          <div className="text-xl font-bold">{t('topPerformers.title')}</div>
          <div className="text-sm opacity-90 mt-1">{t('topPerformers.subtitle')}</div>
        </Link>
      </div>
    </div>
  );
}
