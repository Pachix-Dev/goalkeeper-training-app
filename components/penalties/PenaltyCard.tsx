import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface Penalty {
  id: number;
  opponent_name: string;
  match_date: string | null;
  penalty_taker: string;
  shot_direction: string;
  shot_height: string;
  result: string;
  goalkeeper_direction: string | null;
  goalkeeper_name?: string;
}

interface PenaltyCardProps {
  penalty: Penalty;
  locale: string;
  showGoalkeeper?: boolean;
}

export default function PenaltyCard({ penalty, locale, showGoalkeeper = false }: PenaltyCardProps) {
  const t = useTranslations('penalties');
  const tCommon = useTranslations('common');

  const getResultColor = (result: string) => {
    switch (result) {
      case 'saved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'goal':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'missed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'post':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'left':
        return '←';
      case 'right':
        return '→';
      case 'center':
        return '↓';
      default:
        return '•';
    }
  };

  const getHeightIcon = (height: string) => {
    switch (height) {
      case 'high':
        return '↑';
      case 'mid':
        return '→';
      case 'low':
        return '↓';
      default:
        return '•';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return tCommon('noDate');
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Link
      href={`/${locale}/penalties/${penalty.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 border border-gray-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 mb-1">
            {penalty.opponent_name}
          </h3>
          {showGoalkeeper && penalty.goalkeeper_name && (
            <p className="text-sm text-gray-600">
              {penalty.goalkeeper_name}
            </p>
          )}
          <p className="text-sm text-gray-500">
            {formatDate(penalty.match_date)}
          </p>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getResultColor(penalty.result)}`}>
          {t(`results.${penalty.result}`)}
        </span>
      </div>

      {/* Penalty Taker */}
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700">
          {t('penaltyTaker')}: <span className="text-gray-900">{penalty.penalty_taker}</span>
        </p>
      </div>

      {/* Shot Info */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-gray-50 rounded p-2">
          <p className="text-xs text-gray-600 mb-1">{t('shotDirection')}</p>
          <div className="flex items-center gap-1">
            <span className="text-lg">{getDirectionIcon(penalty.shot_direction)}</span>
            <span className="text-sm font-medium">{t(`directions.${penalty.shot_direction}`)}</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded p-2">
          <p className="text-xs text-gray-600 mb-1">{t('shotHeight')}</p>
          <div className="flex items-center gap-1">
            <span className="text-lg">{getHeightIcon(penalty.shot_height)}</span>
            <span className="text-sm font-medium">{t(`heights.${penalty.shot_height}`)}</span>
          </div>
        </div>
      </div>

      {/* Goalkeeper Direction */}
      {penalty.goalkeeper_direction && (
        <div className="bg-blue-50 rounded p-2">
          <p className="text-xs text-gray-600 mb-1">{t('goalkeeperDirection')}</p>
          <div className="flex items-center gap-1">
            <span className="text-lg">{getDirectionIcon(penalty.goalkeeper_direction)}</span>
            <span className="text-sm font-medium">{t(`directions.${penalty.goalkeeper_direction}`)}</span>
          </div>
        </div>
      )}
    </Link>
  );
}
