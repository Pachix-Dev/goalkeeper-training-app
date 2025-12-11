'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { apiGet, apiDelete } from '@/lib/utils/api';

interface MatchAnalysis {
  id: number;
  goalkeeper_id: number;
  goalkeeper_name: string;
  opponent: string;
  match_date: string;
  competition: string | null;
  result: string | null;
  minutes_played: number | null;
  goals_conceded: number;
  saves: number;
  high_balls: number;
  crosses_caught: number;
  distribution_success_rate: number | null;
  rating: number | null;
  strengths: string | null;
  areas_for_improvement: string | null;
  notes: string | null;
  video_url: string | null;
}

export default function MatchDetailPage({ 
  params 
}: { 
  params: Promise<{ locale: string; id: string }> 
}) {
  const [resolvedParams, setResolvedParams] = useState<{ locale: string; id: string } | null>(null);
  const [match, setMatch] = useState<MatchAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();
  const t = useTranslations('matches');
  const tCommon = useTranslations('common');

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const loadMatch = useCallback(async () => {
    try {
      const data = await apiGet(`/api/matches/${resolvedParams!.id}`);
      setMatch(data);
    } catch (error) {
      console.error('Error loading match:', error);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams]);

  useEffect(() => {
    if (resolvedParams) {
      loadMatch();
    }
  }, [resolvedParams, loadMatch]);

  const handleDelete = async () => {
    if (!confirm(t('confirmDelete'))) return;

    setDeleting(true);
    try {
      await apiDelete(`/api/matches/${resolvedParams!.id}`);
      router.push(`/${resolvedParams!.locale}/matches`);
    } catch (error) {
      console.error('Error deleting match:', error);
      alert(tCommon('error'));
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(resolvedParams!.locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRatingColor = (rating: number | null) => {
    if (!rating) return 'bg-gray-100 text-gray-800';
    if (rating >= 8) return 'bg-green-100 text-green-800';
    if (rating >= 6) return 'bg-blue-100 text-blue-800';
    if (rating >= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
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

  if (!match) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{t('noMatches')}</p>
          <Link
            href={`/${resolvedParams.locale}/matches`}
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
          href={`/${resolvedParams.locale}/matches`}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← {tCommon('back')}
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              vs {match.opponent}
            </h1>
            <p className="text-gray-600">{formatDate(match.match_date)}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/${resolvedParams.locale}/matches/${match.id}/edit`}
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
          <h2 className="text-xl font-semibold mb-4">{t('matchDetails')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">{tCommon('goalkeeper')}</p>
              <p className="font-medium">{match.goalkeeper_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('opponent')}</p>
              <p className="font-medium">{match.opponent}</p>
            </div>
            {match.competition && (
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('competition')}</p>
                <p className="font-medium">{match.competition}</p>
              </div>
            )}
            {match.result && (
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('result')}</p>
                <p className="font-medium">{match.result}</p>
              </div>
            )}
            {match.minutes_played !== null && (
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('minutesPlayed')}</p>
                <p className="font-medium">{match.minutes_played}&apos;</p>
              </div>
            )}
            {match.rating !== null && (
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('rating')}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRatingColor(match.rating)}`}>
                  {match.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">{t('metrics')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-3xl font-bold text-red-700">{match.goals_conceded}</p>
              <p className="text-sm text-gray-600 mt-1">{t('goalsConceded')}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-700">{match.saves}</p>
              <p className="text-sm text-gray-600 mt-1">{t('saves')}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-700">{match.high_balls}</p>
              <p className="text-sm text-gray-600 mt-1">{t('highBalls')}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-700">{match.crosses_caught}</p>
              <p className="text-sm text-gray-600 mt-1">{t('crossesCaught')}</p>
            </div>
          </div>
          {match.distribution_success_rate !== null && (
            <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{t('distributionRate')}</p>
              <div className="flex items-center">
                <div className="flex-1 bg-gray-200 rounded-full h-3 mr-3">
                  <div
                    className="bg-indigo-600 h-3 rounded-full"
                    style={{ width: `${match.distribution_success_rate}%` }}
                  />
                </div>
                <span className="text-lg font-bold text-indigo-700">
                  {match.distribution_success_rate.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Analysis */}
        {(match.strengths || match.areas_for_improvement || match.notes) && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">{t('performance')}</h2>
            <div className="space-y-4">
              {match.strengths && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">{t('strengths')}</p>
                  <p className="text-gray-900 whitespace-pre-wrap bg-green-50 p-3 rounded-lg">
                    {match.strengths}
                  </p>
                </div>
              )}
              {match.areas_for_improvement && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">{t('areasForImprovement')}</p>
                  <p className="text-gray-900 whitespace-pre-wrap bg-yellow-50 p-3 rounded-lg">
                    {match.areas_for_improvement}
                  </p>
                </div>
              )}
              {match.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">{t('notes')}</p>
                  <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                    {match.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Video */}
        {match.video_url && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">{t('videoUrl')}</h2>
            <a
              href={match.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline break-all"
            >
              {match.video_url}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
