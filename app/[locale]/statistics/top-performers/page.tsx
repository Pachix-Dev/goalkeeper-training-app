'use client';

import { useEffect, useState, use } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { GoalkeeperStatistics } from '@/lib/db/models/GoalkeeperStatisticsModel';
import { apiGet } from '@/lib/utils/api';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function TopPerformersPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const t = useTranslations('statistics');
  const tCommon = useTranslations('common');

  const [topPerformers, setTopPerformers] = useState<GoalkeeperStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState<string>('');
  const [seasons, setSeasons] = useState<string[]>([]);
  const [limit, setLimit] = useState<number>(10);

  useEffect(() => {
    const loadSeasons = async () => {
      try {
        const data = await apiGet<string[]>('/api/statistics?action=seasons');
        setSeasons(data);
        if (data.length > 0) {
          setSeason(data[0]); // Temporada más reciente
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    loadSeasons();
  }, []);

  useEffect(() => {
    if (!season) return;

    const loadTopPerformers = async () => {
      setLoading(true);
      try {
        const data = await apiGet<GoalkeeperStatistics[]>(
          `/api/statistics?action=top-performers&season=${season}&limit=${limit}`
        );
        setTopPerformers(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTopPerformers();
  }, [season, limit]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ⭐ {t('topPerformers.title')}
              </h1>
              <p className="text-gray-600 mt-2">{t('topPerformers.subtitle')}</p>
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
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {seasons.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {tCommon('limit')}
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="5">Top 5</option>
                <option value="10">Top 10</option>
                <option value="20">Top 20</option>
                <option value="50">Top 50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-500">{tCommon('loading')}</div>
          </div>
        ) : (
          <>
            {/* Tabla de mejores porteros */}
            {topPerformers.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-gray-500">{t('noStatistics')}</div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {tCommon('goalkeeper')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {tCommon('team')}
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('fields.matchesPlayed')}
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('fields.cleanSheets')}
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('calculated.cleanSheetPercentage')}
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('calculated.savePercentage')}
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('calculated.goalsPerMatch')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {topPerformers.map((stat, index) => (
                        <tr
                          key={stat.id}
                          className={`hover:bg-gray-50 ${
                            index === 0
                              ? 'bg-yellow-50'
                              : index === 1
                              ? 'bg-gray-100'
                              : index === 2
                              ? 'bg-orange-50'
                              : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-2xl">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              href={`/${resolvedParams.locale}/statistics/${stat.id}`}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {stat.goalkeeper_name}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            {stat.team_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-gray-900">
                            {stat.matches_played}
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
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                              {Number(stat.save_percentage ?? 0).toFixed(1)}
                              %
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-gray-900">
                            {Number(stat.goals_per_match ?? 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
