import { useTranslations } from 'next-intl';
import { 
  ClipboardDocumentListIcon, 
  ChartBarIcon, 
  UserGroupIcon,
  PencilSquareIcon,
  TrophyIcon,
  DocumentChartBarIcon,
  
  CloudIcon,
  BoltIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function LandingPage() {
  const t = useTranslations('landing');
  const locale = useLocale();

  const features = [
    {
      icon: PencilSquareIcon,
      titleKey: 'tacticalEditor',
      descriptionKey: 'tacticalEditor'
    },
    {
      icon: ClipboardDocumentListIcon,
      titleKey: 'sessionPlanning',
      descriptionKey: 'sessionPlanning'
    },
    {
      icon: TrophyIcon,
      titleKey: 'penaltyTracking',
      descriptionKey: 'penaltyTracking'
    },
    {
      icon: DocumentChartBarIcon,
      titleKey: 'matchAnalysis',
      descriptionKey: 'matchAnalysis'
    },
    {
      icon: ChartBarIcon,
      titleKey: 'statistics',
      descriptionKey: 'statistics'
    },
    {
      icon: UserGroupIcon,
      titleKey: 'teamManagement',
      descriptionKey: 'teamManagement'
    }
  ];

  const benefits = [
    {
      icon: AcademicCapIcon,
      titleKey: 'professional',
      descriptionKey: 'professional'
    },
    {
      icon: BoltIcon,
      titleKey: 'efficient',
      descriptionKey: 'efficient'
    },
    {
      icon: ChartBarIcon,
      titleKey: 'datadriven',
      descriptionKey: 'datadriven'
    },
    {
      icon: CloudIcon,
      titleKey: 'cloud',
      descriptionKey: 'cloud'
    }
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">GK</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Goalkeeper Training</span>
          </div>
          <Link 
            href={`/${locale}/login`}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            {t('hero.login')}
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/login`}
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              {t('hero.cta')}
            </Link>
            <Link
              href={`/${locale}/login`}
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              {t('hero.login')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('features.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('features.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t(`features.${feature.titleKey}.title`)}
                  </h3>
                  <p className="text-gray-600">
                    {t(`features.${feature.descriptionKey}.description`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-linear-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            {t('benefits.title')}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={index}
                  className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t(`benefits.${benefit.titleKey}.title`)}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {t(`benefits.${benefit.descriptionKey}.description`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {t('cta.subtitle')}
          </p>
          <Link
            href={`/${locale}/login`}
            className="inline-block px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-xl"
          >
            {t('cta.button')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">GK</span>
                </div>
                <span className="font-bold text-white">Goalkeeper Training</span>
              </div>
              <p className="text-sm text-gray-400">
                {t('hero.subtitle')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">{t('footer.product')}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.features')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.pricing')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">{t('footer.company')}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.about')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.contact')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">{t('footer.legal')}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Goalkeeper Training. {t('footer.rights')}.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
