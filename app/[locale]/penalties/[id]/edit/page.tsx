'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { apiGet, apiPut } from '@/lib/utils/api';
import PenaltyGrid from '@/components/penalties/PenaltyGrid';

interface Goalkeeper {
  id: number;
  first_name: string;
  last_name: string;
}

interface Penalty {
  id: number;
  goalkeeper_id: number;
  goalkeeper_name: string;
  opponent_name: string;
  match_date: string | null;
  competition: string | null;
  penalty_taker: string;
  taker_foot: string | null;
  shot_direction: 'left' | 'center' | 'right';
  shot_height: 'low' | 'mid' | 'high';
  result: 'saved' | 'goal' | 'missed' | 'post';
  goalkeeper_direction: string | null;
  notes: string | null;
  video_url: string | null;
}

export default function EditPenaltyPage({ 
  params 
}: { 
  params: Promise<{ locale: string; id: string }> 
}) {
  const [resolvedParams, setResolvedParams] = useState<{ locale: string; id: string } | null>(null);
  const [penalty, setPenalty] = useState<Penalty | null>(null);
  const [goalkeepers, setGoalkeepers] = useState<Goalkeeper[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      loadPenalty();
      loadGoalkeepers();
    }
  }, [resolvedParams]);

  const loadPenalty = async () => {
    try {
      const data = await apiGet<Penalty>(`/api/penalties/${resolvedParams!.id}`);
      setPenalty(data);
      
      // Poblar formulario con datos existentes
      setFormData({
        goalkeeper_id: data.goalkeeper_id.toString(),
        opponent_name: data.opponent_name || '',
        match_date: data.match_date ? data.match_date.split('T')[0] : '',
        competition: data.competition || '',
        penalty_taker: data.penalty_taker || '',
        taker_foot: data.taker_foot || '',
        shot_direction: data.shot_direction,
        shot_height: data.shot_height,
        result: data.result,
        goalkeeper_direction: data.goalkeeper_direction || '',
        notes: data.notes || '',
        video_url: data.video_url || ''
      });
    } catch (error) {
      console.error('Error loading penalty:', error);
      setError(tCommon('error'));
    } finally {
      setLoading(false);
    }
  };

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
    setSaving(true);

    try {
      const payload = {
        ...formData,
        goalkeeper_id: parseInt(formData.goalkeeper_id),
        match_date: formData.match_date || null,
        competition: formData.competition || null,
        taker_foot: formData.taker_foot || null,
        goalkeeper_direction: formData.goalkeeper_direction || null,
        notes: formData.notes || null,
        video_url: formData.video_url || null
      };

      await apiPut(`/api/penalties/${resolvedParams!.id}`, payload);
      router.push(`/${resolvedParams!.locale}/penalties/${resolvedParams!.id}`);
    } catch (error: any) {
      setError(error.message || t('errors.failedToUpdate'));
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGridClick = (direction: 'left' | 'center' | 'right', height: 'low' | 'mid' | 'high') => {
    setFormData(prev => ({
      ...prev,
      shot_direction: direction,
      shot_height: height
    }));
  };

  if (!resolvedParams) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            {tCommon('loading')}
          </div>
        </div>
      </div>
    );
  }

  if (!penalty) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-red-600">{t('errors.notFound')}</p>
            <Link
              href={`/${resolvedParams.locale}/penalties`}
              className="mt-4 inline-block text-blue-600 hover:text-blue-800"
            >
              {tCommon('back')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('editPenalty')}
            </h1>
            <Link
              href={`/${resolvedParams.locale}/penalties/${resolvedParams.id}`}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {tCommon('cancel')}
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Goalkeeper */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {tCommon('goalkeeper')} *
            </label>
            <select
              name="goalkeeper_id"
              value={formData.goalkeeper_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('selectGoalkeeper')}</option>
              {goalkeepers.map((gk) => (
                <option key={gk.id} value={gk.id}>
                  {gk.first_name} {gk.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Match Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('opponentName')} *
              </label>
              <input
                type="text"
                name="opponent_name"
                value={formData.opponent_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('matchDate')}
              </label>
              <input
                type="date"
                name="match_date"
                value={formData.match_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('competition')}
              </label>
              <input
                type="text"
                name="competition"
                value={formData.competition}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('penaltyTaker')} *
              </label>
              <input
                type="text"
                name="penalty_taker"
                value={formData.penalty_taker}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Taker Foot */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('takerFoot')}
            </label>
            <select
              name="taker_foot"
              value={formData.taker_foot}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('selectFoot')}</option>
              <option value="left">{t('leftFoot')}</option>
              <option value="right">{t('rightFoot')}</option>
            </select>
          </div>

          {/* Shot Direction & Height - Visual Grid */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('shotDirection')} & {t('shotHeight')} *
            </label>
            <PenaltyGrid
              direction={formData.shot_direction}
              height={formData.shot_height}
              onSelect={handleGridClick}
            />
          </div>

          {/* Result */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('result')} *
            </label>
            <select
              name="result"
              value={formData.result}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="saved">{t('saved')}</option>
              <option value="goal">{t('goal')}</option>
              <option value="missed">{t('missed')}</option>
              <option value="post">{t('post')}</option>
            </select>
          </div>

          {/* Goalkeeper Direction */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('goalkeeperDirection')}
            </label>
            <select
              name="goalkeeper_direction"
              value={formData.goalkeeper_direction}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('selectDirection')}</option>
              <option value="left">{t('left')}</option>
              <option value="center">{t('center')}</option>
              <option value="right">{t('right')}</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('notes')}
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={t('notesPlaceholder')}
            />
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('videoUrl')}
            </label>
            <input
              type="url"
              name="video_url"
              value={formData.video_url}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              href={`/${resolvedParams.locale}/penalties/${resolvedParams.id}`}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {tCommon('cancel')}
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? tCommon('saving') : tCommon('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
