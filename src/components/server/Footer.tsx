import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

interface FooterProps {
  locale: string;
}

export async function Footer({ locale }: FooterProps) {
  // Set the locale for static rendering
  const t = await getTranslations({ locale, namespace: 'HomePage' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  return (
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
  );
}
