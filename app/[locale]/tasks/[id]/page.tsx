'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { apiGet, apiDelete } from '@/lib/utils/api';

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
  is_public: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
}

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    technical: 'bg-blue-100 text-blue-800',
    tactical: 'bg-purple-100 text-purple-800',
    physical: 'bg-green-100 text-green-800',
    psychological: 'bg-yellow-100 text-yellow-800',
    goalkeeper_specific: 'bg-red-100 text-red-800'
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

const getDifficultyColor = (difficulty: string): string => {
  const colors: Record<string, string> = {
    beginner: 'bg-green-500',
    intermediate: 'bg-yellow-500',
    advanced: 'bg-red-500'
  };
  return colors[difficulty] || 'bg-gray-500';
};

export default function TaskDetailPage() {
  const t = useTranslations('tasks');
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const data = await apiGet<Task>(`/api/tasks/${taskId}`);
      setTask(data);
    } catch (error) {
      console.error(t('errorLoading'), error);
      alert(t('errorLoading'));
      router.push(`/${locale}/tasks`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      await apiDelete(`/api/tasks/${taskId}`);
      router.push(`/${locale}/tasks`);
    } catch (error) {
      console.error(t('errorDeleting'), error);
      alert(t('errorDeleting'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-center text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/${locale}/tasks`)}
            className="mb-4"
          >
            ← Volver
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
              {task.subcategory && (
                <p className="text-gray-600 mt-1">{task.subcategory}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/${locale}/tasks/${taskId}/edit`)}
              >
                {t('editTask')}
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="text-red-600 hover:bg-red-50"
              >
                {t('deleteTask')}
              </Button>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-3 mb-6">
          <span
            className={`text-sm px-3 py-1 rounded-full font-medium ${getCategoryColor(
              task.category
            )}`}
          >
            {t(task.category as any)}
          </span>
          {task.difficulty && (
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
              <div
                className={`w-2.5 h-2.5 rounded-full ${getDifficultyColor(
                  task.difficulty
                )}`}
              />
              <span className="text-sm text-gray-700">
                {t(task.difficulty as any)}
              </span>
            </div>
          )}
          {task.duration && (
            <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              {task.duration} {t('minutes')}
            </span>
          )}
          {task.is_public && (
            <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              {t('publicTasks')}
            </span>
          )}
        </div>

        {/* Image */}
        {task.image_url && (
          <Card className="mb-6 p-0 overflow-hidden">
            <img
              src={task.image_url}
              alt={task.title}
              className="w-full h-64 object-cover"
            />
          </Card>
        )}

        {/* Description */}
        {task.description && (
          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              {t('description')}
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {task.description}
            </p>
          </Card>
        )}

        {/* Objectives */}
        {task.objectives && (
          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-3">{t('objectives')}</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {task.objectives}
            </p>
          </Card>
        )}

        {/* Materials */}
        {task.materials && (
          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-3">{t('materials')}</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {task.materials}
            </p>
          </Card>
        )}

        {/* Instructions */}
        {task.instructions && (
          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              {t('instructions')}
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {task.instructions}
            </p>
          </Card>
        )}

        {/* Video */}
        {task.video_url && (
          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-3">{t('videoUrl')}</h2>
            <div className="aspect-video">
              <iframe
                src={task.video_url.replace('watch?v=', 'embed/')}
                className="w-full h-full rounded-lg"
                allowFullScreen
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
