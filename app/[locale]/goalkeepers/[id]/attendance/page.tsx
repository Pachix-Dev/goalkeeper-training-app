'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { apiGet } from '@/lib/utils/api';

interface Goalkeeper {
  id: number;
  first_name: string;
  last_name: string;
  photo_url: string | null;
}

interface Attendance {
  id: number;
  session_id: number;
  status: string;
  notes: string | null;
  session_title?: string;
  session_date?: string;
  session_type?: string;
}

interface Stats {
  total_sessions: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  injured_count: number;
  excused_count: number;
  attendance_rate: number;
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    late: 'bg-yellow-100 text-yellow-800',
    injured: 'bg-orange-100 text-orange-800',
    excused: 'bg-blue-100 text-blue-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export default function GoalkeeperAttendancePage() {
  const t = useTranslations('attendance');
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const goalkeeperId = params.id as string;

  const [goalkeeper, setGoalkeeper] = useState<Goalkeeper | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [goalkeeperId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gkData, attData] = await Promise.all([
        apiGet<any>(`/api/goalkeepers/${goalkeeperId}`),
        apiGet<Attendance[]>(`/api/attendance?goalkeeper_id=${goalkeeperId}&limit=50`)
      ]);

      setGoalkeeper(gkData.goalkeeper);
      setAttendances(Array.isArray(attData) ? attData : []);

      // Calcular estadísticas
      const totalSessions = attData.length;
      const presentCount = attData.filter((a: Attendance) => a.status === 'present').length;
      const absentCount = attData.filter((a: Attendance) => a.status === 'absent').length;
      const lateCount = attData.filter((a: Attendance) => a.status === 'late').length;
      const injuredCount = attData.filter((a: Attendance) => a.status === 'injured').length;
      const excusedCount = attData.filter((a: Attendance) => a.status === 'excused').length;
      const attendanceRate = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0;

      setStats({
        total_sessions: totalSessions,
        present_count: presentCount,
        absent_count: absentCount,
        late_count: lateCount,
        injured_count: injuredCount,
        excused_count: excusedCount,
        attendance_rate: Math.round(attendanceRate * 100) / 100
      });
    } catch (error) {
      console.error(t('errorLoading'), error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !goalkeeper) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div>
      <Button
        variant="outline"
        onClick={() => router.push(`/${locale}/goalkeepers/${goalkeeperId}`)}
        className="mb-4"
      >
        ← Volver
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('attendanceHistory')}</h1>
        <p className="text-gray-600 mt-2">
          {goalkeeper.first_name} {goalkeeper.last_name}
        </p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <Card className="text-center p-4">
            <p className="text-2xl font-bold text-gray-900">{stats.total_sessions}</p>
            <p className="text-xs text-gray-600">{t('totalSessions')}</p>
          </Card>
          <Card className="text-center p-4">
            <p className="text-2xl font-bold text-green-600">{stats.present_count}</p>
            <p className="text-xs text-gray-600">{t('presentCount')}</p>
          </Card>
          <Card className="text-center p-4">
            <p className="text-2xl font-bold text-red-600">{stats.absent_count}</p>
            <p className="text-xs text-gray-600">{t('absentCount')}</p>
          </Card>
          <Card className="text-center p-4">
            <p className="text-2xl font-bold text-yellow-600">{stats.late_count}</p>
            <p className="text-xs text-gray-600">{t('lateCount')}</p>
          </Card>
          <Card className="text-center p-4">
            <p className="text-2xl font-bold text-orange-600">{stats.injured_count}</p>
            <p className="text-xs text-gray-600">{t('injuredCount')}</p>
          </Card>
          <Card className="text-center p-4">
            <p className="text-2xl font-bold text-blue-600">{stats.excused_count}</p>
            <p className="text-xs text-gray-600">{t('excusedCount')}</p>
          </Card>
          <Card className="text-center p-4">
            <p className="text-2xl font-bold text-purple-600">{stats.attendance_rate}%</p>
            <p className="text-xs text-gray-600">{t('attendanceRate')}</p>
          </Card>
        </div>
      )}

      {/* Historial */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Historial</h2>
        {attendances.length === 0 ? (
          <p className="text-center text-gray-500 py-8">{t('noAttendance')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('date')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('session')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('status')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('notes')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendances.map((att) => (
                  <tr key={att.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {att.session_date && formatDate(att.session_date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{att.session_title}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(att.status)}`}>
                        {t(att.status as any)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{att.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>    
  );
}
