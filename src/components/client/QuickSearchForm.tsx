import Link from "next/link";

// Client Component Example: Quick Search Form
export function QuickSearchForm({ locale }: { locale: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
      <form className="space-y-4">
        <div>
          <label htmlFor="city-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {locale === 'ar' ? 'اختر المدينة' : 'Choisissez votre ville'}
          </label>
          <select
            id="city-select"
            name="city"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">{locale === 'ar' ? 'اختر المدينة...' : 'Sélectionnez une ville...'}</option>
          </select>
        </div>

        <div>
          <label htmlFor="service-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {locale === 'ar' ? 'نوع الخدمة' : 'Type de service'}
          </label>
          <select
            id="service-select"
            name="service"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">{locale === 'ar' ? 'جميع الخدمات' : 'Tous les services'}</option>
            <option value="debt_collection">{locale === 'ar' ? 'تحصيل الديون' : 'Recouvrement de créances'}</option>
            <option value="real_estate">{locale === 'ar' ? 'العقارات' : 'Immobilier'}</option>
            <option value="commercial">{locale === 'ar' ? 'تجاري' : 'Commercial'}</option>
          </select>
        </div>

        <Link
          href="/search"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block text-center"
        >
          {locale === 'ar' ? 'بحث عن محضر' : 'Rechercher un huissier'}
        </Link>

        <div className="text-center">
          <Link
            href="/emergency"
            className="text-red-600 hover:text-red-700 font-medium"
          >
            {locale === 'ar' ? '🚨 طلب عاجل؟ اضغط هنا' : '🚨 Urgence? Cliquez ici'}
          </Link>
        </div>
      </form>
    </div>
  );
}
