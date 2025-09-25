import { SearchClient } from '@/components/client/SearchClient';
import { Footer } from '@/components/server/Footer';
import { Header } from '@/components/server/Header';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

export default async function SearchPage() {
  const t = await getTranslations('search');
  const tHeader = await getTranslations('header');
  const tFooter = await getTranslations('footer');
  const tNav = await getTranslations('nav');
  const locale = 'ar'; // TODO: get from params or context

  return (
    <>
      <Header locale={locale} />
      <main className="container mx-auto py-6 px-2 md:px-6">
        <h1 className="text-2xl font-bold mb-4 rtl:text-right ltr:text-left">
          {t('title')}
        </h1>
        <Suspense fallback={<div>{t('loading')}</div>}>
          <SearchClient locale={locale} />
        </Suspense>
      </main>
      <Footer locale={locale} />
    </>
  );
}

                <SearchClient />
