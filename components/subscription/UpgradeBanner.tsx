'use client';

import { useLocale } from 'next-intl';
import { ExclamationTriangleIcon, ArrowUpIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface UpgradeBannerProps {
  type: 'limit' | 'feature';
  resource?: string;
  feature?: string;
  current?: number;
  max?: number;
}

export function UpgradeBanner({ type, resource, feature, current, max }: UpgradeBannerProps) {
  const locale = useLocale();

  const texts = {
    es: {
      limitTitle: 'Límite alcanzado',
      limitMessage: `Has alcanzado el límite de ${resource} de tu plan (${current}/${max})`,
      featureTitle: 'Función premium',
      featureMessage: `${feature} requiere un plan superior`,
      upgradeButton: 'Mejorar plan',
    },
    en: {
      limitTitle: 'Limit reached',
      limitMessage: `You've reached the ${resource} limit of your plan (${current}/${max})`,
      featureTitle: 'Premium feature',
      featureMessage: `${feature} requires a higher plan`,
      upgradeButton: 'Upgrade plan',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.es;

  return (
    <div className="rounded-lg bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 p-4">
      <div className="flex items-start gap-3">
        <ExclamationTriangleIcon className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-amber-800">
            {type === 'limit' ? t.limitTitle : t.featureTitle}
          </h4>
          <p className="text-sm text-amber-700 mt-1">
            {type === 'limit' ? t.limitMessage : t.featureMessage}
          </p>
        </div>
        <Link
          href={`/${locale}/pricing`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium shrink-0"
        >
          <ArrowUpIcon className="h-4 w-4" />
          {t.upgradeButton}
        </Link>
      </div>
    </div>
  );
}

interface FeatureGateProps {
  feature: string;
  hasAccess: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ feature, hasAccess, children, fallback }: FeatureGateProps) {
  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return <UpgradeBanner type="feature" feature={feature} />;
}

interface LimitGateProps {
  resource: string;
  canCreate: boolean;
  current: number;
  max: number;
  children: React.ReactNode;
  showBanner?: boolean;
}

export function LimitGate({ 
  resource, 
  canCreate, 
  current, 
  max, 
  children, 
  showBanner = true 
}: LimitGateProps) {
  return (
    <>
      {!canCreate && showBanner && (
        <div className="mb-4">
          <UpgradeBanner 
            type="limit" 
            resource={resource} 
            current={current} 
            max={max} 
          />
        </div>
      )}
      {children}
    </>
  );
}
