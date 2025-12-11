import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { GoalkeeperWithTeam } from '@/lib/types/database';

interface GoalkeeperCardProps {
  goalkeeper: GoalkeeperWithTeam;
  onDelete: () => void;
}

export function GoalkeeperCard({ goalkeeper, onDelete }: GoalkeeperCardProps) {
  const locale = useLocale();
  const t = useTranslations('goalkeepers');
  const tc = useTranslations('common');

  // Calcular edad si hay fecha de nacimiento
  const calculateAge = (dob: Date | undefined) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(goalkeeper.date_of_birth);
  const fullName = `${goalkeeper.first_name} ${goalkeeper.last_name}`;
  const initials = `${goalkeeper.first_name.charAt(0)}${goalkeeper.last_name.charAt(0)}`.toUpperCase();

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Header con foto/avatar */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6">
        <div className="flex items-center gap-4">
          {goalkeeper.photo ? (
            <img
              src={goalkeeper.photo}
              alt={fullName}
              className="w-20 h-20 rounded-full border-4 border-white object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full border-4 border-white bg-blue-300 flex items-center justify-center text-white font-bold text-2xl">
              {initials}
            </div>
          )}
          <div className="flex-1 text-white">
            <h3 className="text-xl font-bold">{fullName}</h3>
            {goalkeeper.jersey_number && (
              <p className="text-blue-100 text-lg font-semibold">
                #{goalkeeper.jersey_number}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {/* Equipo */}
        {goalkeeper.team_name ? (
          <div className="mb-4 flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="font-medium">{goalkeeper.team_name}</span>
            {goalkeeper.team_category && (
              <span className="ml-2 text-gray-500">• {goalkeeper.team_category}</span>
            )}
          </div>
        ) : (
          <div className="mb-4 flex items-center text-sm text-gray-400">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            {t('noTeam')}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {age && (
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xl font-bold text-blue-600">{age}</p>
              <p className="text-xs text-gray-600 mt-1">{t('years')}</p>
            </div>
          )}
          {goalkeeper.height && (
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xl font-bold text-green-600">{goalkeeper.height}</p>
              <p className="text-xs text-gray-600 mt-1">{t('cm')}</p>
            </div>
          )}
          {goalkeeper.weight && (
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xl font-bold text-purple-600">{goalkeeper.weight}</p>
              <p className="text-xs text-gray-600 mt-1">{t('kg')}</p>
            </div>
          )}
        </div>

        {/* Mano Dominante */}
        {goalkeeper.dominant_hand && (
          <div className="mb-4 flex items-center text-sm">
            <span className="text-gray-600">{t('dominantHand')}:</span>
            <span className="ml-2 font-medium text-gray-900">
              {goalkeeper.dominant_hand === 'left' && t('leftHand')}
              {goalkeeper.dominant_hand === 'right' && t('rightHand')}
              {goalkeeper.dominant_hand === 'both' && t('bothHands')}
            </span>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2">
          <Link
            href={`/${locale}/goalkeepers/${goalkeeper.id}`}
            className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            {tc('view')}
          </Link>
          <Link
            href={`/${locale}/goalkeepers/${goalkeeper.id}/edit`}
            className="flex-1 text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            {tc('edit')}
          </Link>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
          >
            {tc('delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
