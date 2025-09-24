'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertCircle,
  Award,
  Calendar,
  Clock,
  Globe,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Shield,
  Star,
  User
} from 'lucide-react';
import { useState } from 'react';

interface Huissier {
  id: string;
  full_name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  office_address?: string; // Added from database
  city_ar: string;
  city_fr: string;
  specialties: string[] | null;
  working_hours: string | null;
  distance: number; // in kilometers
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected'; // Fixed to match DB
  years_experience?: number | null; // Added from database
  languages?: string[] | null; // Added from database
  rating?: number | null; // Added from database
  rating_count?: number | null; // Added from database
  profile_image_url?: string | null; // Added from database
}

interface LocationState {
  loading: boolean;
  error: string | null;
  huissiers: Huissier[];
  userLocation: { lat: number; lng: number } | null;
}

interface EmergencyLocationProps {
  locale: string;
}

export function EmergencyLocationSearch({ locale }: EmergencyLocationProps) {
  const [state, setState] = useState<LocationState>({
    loading: false,
    error: null,
    huissiers: [],
    userLocation: null,
  });

  const isArabic = locale === 'ar';

  const texts = {
    button: {
      ar: 'العثور على محضر قريب (طوارئ)',
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
      ar: 'نحتاج للوصول لموقعك لإيجاد أقرب المحضرين لك. موقعك آمن ولا يتم حفظه.',
      fr: 'Nous avons besoin de votre localisation pour trouver les huissiers les plus proches. Votre position est sécurisée et non sauvegardée.',
      en: 'We need your location to find the nearest huissiers. Your location is secure and not stored.',
    },
    errorTitle: {
      ar: 'خطأ في الموقع',
      fr: 'Erreur de localisation',
      en: 'Location Error',
    },
    noResults: {
      ar: 'لم يتم العثور على محضرين في منطقتك',
      fr: 'Aucun huissier trouvé dans votre région',
      en: 'No huissiers found in your area',
    },
    nearestHuissiers: {
      ar: 'أقرب المحضرين لك',
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
      if (!navigator.geolocation) {
        reject(new Error(isArabic ? 'المتصفح لا يدعم تحديد الموقع' : 'La géolocalisation n\'est pas supportée par ce navigateur'));
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
              errorMessage = isArabic ? 'تم رفض إذن الوصول للموقع' : 'L\'autorisation de localisation a été refusée';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = isArabic ? 'الموقع غير متاح' : 'La position n\'est pas disponible';
              break;
            case error.TIMEOUT:
              errorMessage = isArabic ? 'انتهت مهلة تحديد الموقع' : 'Délai d\'attente de localisation dépassé';
              break;
            default:
              errorMessage = isArabic ? 'خطأ غير معروف في تحديد الموقع' : 'Erreur de localisation inconnue';
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
        error: nearbyHuissiers.length === 0 ? texts.noResults[locale as keyof typeof texts.noResults] : null,
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
      isArabic
        ? 'السلام عليكم، أحتاج لخدماتكم القانونية'
        : 'Bonjour, j\'ai besoin de vos services juridiques'
    );
    window.open(`https://wa.me/${formattedNumber.replace('+', '')}?text=${message}`, '_blank');
  };

  const handleEmail = (email: string) => {
    const subject = encodeURIComponent(
      isArabic
        ? 'طلب خدمة قانونية عاجلة'
        : 'Demande de service juridique urgent'
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
        return isArabic ? 'مغلق اليوم' : 'Fermé aujourd\'hui';
      }

      if (todaySchedule?.open && todaySchedule?.close) {
        return `${todaySchedule.open} - ${todaySchedule.close}`;
      }

      return isArabic ? 'ساعات متغيرة' : 'Horaires variables';
    } catch {
      return workingHoursStr;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            <Shield className="w-3 h-3 mr-1" />
            {texts.verified[locale as keyof typeof texts.verified]}
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            {texts.pending[locale as keyof typeof texts.pending]}
          </Badge>
        );
      case 'unverified':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200">
            <User className="w-3 h-3 mr-1" />
            {texts.unverified[locale as keyof typeof texts.unverified]}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            {texts.rejected[locale as keyof typeof texts.rejected]}
          </Badge>
        );
      default:
        return null;
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
              {texts.loading[locale as keyof typeof texts.loading]}
            </>
          ) : (
            <>
              <MapPin className="w-5 h-5 ml-2" />
              {texts.button[locale as keyof typeof texts.button]}
            </>
          )}
        </Button>

        {/* Permission Info Alert */}
        {!state.loading && state.huissiers.length === 0 && !state.error && (
          <Alert className="mt-4 max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <div>
              <h4 className="font-medium">{texts.permissionTitle[locale as keyof typeof texts.permissionTitle]}</h4>
              <AlertDescription className="mt-1">
                {texts.permissionDesc[locale as keyof typeof texts.permissionDesc]}
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
            <h4 className="font-medium">{texts.errorTitle[locale as keyof typeof texts.errorTitle]}</h4>
            <AlertDescription>{state.error}</AlertDescription>
          </div>
        </Alert>
      )}

      {/* Results */}
      {state.huissiers.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
            {texts.nearestHuissiers[locale as keyof typeof texts.nearestHuissiers]}
          </h3>

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {state.huissiers.map((huissier) => (
              <TooltipProvider key={huissier.id}>
                <Card className="w-full hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
                  <CardHeader className="pb-4">
                    {/* Header with Avatar and Basic Info */}
                    <div className="flex items-start space-x-4 rtl:space-x-reverse">
                      <Avatar className="w-16 h-16 border-2 border-blue-100">
                        <AvatarImage
                          src={huissier.profile_image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${huissier.full_name}`}
                          alt={huissier.full_name}
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                          {getInitials(huissier.full_name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg leading-tight">{huissier.full_name}</CardTitle>
                          {getVerificationBadge(huissier.verification_status)}
                        </div>

                        {/* Location and Distance */}
                        <div className="flex items-center space-x-2 rtl:space-x-reverse text-muted-foreground">
                          <Navigation className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium">
                            {isArabic ? huissier.city_ar : huissier.city_fr}
                          </span>
                          <Separator orientation="vertical" className="h-4" />
                          <div className="flex items-center space-x-1 rtl:space-x-reverse">
                            <MapPin className="w-3 h-3" />
                            <span className="text-xs">
                              {huissier.distance.toFixed(1)} {texts.distance[locale as keyof typeof texts.distance]}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Working Hours */}
                    {huissier.working_hours && (
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Clock className="w-4 h-4 text-green-600" />
                        <div className="flex-1">
                          <span className="text-xs font-medium text-muted-foreground">
                            {texts.workingHours[locale as keyof typeof texts.workingHours]}
                          </span>
                          <p className="text-sm">{parseWorkingHours(huissier.working_hours)}</p>
                        </div>
                      </div>
                    )}

                    {/* Specialties */}
                    {huissier.specialties && huissier.specialties.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Award className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-medium text-muted-foreground">
                            {texts.specialties[locale as keyof typeof texts.specialties]}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {huissier.specialties.slice(0, 4).map((specialty, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                              {specialty}
                            </Badge>
                          ))}
                          {huissier.specialties.length > 4 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-xs bg-gray-50 cursor-help">
                                  +{huissier.specialties.length - 4}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="max-w-xs">
                                  {huissier.specialties.slice(4).join(', ')}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Rating and Experience Row */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Rating */}
                      {huissier.rating && huissier.rating > 0 && (
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <div className="flex-1">
                            <span className="text-xs font-medium text-muted-foreground">
                              {texts.rating[locale as keyof typeof texts.rating]}
                            </span>
                            <div className="flex items-center space-x-1 rtl:space-x-reverse">
                              <span className="text-sm font-semibold">{huissier.rating.toFixed(1)}</span>
                              <span className="text-xs text-muted-foreground">
                                ({huissier.rating_count || 0})
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Experience */}
                      {huissier.years_experience && huissier.years_experience > 0 && (
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <div className="flex-1">
                            <span className="text-xs font-medium text-muted-foreground">
                              {texts.experience[locale as keyof typeof texts.experience]}
                            </span>
                            <p className="text-sm">
                              {huissier.years_experience} {texts.years[locale as keyof typeof texts.years]}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Languages */}
                    {huissier.languages && huissier.languages.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Globe className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-muted-foreground">
                            {texts.languages[locale as keyof typeof texts.languages]}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {huissier.languages.map((language, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              {language.toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Contact Actions */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-muted-foreground">
                          {texts.contact[locale as keyof typeof texts.contact]}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {huissier.phone && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => handleCall(huissier.phone!)}
                                variant="outline"
                                size="sm"
                                className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                              >
                                <Phone className="w-4 h-4 mr-1" />
                                {texts.call[locale as keyof typeof texts.call]}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{huissier.phone}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        {huissier.whatsapp && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => handleWhatsApp(huissier.whatsapp!)}
                                variant="outline"
                                size="sm"
                                className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                              >
                                <MessageCircle className="w-4 h-4 mr-1" />
                                {texts.whatsapp[locale as keyof typeof texts.whatsapp]}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{huissier.whatsapp}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        {huissier.email && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => handleEmail(huissier.email!)}
                                variant="outline"
                                size="sm"
                                className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                              >
                                <Mail className="w-4 h-4 mr-1" />
                                {texts.email[locale as keyof typeof texts.email]}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{huissier.email}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TooltipProvider>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
