'use client';

import { useEffect, useState, use } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { GoalkeeperStatistics } from '@/lib/db/models/GoalkeeperStatisticsModel';
import { apiGet } from '@/lib/utils/api';

interface PageProps {
  params: Promise<{ locale: string }>;
}

interface Goalkeeper {
  id: number;
  first_name: string;
  last_name: string;
  team_id: number;
}

export default function CompareGoalkeepersPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const t = useTranslations('statistics');
  const tCommon = useTranslations('common');

  const [goalkeepers, setGoalkeepers] = useState<Goalkeeper[]>([]);
  const [selectedGoalkeepers, setSelectedGoalkeepers] = useState<number[]>([]);
  const [season, setSeason] = useState<string>('');
  const [seasons, setSeasons] = useState<string[]>([]);
  const [comparison, setComparison] = useState<GoalkeeperStatistics[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Cargar temporadas
        const seasonsData = await apiGet<string[]>('/api/statistics?action=seasons');
        setSeasons(seasonsData);
        if (seasonsData.length > 0) {
          setSeason(seasonsData[0]);
        }

        // Cargar porteros
        const goalkeepersData = await apiGet<Goalkeeper[]>('/api/goalkeepers');
        setGoalkeepers(goalkeepersData);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    loadInitialData();
  }, []);

  const handleCompare = async () => {
    if (selectedGoalkeepers.length < 2) {
      alert(t('comparison.selectAtLeastTwo'));
      return;
    }

    setLoading(true);
    try {
      const data = await apiGet<GoalkeeperStatistics[]>(
        `/api/statistics?action=compare&goalkeeper_ids=${selectedGoalkeepers.join(',')}&season=${season}`
      );
      setComparison(data);
    } catch (error) {
      console.error('Error:', error);
      alert(tCommon('error'));
    } finally {
      setLoading(false);
    }
  };

  const toggleGoalkeeper = (id: number) => {
    setSelectedGoalkeepers((prev) =>
      prev.includes(id) ? prev.filter((gkId) => gkId !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🏆 {t('comparison.title')}
              </h1>
              <p className="text-gray-600 mt-2">{t('comparison.selectGoalkeepers')}</p>
            </div>
            <Link
              href={`/${resolvedParams.locale}/statistics`}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {tCommon('back')}
            </Link>
          </div>

          {/* Filtros */}
          <div className="flex gap-4 mt-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('fields.season')}
              </label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {seasons.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Selección de porteros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('comparison.selectGoalkeepers')} ({selectedGoalkeepers.length} {t('comparison.selected')})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goalkeepers.map((gk) => (
              <button
                key={gk.id}
                onClick={() => toggleGoalkeeper(gk.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedGoalkeepers.includes(gk.id)
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-300 bg-white hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {gk.first_name} {gk.last_name}
                  </span>
                  {selectedGoalkeepers.includes(gk.id) && (
                    <span className="text-purple-600">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleCompare}
            disabled={selectedGoalkeepers.length < 2 || loading}
            className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {loading ? tCommon('loading') : t('comparison.compare')}
          </button>
        </div>

        {/* Resultados de comparación */}
        {comparison.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {tCommon('goalkeeper')}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('fields.matchesPlayed')}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('fields.minutesPlayed')}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('fields.goalsConceded')}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('calculated.goalsPerMatch')}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('fields.cleanSheets')}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('calculated.cleanSheetPercentage')}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('fields.saves')}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('calculated.savePercentage')}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('fields.penaltiesSaved')}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('calculated.penaltySavePercentage')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {comparison.map((stat) => (
                    <tr key={stat.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/${resolvedParams.locale}/statistics/${stat.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {stat.goalkeeper_name}
                        </Link>
                        <div className="text-sm text-gray-500">{stat.team_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-900">
                        {stat.matches_played}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-900">
                        {stat.minutes_played}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-red-600 font-semibold">
                        {stat.goals_conceded}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-900">
                        {Number(stat.goals_per_match ?? 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-green-600 font-semibold">
                        {stat.clean_sheets}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                          {Number(stat.clean_sheet_percentage ?? 0).toFixed(1)}
                          %
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-blue-600 font-semibold">
                        {stat.saves}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                          {Number(stat.save_percentage ?? 0).toFixed(1)}
                          %
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-900">
                        {stat.penalties_saved}/{stat.penalties_faced}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                          {Number(stat.penalty_save_percentage ?? 0).toFixed(1)}
                          %
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
