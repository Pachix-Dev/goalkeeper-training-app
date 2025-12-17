'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { apiGet, apiPut } from '@/lib/utils/api';

interface Task {
  id: number;
  title: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  duration: number | null;
  difficulty: string | null;
  objectives: string | null;
  materials: string | null;
  instructions: string | null;
  video_url: string | null;
  image_url: string | null;
  design_id: number | null;
  is_public: boolean;
}

const getCategoryLabel = (category: string, t: any): string => {
  const labels: Record<string, string> = {
    technical: t('technical'),
    tactical: t('tactical'),
    physical: t('physical'),
    psychological: t('psychological'),
    goalkeeper_specific: t('goalkeeper_specific')
  };
  return labels[category] || category;
};

const getDifficultyLabel = (difficulty: string, t: any): string => {
  const labels: Record<string, string> = {
    beginner: t('beginner'),
    intermediate: t('intermediate'),
    advanced: t('advanced')
  };
  return labels[difficulty] || difficulty;
};

const STORAGE_KEY_PREFIX = 'task-edit-draft-';

export default function EditTaskPage() {
  const t = useTranslations('tasks');
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const taskId = params.id as string;
  const STORAGE_KEY = STORAGE_KEY_PREFIX + taskId;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
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
    design_id: null as number | null,
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

  useEffect(() => {
    loadTask();
  }, [taskId]);

  // Guardar formData en sessionStorage cada vez que cambie (excepto durante carga inicial)
  useEffect(() => {
    if (!loadingData) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, loadingData, STORAGE_KEY]);

  // Capturar design_id cuando se regresa del editor
  useEffect(() => {
    const designId = searchParams.get('design_id');
    if (designId) {
      setFormData(prev => ({ ...prev, design_id: parseInt(designId) }));
    }
  }, [searchParams]);

  const loadTask = async () => {
    try {
      setLoadingData(true);
      
      // Primero intentar cargar desde sessionStorage (si hay cambios no guardados)
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setFormData(JSON.parse(saved));
          setLoadingData(false);
          return; // Usar datos guardados en vez de recargar
        } catch (e) {
          console.error('Error parsing saved form data:', e);
        }
      }
      
      // Si no hay datos guardados, cargar desde API
      const data = await apiGet<{ task: Task }>(`/api/tasks/${taskId}`);
      const task = data.task;
      setFormData({
        title: task.title,
        description: task.description || '',
        category: task.category,
        subcategory: task.subcategory || '',
        duration: task.duration?.toString() || '',
        difficulty: task.difficulty || '',
        objectives: task.objectives || '',
        materials: task.materials || '',
        instructions: task.instructions || '',
        video_url: task.video_url || '',
        image_url: task.image_url || '',
        design_id: task.design_id,
        is_public: task.is_public
      });
    } catch (error) {
      console.error(t('errorLoading'), error);
      alert(t('errorLoading'));
      router.push(`/${locale}/tasks`);
    } finally {
      setLoadingData(false);
    }
  };

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
        duration: formData.duration ? parseInt(formData.duration) : null,
        design_id: formData.design_id,
        is_public: Boolean(formData.is_public)
      };

      await apiPut(`/api/tasks/${taskId}`, payload);
      // Limpiar el draft guardado después de actualizar exitosamente
      sessionStorage.removeItem(STORAGE_KEY);
      router.push(`/${locale}/tasks/${taskId}`);
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
          <h1 className="text-3xl font-bold text-gray-900">
            {t('editTask')}
          </h1>
          <p className="text-gray-600 mt-2">{t('editTaskSubtitle')}</p>
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
                      {getCategoryLabel(cat, t)}
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
                      {getDifficultyLabel(diff, t)}
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

              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('diagramSection')}
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  {t('drawExerciseDescription')}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const returnUrl = encodeURIComponent(window.location.href);
                    // Solo pasar design_id si ya existe (para editarlo)
                    const editorUrl = formData.design_id 
                      ? `/${locale}/editor?design_id=${formData.design_id}&returnTo=${returnUrl}&mode=task`
                      : `/${locale}/editor?returnTo=${returnUrl}&mode=task`;
                    router.push(editorUrl);
                  }}
                >
                  {formData.design_id ? t('editDiagram') : t('drawExercise')}
                </Button>
                {formData.design_id && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {t('diagramLinked')}
                  </p>
                )}
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
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
