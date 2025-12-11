'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiGet, apiDelete } from '@/lib/utils/api';

interface Task {
  id: number;
  title: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  duration: number | null;
  difficulty: string | null;
  is_public: boolean;
  user_id: number;
}

export default function TasksPage() {
  const t = useTranslations('tasks');
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showMyTasks, setShowMyTasks] = useState(false);

  const categories = [
    'technical',
    'tactical',
    'physical',
    'psychological',
    'goalkeeper_specific'
  ];

  useEffect(() => {
    loadTasks();
  }, [selectedCategory, showMyTasks]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      if (showMyTasks) params.append('my_tasks', 'true');

      const data = await apiGet<Task[]>(`/api/tasks?${params.toString()}`);
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(t('errorLoading'), error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadTasks();
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      await apiDelete(`/api/tasks/${id}`);
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error(t('errorDeleting'), error);
      alert(t('errorDeleting'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-2">{t('subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="md:col-span-2">
              <Input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('allTasks')}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {t(cat as any)}
                </option>
              ))}
            </select>

            {/* My Tasks Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showMyTasks}
                onChange={(e) => setShowMyTasks(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{t('myTasks')}</span>
            </label>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={() => router.push(`/${locale}/tasks/new`)}>
              + {t('createTask')}
            </Button>
          </div>
        </div>

        {/* Tasks Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-2">{t('noTasks')}</p>
            <p className="text-sm text-gray-500 mb-6">
              {t('noTasksDescription')}
            </p>
            <Button onClick={() => router.push(`/${locale}/tasks/new`)}>
              + {t('createTask')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
