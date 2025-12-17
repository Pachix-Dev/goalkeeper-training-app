'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { apiGet, apiPut } from '@/lib/utils/api';

interface Team {
  id: number;
  name: string;
}

interface Session {
  id: number;
  title: string;
  description: string | null;
  session_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  team_id: number;
  session_type: string;
  status: string;
  notes: string | null;
  weather: string | null;
}

export default function EditSessionPage() {
  const t = useTranslations('sessions');
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const sessionId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    session_date: '',
    start_time: '',
    end_time: '',
    location: '',
    team_id: '',
    session_type: 'training',
    status: 'planned',
    notes: '',
    weather: ''
  });

  useEffect(() => {
    loadData();
  }, [sessionId]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [session, teamsData] = await Promise.all([
        apiGet<Session>(`/api/sessions/${sessionId}`),
        apiGet<{ teams: Team[] }>('/api/teams')
      ]);

      // Formatear la fecha al formato YYYY-MM-DD para el input type="date"
      const sessionDate = session.session_date ? session.session_date.split('T')[0] : '';
      
      setFormData({
        title: session.title,
        description: session.description || '',
        session_date: sessionDate,
        start_time: session.start_time || '',
        end_time: session.end_time || '',
        location: session.location || '',
        team_id: session.team_id.toString(),
        session_type: session.session_type,
        status: session.status,
        notes: session.notes || '',
        weather: session.weather || ''
      });

      setTeams(Array.isArray(teamsData.teams) ? teamsData.teams : []);
    } catch (error) {
      console.error('Error loading data:', error);
      alert(t('errorLoading'));
      router.push(`/${locale}/sessions`);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        team_id: parseInt(formData.team_id)
      };

      await apiPut(`/api/sessions/${sessionId}`, payload);
      router.push(`/${locale}/sessions/${sessionId}`);
    } catch (error) {
      console.error(t('errorUpdating'), error);
      const message = error instanceof Error ? error.message : t('errorUpdating');
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-center text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('editSession')}</h1>
          <p className="text-gray-600 mt-2">Actualiza la información de la sesión</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-4">{t('basicInfo')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('sessionTitle')} *
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder={t('titlePlaceholder')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('description')}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={t('descriptionPlaceholder')}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('team')} *
                </label>
                <select
                  name="team_id"
                  value={formData.team_id}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('selectTeam')}</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-4">{t('dateTime')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('sessionDate')} *
                </label>
                <Input
                  type="date"
                  name="session_date"
                  value={formData.session_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('startTime')}
                </label>
                <Input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('endTime')}
                </label>
                <Input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('location')}
              </label>
              <Input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder={t('locationPlaceholder')}
              />
            </div>
          </Card>

          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-4">{t('sessionDetails')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('sessionType')} *
                </label>
                <select
                  name="session_type"
                  value={formData.session_type}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="training">{t('training')}</option>
                  <option value="match">{t('match')}</option>
                  <option value="recovery">{t('recovery')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('status')} *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="planned">{t('planned')}</option>
                  <option value="completed">{t('completed')}</option>
                  <option value="cancelled">{t('cancelled')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('weather')}
                </label>
                <Input
                  name="weather"
                  value={formData.weather}
                  onChange={handleChange}
                  placeholder={t('weatherPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('notes')}
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder={t('notesPlaceholder')}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/${locale}/sessions/${sessionId}`)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
