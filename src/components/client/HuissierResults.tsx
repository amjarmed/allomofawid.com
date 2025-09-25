'use client';

import { Huissier, HuissierCard } from './HuissierCard';

const texts = {
  verified: { ar: 'موثق', fr: 'Vérifié' },
  pending: { ar: 'قيد المراجعة', fr: 'En attente' },
  unverified: { ar: 'غير موثق', fr: 'Non vérifié' },
  rejected: { ar: 'مرفوض', fr: 'Rejeté' },
  distance: { ar: 'كم', fr: 'km' },
  workingHours: { ar: 'ساعات العمل', fr: 'Horaires' },
  specialties: { ar: 'تخصصات', fr: 'Spécialités' },
  rating: { ar: 'تقييم', fr: 'Note' },
  experience: { ar: 'الخبرة', fr: 'Expérience' },
  years: { ar: 'سنة', fr: 'ans' },
  languages: { ar: 'اللغات', fr: 'Langues' },
  contact: { ar: 'اتصال', fr: 'Contact' },
  call: { ar: 'اتصال', fr: 'Appeler' },
  whatsapp: { ar: 'واتساب', fr: 'WhatsApp' },
  email: { ar: 'بريد إلكتروني', fr: 'Email' },
};

function parseWorkingHours(workingHoursStr: string | null) {
  if (!workingHoursStr) return null;
  // TODO: Parse JSON or string format for working hours
  return workingHoursStr;
}

export function HuissierResults({ locale, results }: { locale: string; results: Huissier[] }) {
  if (!results || results.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        {locale === 'ar' ? 'لا توجد نتائج مطابقة' : 'Aucun résultat trouvé'}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map(huissier => (
        <HuissierCard
          key={huissier.id}
          huissier={huissier}
          locale={locale}
          texts={texts}
          onCall={phone => window.open(`tel:${phone}`)}
          onWhatsApp={whatsapp => window.open(`https://wa.me/${whatsapp}`)}
          onEmail={email => window.open(`mailto:${email}`)}
          parseWorkingHours={parseWorkingHours}
        />
      ))}
    </div>
  );
}
