import { LanguageSelector } from '@/components/client/LanguageSelector';
import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from "next/image";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  console.log('Current locale received:', locale);

  const t = await getTranslations('HomePage');
  const tNav = await getTranslations('nav');
  const tCommon = await getTranslations('common');
  const tAuth = await getTranslations('auth');

  // Debug: Let's check what translations we're actually getting
  console.log('HomePage translations loaded:', {
    locale: locale,
    hero_title: t('hero.title'),
    nav_home: tNav('home'),
    auth_signIn: tAuth('signIn')
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AH</span>
                </div>
                <span className="font-bold text-xl text-gray-900 dark:text-white">
                  {t('footer.company')}
                </span>
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
              >
                {tNav('home')}
              </Link>
              <Link
                href="/search"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
              >
                {tNav('search')}
              </Link>
              <Link
                href="/emergency"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
              >
                {tNav('emergency')}
              </Link>
            </nav>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <Link
                href="/signin"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {tAuth('signIn')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/search"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg"
              >
                {t('hero.cta')}
              </Link>
              <Link
                href="/emergency"
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                {t('hero.ctaSecondary')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">500+</div>
              <div className="text-gray-600 dark:text-gray-400">{t('stats.officers')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">10K+</div>
              <div className="text-gray-600 dark:text-gray-400">{t('stats.requests')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">50+</div>
              <div className="text-gray-600 dark:text-gray-400">{t('stats.cities')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">98%</div>
              <div className="text-gray-600 dark:text-gray-400">{t('stats.satisfaction')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('features.title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Image src="/file.svg" alt="" width={24} height={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('features.search.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('features.search.description')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                <Image src="/window.svg" alt="" width={24} height={24} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('features.emergency.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('features.emergency.description')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <Image src="/globe.svg" alt="" width={24} height={24} className="text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('features.track.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('features.track.description')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <div className="w-6 h-6 bg-purple-600 dark:bg-purple-400 rounded"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('features.secure.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('features.secure.description')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-4">
                <div className="w-6 h-6 bg-yellow-600 dark:bg-yellow-400 rounded"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('features.support.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('features.support.description')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                <div className="w-6 h-6 bg-indigo-600 dark:bg-indigo-400 rounded"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('features.verified.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('features.verified.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AH</span>
                </div>
                <span className="font-bold text-xl">{t('footer.company')}</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                {t('footer.description')}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">{tCommon('quickLinks')}</h4>
              <div className="space-y-2">
                <Link href="/search" className="block text-gray-400 hover:text-white transition-colors">
                  {tNav('search')}
                </Link>
                <Link href="/emergency" className="block text-gray-400 hover:text-white transition-colors">
                  {tNav('emergency')}
                </Link>
                <Link href="/about" className="block text-gray-400 hover:text-white transition-colors">
                  {t('footer.links.about')}
                </Link>
                <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors">
                  {t('footer.links.contact')}
                </Link>
              </div>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Legal</h4>
              <div className="space-y-2">
                <Link href="/privacy" className="block text-gray-400 hover:text-white transition-colors">
                  {t('footer.links.privacy')}
                </Link>
                <Link href="/terms" className="block text-gray-400 hover:text-white transition-colors">
                  {t('footer.links.terms')}
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
