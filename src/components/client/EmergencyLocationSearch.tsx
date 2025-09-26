'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  Loader2,
  MapPin
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Huissier, HuissierCard } from './HuissierCard';


interface LocationState {
  loading: boolean;
  error: string | null;
  huissiers: Huissier[];
  userLocation: { lat: number; lng: number } | null;
}



export function EmergencyLocationSearch() {
  const [state, setState] = useState<LocationState>({
    loading: false,
    error: null,
    huissiers: [],
    userLocation: null,
  });

  const t= useTranslations("language");
  const cardT= useTranslations("card");
  const emerT= useTranslations("emergencyLocation");

  const texts = {
    button: {
      ar: 'العثور على مفوض قريب (طوارئ)',
      fr: 'Trouver un huissier proche (urgence)',
      en: 'Find Nearby Huissier (Emergency)',
    },
    loading: {
      ar: 'جاري تحديد موقعك...',
      fr: 'Localisation en cours...',
      en: 'Getting your location...',
    },
    permissionTitle: {
      ar: 'إذن الوصول للموقع',
      fr: 'Autorisation de localisation',
      en: 'Location Permission',
    },
    permissionDesc: {
      ar: 'نحتاج للوصول لموقعك لإيجاد أقرب المفوضين لك. موقعك آمن ولا يتم حفظه.',
      fr: 'Nous avons besoin de votre localisation pour trouver les huissiers les plus proches. Votre position est sécurisée et non sauvegardée.',
      en: 'We need your location to find the nearest huissiers. Your location is secure and not stored.',
    },
    errorTitle: {
      ar: 'خطأ في الموقع',
      fr: 'Erreur de localisation',
      en: 'Location Error',
    },
    noResults: {
      ar: 'لم يتم العثور على مفوضين في منطقتك',
      fr: 'Aucun huissier trouvé dans votre région',
      en: 'No huissiers found in your area',
    },
    nearestHuissiers: {
      ar: 'أقرب المفوضين لك',
      fr: 'Huissiers les plus proches',
      en: 'Nearest Huissiers',
    },
    verified: {
      ar: 'موثق',
      fr: 'Vérifié',
      en: 'Verified',
    },
    pending: {
      ar: 'قيد المراجعة',
      fr: 'En attente',
      en: 'Pending',
    },
    unverified: {
      ar: 'غير موثق',
      fr: 'Non vérifié',
      en: 'Unverified',
    },
    rejected: {
      ar: 'مرفوض',
      fr: 'Rejeté',
      en: 'Rejected',
    },
    distance: {
      ar: 'كم',
      fr: 'km',
      en: 'km',
    },
    call: {
      ar: 'اتصال',
      fr: 'Appeler',
      en: 'Call',
    },
    whatsapp: {
      ar: 'واتساب',
      fr: 'WhatsApp',
      en: 'WhatsApp',
    },
    email: {
      ar: 'بريد',
      fr: 'Email',
      en: 'Email',
    },
    specialties: {
      ar: 'التخصصات',
      fr: 'Spécialités',
      en: 'Specialties',
    },
    workingHours: {
      ar: 'ساعات العمل',
      fr: 'Heures d\'ouverture',
      en: 'Working Hours',
    },
    contact: {
      ar: 'التواصل',
      fr: 'Contact',
      en: 'Contact',
    },
    location: {
      ar: 'الموقع',
      fr: 'Localisation',
      en: 'Location',
    },
    experience: {
      ar: 'سنوات الخبرة',
      fr: 'Années d\'expérience',
      en: 'Years of Experience',
    },
    rating: {
      ar: 'التقييم',
      fr: 'Note',
      en: 'Rating',
    },
    languages: {
      ar: 'اللغات',
      fr: 'Langues',
      en: 'Languages',
    },
    years: {
      ar: 'سنة',
      fr: 'ans',
      en: 'years',
    },
  };

  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      const t= useTranslations("emergencyLocation");

      if (!navigator.geolocation) {
        reject(new Error(t('geolocationNotSupported')));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          let errorMessage = '';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = t('permissionDenied');
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = t('positionUnavailable');
              break;
            case error.TIMEOUT:
              errorMessage = t('timeout');
              break;
            default:
              errorMessage = t('unknownError');
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  };

  const searchNearbyHuissiers = async (lat: number, lng: number): Promise<Huissier[]> => {
    const response = await fetch('/api/huissiers/nearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lat, lng, limit: 3 }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch nearby huissiers');
    }

    return response.json();
  };

  const handleEmergencySearch = async () => {
    setState(prev => ({ ...prev, loading: true, error: null, huissiers: [] }));

    try {
      // Step 1: Get user location
      const location = await getCurrentLocation();
      setState(prev => ({ ...prev, userLocation: location }));

      // Step 2: Search for nearby huissiers
      const nearbyHuissiers = await searchNearbyHuissiers(location.lat, location.lng);

      setState(prev => ({
        ...prev,
        loading: false,
        huissiers: nearbyHuissiers,
        error: nearbyHuissiers.length === 0 ? t('noResults') : null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Une erreur inattendue s\'est produite',
      }));
    }
  };

  const formatPhone = (phone: string) => {
    // Remove any non-digit characters and ensure it starts with +212 for Morocco
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('212')) {
      return `+${cleaned}`;
    }
    if (cleaned.startsWith('0')) {
      return `+212${cleaned.substring(1)}`;
    }
    return `+212${cleaned}`;
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${formatPhone(phone)}`, '_self');
  };

  const handleWhatsApp = (whatsapp: string) => {
    const formattedNumber = formatPhone(whatsapp);
    const message = encodeURIComponent(
      cardT('whatsappMessage')
    );
    window.open(`https://wa.me/${formattedNumber.replace('+', '')}?text=${message}`, '_blank');
  };

  const handleEmail = (email: string) => {
    const subject = encodeURIComponent(
      cardT('emailSubject')
    );
    window.open(`mailto:${email}?subject=${subject}`, '_self');
  };

  const parseWorkingHours = (workingHoursStr: string | null) => {
    if (!workingHoursStr) return null;

    try {
      const hours = JSON.parse(workingHoursStr);
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const todaySchedule = hours[today];

      if (todaySchedule?.closed) {
        return cardT('closedToday');
      }

      if (todaySchedule?.open && todaySchedule?.close) {
        return `${todaySchedule.open} - ${todaySchedule.close}`;
      }

      return cardT('hoursVaries');
    } catch {
      return workingHoursStr;
    }
  };


  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Emergency Button */}
      <div className="text-center">
        <Button
          onClick={handleEmergencySearch}
          disabled={state.loading}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg min-w-[300px]"
          size="lg"
        >
          {state.loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin ml-2" />
              {emerT("loading")}
            </>
          ) : (
            <>
              <MapPin className="w-5 h-5 ml-2" />
              {emerT("button")}
            </>
          )}
        </Button>

        {/* Permission Info Alert */}
        {!state.loading && state.huissiers.length === 0 && !state.error && (
          <Alert className="mt-4 max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <div>
              <h4 className="font-medium">{emerT("permissionTitle")}</h4>
              <AlertDescription className="mt-1">
                {emerT("permissionDesc")}
              </AlertDescription>
            </div>
          </Alert>
        )}
      </div>

      {/* Error Alert */}
      {state.error && (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <div>
            <h4 className="font-medium">{emerT("errorTitle")}</h4>
            <AlertDescription>{state.error}</AlertDescription>
          </div>
        </Alert>
      )}

      {/* Results */}
      {state.huissiers.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
            {emerT("nearestHuissiers")}
          </h3>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {state.huissiers.map((huissier) => (
              <HuissierCard
                key={huissier.id}
                huissier={huissier}
                onCall={handleCall}
                onWhatsApp={handleWhatsApp}
                onEmail={handleEmail}
                parseWorkingHours={parseWorkingHours}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
