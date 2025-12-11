'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('auth');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage(t('noToken'));
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || t('emailVerified'));
          
          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            router.push(`/${locale}/login`);
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || t('verificationError'));
        }
      } catch (error) {
        console.error('Error verifying email:', error);
        setStatus('error');
        setMessage(t('verificationError'));
      }
    };

    verifyEmail();
  }, [searchParams, router, locale, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto h-12 w-12 text-blue-600">
                <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                {t('verifyingEmail')}
              </h2>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto h-12 w-12 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                {t('emailVerifiedTitle')}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>
              <p className="mt-4 text-sm text-gray-500">
                {t('redirectingToLogin')}
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto h-12 w-12 text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                {t('verificationFailedTitle')}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>
              <div className="mt-6">
                <Link
                  href={`/${locale}/login`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  {t('goToLogin')}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
