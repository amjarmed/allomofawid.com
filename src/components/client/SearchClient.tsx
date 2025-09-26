'use client';

import { Huissier, HuissierCard } from '@/components/client/HuissierCard';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';



function parseWorkingHours(workingHoursStr: string | null) {
  if (!workingHoursStr) return null;
  // If working_hours is a JSON string, parse and format for display
  try {
    const obj = JSON.parse(workingHoursStr);
    // Simple formatting: show open/close for each day
    return Object.entries(obj)
      .map(([day, info]: [string, any]) => {
        if (info.closed) return `${day}: مغلق`;
        return `${day}: ${info.open} - ${info.close}`;
      })
      .join(' | ');
  } catch {
    return workingHoursStr;
  }
}




export function SearchClient() {
  const [results, setResults] = useState<Huissier[]>([]);
  console.log(" results", results[0]);
  console.log(JSON.stringify(results[0], null, 2));


  const t = useTranslations("searchPage");
  const local= useTranslations("language");

  // QuickSearchForm logic
  const [city, setCity] = useState('');
  const [service, setService] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cities, setCities] = useState<{ id: string; name_ar: string; name_fr: string , name_en: string }[]>([]);
  const [services, setServices] = useState<{ id: string; name_ar: string; name_fr: string, name_en: string }[]>([]);

  useEffect(() => {
    async function fetchOptions() {
      try {
        // Fetch cities and services with caching
        const citiesData = await fetch('/api/cities', {
          cache:"force-cache",
          next: { revalidate: 86400 }, // Revalidate once a day
        }).then(res => res.json());
        setCities(citiesData.cities || []);
        // Fetch services data with caching
        const servicesData = await fetch('/api/services', {
          cache:"force-cache",
          next: { revalidate: 86400 }, // Revalidate once a day
        }).then(res => res.json());
        setServices(servicesData.services || []);
      } catch (err) {
        console.log('Error fetching options:', err);
      }
    }
    fetchOptions();
  }, []);

  const handleSearch = async (params: { city: string; service: string; query: string }) => {
    const url = `/api/search?city=${encodeURIComponent(params.city)}&service=${encodeURIComponent(params.service)}&query=${encodeURIComponent(params.query)}`;
    const data = await fetch(url).then(res => res.json());
    const mappedResults = (data.huissiers || []).map((h: any) => ({
      ...h,
      city_ar: h.city?.name_ar ?? '',
      city_fr: h.city?.name_fr ?? '',
      city_en: h.city?.name_en ?? '',
      working_hours: h.working_hours ? JSON.stringify(h.working_hours) : null,
      distance: h.distance ?? null,
    }));
    setResults(mappedResults);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await handleSearch({ city, service, query });
    } catch (err: any) {
      setError(t("searchError"));
    } finally {
      setLoading(false);
    }
  };



  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 mb-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="city-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 rtl:text-right ltr:text-left">
              {t("filter.selectCity")}
            </label>
            <select
              id="city-select"
              name="city"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">{t("filter.selectCity")}</option>
              {cities.map(cityObj => (
                <option key={cityObj.id} value={cityObj.id}>
                  {local("code") === 'ar' ? cityObj.name_ar : local("code") === "fr"? cityObj.name_fr : cityObj.name_en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="service-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 rtl:text-right ltr:text-left">
              {t("filter.service")}
            </label>
            <select
              id="service-select"
              name="service"
              value={service}
              onChange={e => setService(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">{t("filter.allServices")}</option>
              {services.map(serviceObj => (
                <option key={serviceObj.id} value={serviceObj.id}>
                  {local("code") === 'ar' ? serviceObj.name_ar : local("code") === "fr"? serviceObj.name_fr : serviceObj.name_en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 rtl:text-right ltr:text-left">
              {t("filter.textSearch")}
            </label>
            <input
              id="query"
              name="query"
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder={t("filter.searchPlaceholder")}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center disabled:opacity-60"
            disabled={loading}
          >
            {loading
              ? (t("loading"))
              : (t("button"))}
          </button>

          {error && (
            <div className="text-center text-red-600 text-sm mt-2">{error}</div>
          )}
        </form>
      </div>
   {/* search result */}
     <section className="mb-8 border-t pt-6">
        {results && results.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map(huissier => (
        <HuissierCard
          key={huissier.id}
          huissier={huissier}
          // Server Component: do not pass client-only handlers
          parseWorkingHours={parseWorkingHours}
        />
      ))}
    </div>
        ) : (
      <div className="text-center text-muted-foreground py-8">
        {t('noResults')}
      </div>

    )}
  </section>
    </>
  );
}
