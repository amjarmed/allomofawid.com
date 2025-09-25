'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, Award, Calendar, Clock, Globe, Mail, MapPin, MessageCircle, Navigation, Phone, Shield, Star, User } from 'lucide-react';
import { useCallback } from 'react';

export interface Huissier {
  id: string;
  full_name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  office_address?: string;
  city_ar: string;
  city_fr: string;
  specialties: string[] | null;
  working_hours: string | null;
  distance: number;
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  years_experience?: number | null;
  languages?: string[] | null;
  rating?: number | null;
  rating_count?: number | null;
  profile_image_url?: string | null;
}

export interface HuissierCardProps {
  huissier: Huissier;
  locale: string;
  texts: any;
  onCall: (phone: string) => void;
  onWhatsApp: (whatsapp: string) => void;
  onEmail: (email: string) => void;
  parseWorkingHours: (workingHoursStr: string | null) => string | null;
}

export function HuissierCard({ huissier, locale, texts, onCall, onWhatsApp, onEmail, parseWorkingHours }: HuissierCardProps) {
  const isArabic = locale === 'ar';

  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }, []);

  const getVerificationBadge = useCallback((status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            <Shield className="w-3 h-3 mr-1" />
            {texts.verified[locale]}
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            {texts.pending[locale]}
          </Badge>
        );
      case 'unverified':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200">
            <User className="w-3 h-3 mr-1" />
            {texts.unverified[locale]}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            {texts.rejected[locale]}
          </Badge>
        );
      default:
        return null;
    }
  }, [locale, texts]);

  return (
    <TooltipProvider>
      <Card className="w-full hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
        <CardHeader className="pb-4">
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
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-muted-foreground">
                <Navigation className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">
                  {isArabic ? huissier.city_ar : huissier.city_fr}
                </span>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                  <MapPin className="w-3 h-3" />
                  <span className="text-xs">
                    {typeof huissier.distance === 'number' ? huissier.distance.toFixed(1) : '--'} {texts.distance[locale]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {huissier.working_hours && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Clock className="w-4 h-4 text-green-600" />
              <div className="flex-1">
                <span className="text-xs font-medium text-muted-foreground">
                  {texts.workingHours[locale]}
                </span>
                <p className="text-sm">{parseWorkingHours(huissier.working_hours)}</p>
              </div>
            </div>
          )}
          {huissier.specialties && huissier.specialties.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Award className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-muted-foreground">
                  {texts.specialties[locale]}
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
          <div className="grid grid-cols-2 gap-4">
            {huissier.rating && huissier.rating > 0 && (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <div className="flex-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {texts.rating[locale]}
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
            {huissier.years_experience && huissier.years_experience > 0 && (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Calendar className="w-4 h-4 text-blue-600" />
                <div className="flex-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {texts.experience[locale]}
                  </span>
                  <p className="text-sm">
                    {huissier.years_experience} {texts.years[locale]}
                  </p>
                </div>
              </div>
            )}
          </div>
          {huissier.languages && huissier.languages.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Globe className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-muted-foreground">
                  {texts.languages[locale]}
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
          <div className="space-y-3">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <MessageCircle className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-muted-foreground">
                {texts.contact[locale]}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {huissier.phone && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => onCall(huissier.phone!)}
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      {texts.call[locale]}
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
                      onClick={() => onWhatsApp(huissier.whatsapp!)}
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {texts.whatsapp[locale]}
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
                      onClick={() => onEmail(huissier.email!)}
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      {texts.email[locale]}
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
  );
}
