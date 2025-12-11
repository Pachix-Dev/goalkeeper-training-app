'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { apiPost } from '@/lib/utils/api';

export default function NewTaskPage() {
  const t = useTranslations('tasks');
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    duration: '',
    difficulty: '',
    objectives: '',
    materials: '',
    instructions: '',
    video_url: '',
    image_url: '',
    is_public: false
  });

  const categories = [
    'technical',
    'tactical',
    'physical',
    'psychological',
    'goalkeeper_specific'
  ];

  const difficulties = ['beginner', 'intermediate', 'advanced'];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        duration: formData.duration ? parseInt(formData.duration) : null
      };

      await apiPost('/api/tasks', payload);
      router.push(`/${locale}/tasks`);
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
          <h1 className="text-3xl font-bold text-gray-900">
            {t('createTask')}
          </h1>
          <p className="text-gray-600 mt-2">{t('subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-4">{t('basicInfo')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('taskTitle')} *
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
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </Card>

          {/* Task Setup */}
          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-4">{t('taskSetup')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('category')} *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{t('selectCategory')}</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {t(cat as any)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('subcategory')}
                </label>
                <Input
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  placeholder={t('subcategoryPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('duration')}
                </label>
                <Input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder={t('durationPlaceholder')}
                  min="1"
                  max="300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('difficulty')}
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{t('selectDifficulty')}</option>
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>
                      {t(diff as any)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('objectives')}
                </label>
                <textarea
                  name="objectives"
                  value={formData.objectives}
                  onChange={handleChange}
                  placeholder={t('objectivesPlaceholder')}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('materials')}
                </label>
                <textarea
                  name="materials"
                  value={formData.materials}
                  onChange={handleChange}
                  placeholder={t('materialsPlaceholder')}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('instructions')}
                </label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  placeholder={t('instructionsPlaceholder')}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </Card>

          {/* Additional Resources */}
          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {t('additionalResources')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('videoUrl')}
                </label>
                <Input
                  type="url"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleChange}
                  placeholder={t('videoUrlPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('imageUrl')}
                </label>
                <Input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder={t('imageUrlPlaceholder')}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_public"
                  checked={formData.is_public}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700">
                  {t('makePublic')}
                </label>
              </div>
            </div>
          </Card>

          {/* Actions */}
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
              {loading ? 'Guardando...' : t('createTask')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
