import { LanguageSelector } from '@/components/client/LanguageSelector';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

interface HeaderProps {
  locale: string;
}

export async function Header({ locale }: HeaderProps) {
  // Set the locale for static rendering
  const t = await getTranslations({ locale, namespace: 'HomePage' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tAuth = await getTranslations({ locale, namespace: 'auth' });

  return (
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
            {/* TODO: add more links: about us, contact, etc. */}
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
  );
}
