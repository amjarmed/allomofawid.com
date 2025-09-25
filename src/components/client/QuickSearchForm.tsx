
"use client";
import { useEffect, useState } from 'react';

export function QuickSearchForm({ locale, onSearch }: { locale: string; onSearch: (params: { city: string; service: string; query: string }) => void }) {
  const [city, setCity] = useState('');
  const [service, setService] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cities, setCities] = useState<{ id: string; name_ar: string; name_fr: string }[]>([]);
  const [services, setServices] = useState<{ id: string; name_ar: string; name_fr: string }[]>([]);

  useEffect(() => {
    async function fetchOptions() {
      try {
        const citiesRes = await fetch('/api/cities');
        const citiesData = await citiesRes.json();
        setCities(citiesData.cities || []);
        const servicesRes = await fetch('/api/services');
        const servicesData = await servicesRes.json();
        setServices(servicesData.services || []);
      } catch (err) {
        // Optionally handle error
      }
    }
    fetchOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSearch({ city, service, query });
      console.log('Search submitted:', { city, service, query });

    } catch (err: any) {
      setError(locale === 'ar' ? 'حدث خطأ أثناء البحث' : 'Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 mb-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="city-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 rtl:text-right ltr:text-left">
            {locale === 'ar' ? 'اختر المدينة' : 'Choisissez votre ville'}
          </label>
          <select
            id="city-select"
            name="city"
            value={city}
            onChange={e => setCity(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">{locale === 'ar' ? 'اختر المدينة...' : 'Sélectionnez une ville...'}</option>
            {cities.map(cityObj => (
              <option key={cityObj.id} value={cityObj.id}>
                {locale === 'ar' ? cityObj.name_ar : cityObj.name_fr}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="service-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 rtl:text-right ltr:text-left">
            {locale === 'ar' ? 'نوع الخدمة' : 'Type de service'}
          </label>
          <select
            id="service-select"
            name="service"
            value={service}
            onChange={e => setService(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">{locale === 'ar' ? 'جميع الخدمات' : 'Tous les services'}</option>
            {services.map(serviceObj => (
              <option key={serviceObj.id} value={serviceObj.id}>
                {locale === 'ar' ? serviceObj.name_ar : serviceObj.name_fr}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 rtl:text-right ltr:text-left">
            {locale === 'ar' ? 'بحث نصي (اسم، عنوان...)' : 'Recherche textuelle (nom, adresse...)'}
          </label>
          <input
            id="query"
            name="query"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder={locale === 'ar' ? 'مثال: محمد، شارع الجيش الملكي' : 'Ex: Mohamed, Avenue des FAR'}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center disabled:opacity-60"
          disabled={loading}
        >
          {loading
            ? (locale === 'ar' ? 'جاري البحث...' : 'Recherche en cours...')
            : (locale === 'ar' ? 'بحث عن مفوض' : 'Rechercher un huissier')}
        </button>

        {error && (
          <div className="text-center text-red-600 text-sm mt-2">{error}</div>
        )}
      </form>
    </div>
  );
}
