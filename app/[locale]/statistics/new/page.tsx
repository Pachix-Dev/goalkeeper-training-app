'use client';

import { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ locale: string }>;
}

interface Goalkeeper {
  id: number;
  first_name: string;
  last_name: string;
}

export default function NewStatisticsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const t = useTranslations('statistics');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [goalkeepers, setGoalkeepers] = useState<Goalkeeper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    goalkeeper_id: '',
    season: '',
    matches_played: 0,
    minutes_played: 0,
    goals_conceded: 0,
    clean_sheets: 0,
    saves: 0,
    penalties_saved: 0,
    penalties_faced: 0,
    yellow_cards: 0,
    red_cards: 0
  });

  useEffect(() => {
    loadGoalkeepers();
  }, []);

  const loadGoalkeepers = async () => {
    try {
      const response = await fetch('/api/goalkeepers');
      const data = await response.json();
      const goalkeeperArray = Array.isArray(data) ? data : data.goalkeepers || [];
      setGoalkeepers(goalkeeperArray);
    } catch (error) {
      console.error('Error loading goalkeepers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/statistics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          goalkeeper_id: parseInt(formData.goalkeeper_id)
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear estadísticas');
      }

      router.push(`/${resolvedParams.locale}/statistics`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/${resolvedParams.locale}/statistics`}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← {tCommon('back')}
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">📊 {t('newStatistics')}</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {/* Información Básica */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Información Básica</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('goalkeeper')} *
              </label>
              <select
                value={formData.goalkeeper_id}
                onChange={(e) => setFormData({ ...formData, goalkeeper_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">{t('placeholders.selectGoalkeeper')}</option>
                {goalkeepers.map((gk) => (
                  <option key={gk.id} value={gk.id}>
                    {gk.first_name} {gk.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('fields.season')} *
              </label>
              <input
                type="text"
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                placeholder={t('placeholders.season')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Estadísticas de Partidos */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Estadísticas de Partidos</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('fields.matchesPlayed')}
              </label>
              <input
                type="number"
                min="0"
                value={formData.matches_played}
                onChange={(e) => setFormData({ ...formData, matches_played: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('fields.minutesPlayed')}
              </label>
              <input
                type="number"
                min="0"
                value={formData.minutes_played}
                onChange={(e) => setFormData({ ...formData, minutes_played: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('fields.goalsConceded')}
              </label>
              <input
                type="number"
                min="0"
                value={formData.goals_conceded}
                onChange={(e) => setFormData({ ...formData, goals_conceded: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('fields.cleanSheets')}
              </label>
              <input
                type="number"
                min="0"
                value={formData.clean_sheets}
                onChange={(e) => setFormData({ ...formData, clean_sheets: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('fields.saves')}
              </label>
              <input
                type="number"
                min="0"
                value={formData.saves}
                onChange={(e) => setFormData({ ...formData, saves: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Penaltis y Tarjetas */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Penaltis y Disciplina</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('fields.penaltiesFaced')}
              </label>
              <input
                type="number"
                min="0"
                value={formData.penalties_faced}
                onChange={(e) => setFormData({ ...formData, penalties_faced: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('fields.penaltiesSaved')}
              </label>
              <input
                type="number"
                min="0"
                value={formData.penalties_saved}
                onChange={(e) => setFormData({ ...formData, penalties_saved: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('fields.yellowCards')}
              </label>
              <input
                type="number"
                min="0"
                value={formData.yellow_cards}
                onChange={(e) => setFormData({ ...formData, yellow_cards: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('fields.redCards')}
              </label>
              <input
                type="number"
                min="0"
                value={formData.red_cards}
                onChange={(e) => setFormData({ ...formData, red_cards: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? tCommon('saving') : tCommon('save')}
          </button>
          <Link
            href={`/${resolvedParams.locale}/statistics`}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
          >
            {tCommon('cancel')}
          </Link>
        </div>
      </form>
    </div>
  );
}
