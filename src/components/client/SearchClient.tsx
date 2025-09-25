'use client';

import { useState } from 'react';
import { HuissierResults } from './HuissierResults';
import { QuickSearchForm } from './QuickSearchForm';

export function SearchClient({ locale = 'ar' }: { locale?: string }) {
  const [results, setResults] = useState([]);

  const handleSearch = async (params: { city: string; service: string; query: string }) => {
    const url = `/api/search?city=${encodeURIComponent(params.city)}&service=${encodeURIComponent(params.service)}&query=${encodeURIComponent(params.query)}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log('Search results:', data);
    setResults(data.huissiers || []);
  };

  return (
    <>
      <QuickSearchForm locale={locale} onSearch={handleSearch} />
      <HuissierResults locale={locale} results={results} />
    </>
  );
}
