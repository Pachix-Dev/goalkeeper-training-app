'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { apiGet, apiPost } from '@/lib/utils/api';

interface Goalkeeper {
  id: number;
  first_name: string;
  last_name: string;
}

export default function NewMatchPage({ params }: { params: Promise<{ locale: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ locale: string } | null>(null);
  const [goalkeepers, setGoalkeepers] = useState<Goalkeeper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const t = useTranslations('matches');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState({
    goalkeeper_id: '',
    match_date: '',
    opponent: '',
    competition: '',
    result: '',
    minutes_played: '',
    goals_conceded: '',
    saves: '',
    high_balls: '',
    crosses_caught: '',
    distribution_success_rate: '',
    rating: '',
    strengths: '',
    areas_for_improvement: '',
    notes: '',
    video_url: ''
  });

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    if (resolvedParams) {
      loadGoalkeepers();
    }
  }, [resolvedParams]);

  const loadGoalkeepers = async () => {
    try {
      const data = await apiGet('/api/goalkeepers');
      setGoalkeepers(Array.isArray(data) ? data : data.goalkeepers || []);
    } catch (error) {
      console.error('Error loading goalkeepers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data: Record<string, unknown> = {
        goalkeeper_id: parseInt(formData.goalkeeper_id),
        match_date: formData.match_date,
        opponent: formData.opponent
      };

      if (formData.competition) data.competition = formData.competition;
      if (formData.result) data.result = formData.result;
      if (formData.minutes_played) data.minutes_played = parseInt(formData.minutes_played);
      if (formData.goals_conceded) data.goals_conceded = parseInt(formData.goals_conceded);
      if (formData.saves) data.saves = parseInt(formData.saves);
      if (formData.high_balls) data.high_balls = parseInt(formData.high_balls);
      if (formData.crosses_caught) data.crosses_caught = parseInt(formData.crosses_caught);
      if (formData.distribution_success_rate) data.distribution_success_rate = parseFloat(formData.distribution_success_rate);
      if (formData.rating) data.rating = parseFloat(formData.rating);
      if (formData.strengths) data.strengths = formData.strengths;
      if (formData.areas_for_improvement) data.areas_for_improvement = formData.areas_for_improvement;
      if (formData.notes) data.notes = formData.notes;
      if (formData.video_url) data.video_url = formData.video_url;

      const match = await apiPost('/api/matches', data);
      
      router.push(`/${resolvedParams!.locale}/matches/${match.id}`);
    } catch (error: unknown) {
      setError((error as Error).message || tCommon('errorSaving'));
    } finally {
      setLoading(false);
    }
  };

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/${resolvedParams.locale}/matches`}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← {tCommon('back')}
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{t('newAnalysis')}</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">{t('matchDetails')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {tCommon('goalkeeper')} *
              </label>
              <select
                required
                value={formData.goalkeeper_id}
                onChange={(e) => setFormData({ ...formData, goalkeeper_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{tCommon('select')}</option>
                {goalkeepers.map((gk) => (
                  <option key={gk.id} value={gk.id}>
                    {gk.first_name} {gk.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('matchDate')} *
              </label>
              <input
                type="date"
                required
                value={formData.match_date}
                onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('opponent')} *
              </label>
              <input
                type="text"
                required
                value={formData.opponent}
                onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                placeholder={t('placeholders.opponent')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('competition')}
              </label>
              <input
                type="text"
                value={formData.competition}
                onChange={(e) => setFormData({ ...formData, competition: e.target.value })}
                placeholder={t('placeholders.competition')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('result')}
              </label>
              <input
                type="text"
                value={formData.result}
                onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                placeholder={t('placeholders.result')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('minutesPlayed')}
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={formData.minutes_played}
                onChange={(e) => setFormData({ ...formData, minutes_played: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">{t('metrics')}</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('goalsConceded')}
              </label>
              <input
                type="number"
                min="0"
                value={formData.goals_conceded}
                onChange={(e) => setFormData({ ...formData, goals_conceded: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('saves')}
              </label>
              <input
                type="number"
                min="0"
                value={formData.saves}
                onChange={(e) => setFormData({ ...formData, saves: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('highBalls')}
              </label>
              <input
                type="number"
                min="0"
                value={formData.high_balls}
                onChange={(e) => setFormData({ ...formData, high_balls: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('crossesCaught')}
              </label>
              <input
                type="number"
                min="0"
                value={formData.crosses_caught}
                onChange={(e) => setFormData({ ...formData, crosses_caught: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('distributionRate')} (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.distribution_success_rate}
                onChange={(e) => setFormData({ ...formData, distribution_success_rate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('rating')} (0-10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Analysis */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">{t('performance')}</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('strengths')}
              </label>
              <textarea
                value={formData.strengths}
                onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                placeholder={t('placeholders.strengths')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('areasForImprovement')}
              </label>
              <textarea
                value={formData.areas_for_improvement}
                onChange={(e) => setFormData({ ...formData, areas_for_improvement: e.target.value })}
                placeholder={t('placeholders.improvements')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('notes')}
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t('placeholders.notes')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('videoUrl')}
              </label>
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder={t('placeholders.videoUrl')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? tCommon('saving') : tCommon('save')}
          </button>
          <Link
            href={`/${resolvedParams.locale}/matches`}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            {tCommon('cancel')}
          </Link>
        </div>
      </form>
    </div>
  );
}
