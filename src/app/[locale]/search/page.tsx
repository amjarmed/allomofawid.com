import { SearchClient } from '@/components/client/SearchClient';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

export default async function SearchPage() {
  const t= await getTranslations("searchPage");

  return (
    <>
      <main className="container mx-auto py-6 px-2 md:px-6">
        <h1 className="text-2xl font-bold mb-4 rtl:text-right ltr:text-left">
          {t('title')}
        </h1>
        <Suspense fallback={<div>
          <div className="animate-pulse space-y-4"></div>
            <div className="h-10 mb-2 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
          </div>
        }>
          <SearchClient  />
        </Suspense>
      </main>
    </>
  );
}

                <SearchClient />
