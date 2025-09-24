'use client';

import { Locale, routing } from '@/i18n/routing';
import { Check, Globe } from 'lucide-react';
import Image from 'next/image';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const localeNames: Record<Locale, { name: string; flag: string }> = {
  ar: { name: 'العربية', flag: '🇲🇦' },
  fr: { name: 'Français', flag: '🇫🇷' },
  en: { name: 'English', flag: '🇺🇸' }
};

export function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params.locale as Locale;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;

    setIsOpen(false); // Close dropdown after selection

    // For root path, just navigate to the new locale
    if (pathname === `/${currentLocale}`) {
      router.push(`/${newLocale}`);
      return;
    }

    // For nested paths, replace the locale segment
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0 && pathSegments[0] === currentLocale) {
      pathSegments[0] = newLocale;
      const newPath = '/' + pathSegments.join('/');
      router.push(newPath);
    } else {
      // Fallback: just navigate to the root of the new locale
      router.push(`/${newLocale}`);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Globe Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
        aria-label="Select language"
      >
        {/* Globe  Icon */}
        <Globe/>

      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
          <div className="py-1">
            {routing.locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocaleChange(loc)}
                disabled={currentLocale === loc}
                className={`w-full flex items-center px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed ${
                  currentLocale === loc
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                  <Image src={`/flags/${loc}.svg`} alt={localeNames[loc].name} width={20} height={15} className="mr-3 rounded-sm object-cover"/>
                <span className="flex-1 text-left">{localeNames[loc].name}</span>
                {currentLocale === loc && (
                  <Check className='text-blue-600 dark:text-blue-400'/>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
