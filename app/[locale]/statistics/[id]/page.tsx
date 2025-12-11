'use client';

import { useEffect, useState, use } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoalkeeperStatistics } from '@/lib/db/models/GoalkeeperStatisticsModel';
import StatsGrid from '@/components/statistics/StatsGrid';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default function StatisticsDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const t = useTranslations('statistics');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [statistics, setStatistics] = useState<GoalkeeperStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const response = await fetch(`/api/statistics/${resolvedParams.id}`);
        if (!response.ok) throw new Error('Error al cargar estadísticas');
        
        const data = await response.json();
        setStatistics(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, [resolvedParams.id]);

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar estas estadísticas?')) return;

    try {
      const response = await fetch(`/api/statistics/${resolvedParams.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar');

      router.push(`/${resolvedParams.locale}/statistics`);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar las estadísticas');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">{t('loadingStatistics')}</div>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">{t('noStatistics')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/${resolvedParams.locale}/statistics`}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← {tCommon('back')}
        </Link>
      </div>

      {/* Encabezado */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {statistics.goalkeeper_name}
            </h1>
            <div className="flex gap-4 text-gray-600">
              <span className="flex items-center gap-2">
                🏆 <strong>{statistics.season}</strong>
              </span>
              {statistics.team_name && (
                <span className="flex items-center gap-2">
                  🔵 {statistics.team_name}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              🗑️ {t('actions.delete')}
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Estadísticas</h2>
        <StatsGrid statistics={statistics} />
      </div>

      {/* Detalles adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Penaltis */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">⚽ Penaltis</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">{t('fields.penaltiesFaced')}</span>
              <span className="font-bold text-lg">{statistics.penalties_faced}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">{t('fields.penaltiesSaved')}</span>
              <span className="font-bold text-lg text-green-700">{statistics.penalties_saved}</span>
            </div>
            {statistics.penalty_save_percentage !== undefined && (
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700">{t('calculated.penaltySavePercentage')}</span>
                <span className="font-bold text-lg text-blue-700">
                  {statistics.penalty_save_percentage.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Disciplina */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">⚠️ Disciplina</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span className="text-gray-700">{t('fields.yellowCards')}</span>
              <span className="font-bold text-lg text-yellow-700">{statistics.yellow_cards}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-gray-700">{t('fields.redCards')}</span>
              <span className="font-bold text-lg text-red-700">{statistics.red_cards}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fechas */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">📅 Información del Registro</h3>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Creado:</span>{' '}
            {new Date(statistics.created_at).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Actualizado:</span>{' '}
            {new Date(statistics.updated_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
