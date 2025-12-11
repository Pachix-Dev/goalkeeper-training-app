'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password, remember });
      router.push(`/${locale}/dashboard`);
    } catch {
      setError('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>
        
        <Card>
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('auth.welcome')}
            </h1>
            <p className="text-gray-600">{t('auth.loginSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label={t('auth.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />

            <Input
              type="password"
              label={t('auth.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">
                  {t('auth.remember')}
                </span>
              </label>
              <a
                href={`/${locale}/forgot-password`}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {t('auth.forgotPassword')}
              </a>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full"
            >
              {t('auth.login')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('auth.noAccount')}{' '}
              <a
                href={`/${locale}/register`}
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                {t('auth.register')}
              </a>
            </p>
          </div>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>{t('app.title')}</p>
          <p className="mt-1">{t('app.description')}</p>
        </div>
      </div>
    </div>
  );
}
