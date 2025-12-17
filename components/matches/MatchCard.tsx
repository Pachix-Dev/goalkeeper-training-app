import { useTranslations } from 'next-intl';
import Link from 'next/link';

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

interface MatchCardProps {
  match: MatchAnalysis;
  locale: string;
  showGoalkeeper?: boolean;
}

export default function MatchCard({ match, locale, showGoalkeeper = false }: MatchCardProps) {
  const t = useTranslations('matches');

  const getRatingColor = (rating: number | null) => {
    if (!rating) return 'bg-gray-100 text-gray-800';
    if (rating >= 8) return 'bg-green-100 text-green-800';
    if (rating >= 6) return 'bg-blue-100 text-blue-800';
    if (rating >= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getCleanSheetBadge = (goals: number) => {
    if (goals === 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Clean Sheet
        </span>
      );
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Link
      href={`/${locale}/matches/${match.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 border border-gray-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 mb-1">
            vs {match.opponent}
          </h3>
          {showGoalkeeper && match.goalkeeper_name && (
            <p className="text-sm text-gray-600">
              {match.goalkeeper_name}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-500">
              {formatDate(match.match_date)}
            </p>
            {match.competition && (
              <>
                <span className="text-gray-400">•</span>
                <p className="text-sm text-gray-500">{match.competition}</p>
              </>
            )}
          </div>
        </div>
        
        {match.rating && (
          <div className={`px-3 py-2 rounded-lg text-center ${getRatingColor(match.rating)}`}>
            <div className="text-2xl font-bold">
              {typeof match.rating === 'number' 
                ? match.rating.toFixed(1) 
                : parseFloat(match.rating).toFixed(1)}
            </div>
            <div className="text-xs">{t('rating')}</div>
          </div>
        )}
      </div>

      {/* Result */}
      {match.result && (
        <div className="mb-3">
          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
            {match.result}
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded p-2 text-center">
          <p className="text-2xl font-bold text-blue-700">{match.saves}</p>
          <p className="text-xs text-gray-600">{t('saves')}</p>
        </div>
        <div className={`rounded p-2 text-center ${match.goals_conceded === 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className={`text-2xl font-bold ${match.goals_conceded === 0 ? 'text-green-700' : 'text-red-700'}`}>
            {match.goals_conceded}
          </p>
          <p className="text-xs text-gray-600">{t('goalsConceded')}</p>
        </div>
        <div className="flex items-center justify-center">
          {getCleanSheetBadge(match.goals_conceded)}
        </div>
      </div>
    </Link>
  );
}
