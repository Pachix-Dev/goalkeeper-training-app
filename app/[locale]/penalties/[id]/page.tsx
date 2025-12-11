'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { apiGet, apiDelete } from '@/lib/utils/api';
import PenaltyGrid from '@/components/penalties/PenaltyGrid';

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
  created_at: string;
}

export default function PenaltyDetailPage({ 
  params 
}: { 
  params: Promise<{ locale: string; id: string }> 
}) {
  const [resolvedParams, setResolvedParams] = useState<{ locale: string; id: string } | null>(null);
  const [penalty, setPenalty] = useState<Penalty | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();
  const t = useTranslations('penalties');
  const tCommon = useTranslations('common');

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    if (resolvedParams) {
      loadPenalty();
    }
  }, [resolvedParams]);

  const loadPenalty = async () => {
    try {
      const data = await apiGet(`/api/penalties/${resolvedParams!.id}`);
      setPenalty(data);
    } catch (error) {
      console.error('Error loading penalty:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('confirmDelete'))) return;

    setDeleting(true);
    try {
      await apiDelete(`/api/penalties/${resolvedParams!.id}`);
      router.push(`/${resolvedParams!.locale}/penalties`);
    } catch (error) {
      console.error('Error deleting penalty:', error);
      alert(tCommon('error'));
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return tCommon('noDate');
    return new Date(dateString).toLocaleDateString(resolvedParams!.locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{tCommon('loading')}</p>
        </div>
      </div>
    );
  }

  if (!penalty) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{t('noPenalties')}</p>
          <Link
            href={`/${resolvedParams.locale}/penalties`}
            className="text-blue-600 hover:text-blue-700"
          >
            ← {tCommon('back')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/${resolvedParams.locale}/penalties`}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← {tCommon('back')}
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('penaltyDetails')}</h1>
            <p className="text-gray-600">{formatDate(penalty.match_date)}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/${resolvedParams.locale}/penalties/${penalty.id}/edit`}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {tCommon('edit')}
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {deleting ? tCommon('deleting') : tCommon('delete')}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Match Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">{tCommon('information')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">{tCommon('goalkeeper')}</p>
              <p className="font-medium">{penalty.goalkeeper_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('opponent')}</p>
              <p className="font-medium">{penalty.opponent_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('penaltyTaker')}</p>
              <p className="font-medium">{penalty.penalty_taker}</p>
            </div>
            {penalty.taker_foot && (
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('takerFoot')}</p>
                <p className="font-medium">{t(`feet.${penalty.taker_foot}`)}</p>
              </div>
            )}
            {penalty.competition && (
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('competition')}</p>
                <p className="font-medium">{penalty.competition}</p>
              </div>
            )}
          </div>
        </div>

        {/* Shot Visualization */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">{t('grid.title')}</h2>
          <PenaltyGrid
            direction={penalty.shot_direction}
            height={penalty.shot_height}
            showResult={true}
            result={penalty.result}
            readOnly={true}
          />
        </div>

        {/* Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">{tCommon('details')}</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('shotDirection')}</p>
                <p className="font-medium">{t(`directions.${penalty.shot_direction}`)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('shotHeight')}</p>
                <p className="font-medium">{t(`heights.${penalty.shot_height}`)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('result')}</p>
                <span className={`
                  inline-block px-3 py-1 rounded-full text-sm font-medium
                  ${penalty.result === 'saved' && 'bg-green-100 text-green-800'}
                  ${penalty.result === 'goal' && 'bg-red-100 text-red-800'}
                  ${penalty.result === 'missed' && 'bg-yellow-100 text-yellow-800'}
                  ${penalty.result === 'post' && 'bg-orange-100 text-orange-800'}
                `}>
                  {t(`results.${penalty.result}`)}
                </span>
              </div>
              {penalty.goalkeeper_direction && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('goalkeeperDirection')}</p>
                  <p className="font-medium">{t(`directions.${penalty.goalkeeper_direction}`)}</p>
                </div>
              )}
            </div>

            {penalty.notes && (
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('notes')}</p>
                <p className="text-gray-900 whitespace-pre-wrap">{penalty.notes}</p>
              </div>
            )}

            {penalty.video_url && (
              <div>
                <p className="text-sm text-gray-600 mb-2">{t('videoUrl')}</p>
                <a
                  href={penalty.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  {penalty.video_url}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
