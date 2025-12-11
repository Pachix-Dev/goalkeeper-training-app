'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { apiGet, apiPost } from '@/lib/utils/api';

interface Team {
  id: number;
  name: string;
}

export default function NewSessionPage() {
  const t = useTranslations('sessions');
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const [loading, setLoading] = useState(false);
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
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const data = await apiGet<Team[]>('/api/teams');
      setTeams(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading teams:', error);
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

      await apiPost('/api/sessions', payload);
      router.push(`/${locale}/sessions`);
    } catch (error: any) {
      console.error(t('errorCreating'), error);
      alert(error.message || t('errorCreating'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('createSession')}</h1>
          <p className="text-gray-600 mt-2">{t('subtitle')}</p>
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
            <h2 className="text-xl font-semibold mb-4">{t('sessionConfig')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('sessionType')}
                </label>
                <select
                  name="session_type"
                  value={formData.session_type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="training">{t('training')}</option>
                  <option value="match">{t('match')}</option>
                  <option value="recovery">{t('recovery')}</option>
                  <option value="tactical">{t('tactical')}</option>
                  <option value="physical">{t('physical')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('status')}
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="planned">{t('planned')}</option>
                  <option value="completed">{t('completed')}</option>
                  <option value="cancelled">{t('cancelled')}</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
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

            <div className="mt-4">
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
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : t('createSession')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
