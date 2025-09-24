import { EmergencyLocationSearch } from '@/components/client/EmergencyLocationSearch';
import { QuickSearchForm } from '@/components/client/QuickSearchForm';
import { Footer } from '@/components/server/Footer';
import { Header } from '@/components/server/Header';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';

// Types for our database queries
interface City {
  id: string;
  name_ar: string;
  name_fr: string;
  region_ar: string;
  region_fr: string;
}

interface Stats {
  verifiedHuissiers: number;
  totalCities: number;
  completedRequests: number;
  sampleCities: City[];
}



// Server Component Example: Fetch database statistics
async function getStats(): Promise<Stats> {
  const supabase = await createClient();

  try {
    // Get total verified huissiers
    const { count: verifiedHuissiers } = await supabase
      .from('huissiers')
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'verified');

    // Get total cities
    const { count: totalCities } = await supabase
      .from('cities')
      .select('*', { count: 'exact', head: true });

    // Get completed requests this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: completedRequests } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('created_at', startOfMonth.toISOString());

    // Get sample cities for the locale
    const { data: sampleCities } = await supabase
      .from('cities')
      .select(`id, name_ar, name_fr, region_ar, region_fr`)
      .limit(6);

    return {
      verifiedHuissiers: verifiedHuissiers || 0,
      totalCities: totalCities || 0,
      completedRequests: completedRequests || 0,
      sampleCities: (sampleCities || []) as City[]
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      verifiedHuissiers: 0,
      totalCities: 0,
      completedRequests: 0,
      sampleCities: []
    };
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  console.log('Current locale received:', locale);

  const t = await getTranslations('HomePage');

  // Server Component Example: Fetch real database stats
  const stats = await getStats();

  // Debug: Let's check what translations we're actually getting
  console.log('HomePage translations loaded:', {
    locale: locale,
    hero_title: t('hero.title')
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation Header */}
      <Header locale={locale} />

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
              {/* Emergency Location Button - Client Component with GPS access */}
              <EmergencyLocationSearch locale={locale} />
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section - Server Component Example */}
      <section className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {locale === 'ar' ? 'إحصائيات المنصة' : 'Statistiques de la plateforme'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {locale === 'ar' ? 'أرقام حية من قاعدة البيانات' : 'Données en temps réel de notre base de données'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Verified Huissiers */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-8 text-center">
              <div className="text-4xl font-bold mb-2">{stats.verifiedHuissiers}</div>
              <div className="text-blue-100">
                {locale === 'ar' ? 'محضر موثق' : 'Huissiers vérifiés'}
              </div>
            </div>

            {/* Total Cities */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-8 text-center">
              <div className="text-4xl font-bold mb-2">{stats.totalCities}</div>
              <div className="text-green-100">
                {locale === 'ar' ? 'مدينة مغطاة' : 'Villes couvertes'}
              </div>
            </div>

            {/* Completed Requests */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-8 text-center">
              <div className="text-4xl font-bold mb-2">{stats.completedRequests}</div>
              <div className="text-purple-100">
                {locale === 'ar' ? 'طلب مكتمل هذا الشهر' : 'Requêtes complétées ce mois'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Search Section - API Route + Client Component Example */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {locale === 'ar' ? 'بحث سريع عن محضر' : 'Recherche rapide de huissier'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {locale === 'ar' ? 'ابحث عن محضر في منطقتك' : 'Trouvez un huissier dans votre région'}
            </p>
          </div>

          {/* Live Search Component (Client Component Example) */}
          <div className="max-w-2xl mx-auto">
            <QuickSearchForm locale={locale} />
          </div>
        </div>
      </section>

      {/* Sample Cities - Server Component Example */}
      {stats.sampleCities.length > 0 && (
        <section className="bg-white dark:bg-gray-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {locale === 'ar' ? 'المدن المتاحة' : 'Villes disponibles'}
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {stats.sampleCities.map((city: City) => (
                <Link
                  key={city.id}
                  href={`/search?city=${city.id}`}
                  className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {locale === 'ar' ? city.name_ar : city.name_fr}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {locale === 'ar' ? city.region_ar : city.region_fr}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      {/* TODO: Add features section aligned with the prd features  */}

      {/* Footer */}
      <Footer locale={locale} />
    </div>
  );
}
