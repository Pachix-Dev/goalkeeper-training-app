'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { apiGet, apiPost } from '@/lib/utils/api';
import PenaltyGrid from '@/components/penalties/PenaltyGrid';

interface Goalkeeper {
  id: number;
  first_name: string;
  last_name: string;
}

export default function NewPenaltyPage({ params }: { params: Promise<{ locale: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ locale: string } | null>(null);
  const [goalkeepers, setGoalkeepers] = useState<Goalkeeper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const t = useTranslations('penalties');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState({
    goalkeeper_id: '',
    opponent_name: '',
    match_date: '',
    competition: '',
    penalty_taker: '',
    taker_foot: '',
    shot_direction: 'center' as 'left' | 'center' | 'right',
    shot_height: 'mid' as 'low' | 'mid' | 'high',
    result: 'goal' as 'saved' | 'goal' | 'missed' | 'post',
    goalkeeper_direction: '',
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
      // Prepare data
      const data: any = {
        goalkeeper_id: parseInt(formData.goalkeeper_id),
        opponent_name: formData.opponent_name,
        penalty_taker: formData.penalty_taker,
        shot_direction: formData.shot_direction,
        shot_height: formData.shot_height,
        result: formData.result
      };

      if (formData.match_date) data.match_date = formData.match_date;
      if (formData.competition) data.competition = formData.competition;
      if (formData.taker_foot) data.taker_foot = formData.taker_foot;
      if (formData.goalkeeper_direction) data.goalkeeper_direction = formData.goalkeeper_direction;
      if (formData.notes) data.notes = formData.notes;
      if (formData.video_url) data.video_url = formData.video_url;

      const penalty = await apiPost('/api/penalties', data);
      
      router.push(`/${resolvedParams!.locale}/penalties/${penalty.id}`);
    } catch (error: any) {
      setError(error.message || tCommon('errorSaving'));
    } finally {
      setLoading(false);
    }
  };

  const handleGridSelect = (direction: 'left' | 'center' | 'right', height: 'low' | 'mid' | 'high') => {
    setFormData(prev => ({
      ...prev,
      shot_direction: direction,
      shot_height: height
    }));
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
    <div >
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/${resolvedParams.locale}/penalties`}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← {tCommon('back')}
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{t('registerPenalty')}</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          {/* Goalkeeper */}
          <div className="mb-6">
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

          {/* Match Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('opponent')} *
              </label>
              <input
                type="text"
                required
                value={formData.opponent_name}
                onChange={(e) => setFormData({ ...formData, opponent_name: e.target.value })}
                placeholder={t('placeholders.opponent')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('matchDate')}
              </label>
              <input
                type="date"
                value={formData.match_date}
                onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Penalty Taker Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('penaltyTaker')} *
              </label>
              <input
                type="text"
                required
                value={formData.penalty_taker}
                onChange={(e) => setFormData({ ...formData, penalty_taker: e.target.value })}
                placeholder={t('placeholders.penaltyTaker')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('takerFoot')}
              </label>
              <select
                value={formData.taker_foot}
                onChange={(e) => setFormData({ ...formData, taker_foot: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{tCommon('select')}</option>
                <option value="left">{t('feet.left')}</option>
                <option value="right">{t('feet.right')}</option>
              </select>
            </div>
          </div>

          {/* Competition */}
          <div className="mb-6">
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
        </div>

        {/* Shot Grid */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">{t('grid.title')}</h2>
          <PenaltyGrid
            direction={formData.shot_direction}
            height={formData.shot_height}
            onSelect={handleGridSelect}
          />
        </div>

        {/* Result & Goalkeeper Direction */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('result')} *
              </label>
              <select
                required
                value={formData.result}
                onChange={(e) => setFormData({ ...formData, result: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="saved">{t('results.saved')}</option>
                <option value="goal">{t('results.goal')}</option>
                <option value="missed">{t('results.missed')}</option>
                <option value="post">{t('results.post')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('goalkeeperDirection')}
              </label>
              <select
                value={formData.goalkeeper_direction}
                onChange={(e) => setFormData({ ...formData, goalkeeper_direction: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{tCommon('select')}</option>
                <option value="left">{t('directions.left')}</option>
                <option value="center">{t('directions.center')}</option>
                <option value="right">{t('directions.right')}</option>
                <option value="stayed">{t('directions.stayed')}</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('notes')}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t('placeholders.notes')}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Video URL */}
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
            href={`/${resolvedParams.locale}/penalties`}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            {tCommon('cancel')}
          </Link>
        </div>
      </form>
    </div>
  );
}
