'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, Award, Calendar, Clock, Globe, Mail, MapPin, MessageCircle, Navigation, Phone, Shield, Star, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
  city_en?: string;
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
  onCall?: (phone: string) => void;
  onWhatsApp?: (whatsapp: string) => void;
  onEmail?: (email: string) => void;
  parseWorkingHours?: (workingHoursStr: string | null) => string | null;
}


export function HuissierCard({ huissier, onCall, onWhatsApp, onEmail, parseWorkingHours }: HuissierCardProps) {
  // Translation hooks
const t= useTranslations("card");
const locale = useTranslations("language");

  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase() || '--';
  }, []);

  const getVerificationBadge = useCallback((status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            <Shield className="w-3 h-3 mr-1" />
            {t("verified")}
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            {t("pending")}
          </Badge>
        );
      case 'unverified':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200">
            <User className="w-3 h-3 mr-1" />
            {t("unverified")}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            {t("rejected")}
          </Badge>
        );
      default:
        return null;
    }
  }, [t]);



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
                  {locale("code") === 'ar' ? huissier.city_ar : locale("code") === 'fr' ? huissier.city_fr : huissier.city_en }
                </span>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                  <MapPin className="w-3 h-3" />
                  <span className="text-xs">
                    {typeof huissier.distance === 'number' ? huissier.distance.toFixed(1) : '--'} {t("distance")}
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
 <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className='mx-2 border border-green-600'>{t("workingHours")}</Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-full">

                  <Table className="w-max ">
  <TableCaption> <span className="text-xs font-medium text-muted-foreground">
                  {t("workingHours")}
                </span></TableCaption>
  <TableHeader>
    <TableRow>
      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
        <TableHead key={index}>{day}</TableHead>
      ))}


    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      {
      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day=> {
        const huissierWorkingHours = huissier.working_hours ? JSON.parse(huissier.working_hours) : null;
        const info = huissierWorkingHours?.[day.toLowerCase()];


      // Check if the info object is valid
        if (!info) {
          return <TableCell key={day}>--</TableCell>;
        }

        // Check if the huissier is closed on that day
        if (info.closed) {
          return <TableCell key={day}>{t("closed")}</TableCell>;
        }
        // Check if the hours vary
        return <TableCell key={day}>{
          info.open && info.close ? `${info.open} - ${info.close}` : '--'
         } </TableCell>;
      })


}




    </TableRow>
  </TableBody>
</Table>
</PopoverContent>
    </Popover>
              </div>
            </div>
          )}
          {huissier.specialties && huissier.specialties.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Award className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-muted-foreground">
                  {t("specialties")}
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
                    {t("rating")}
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
                    {t("experience")}
                  </span>
                  <p className="text-sm">
                    {huissier.years_experience} {t("years")}
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
                  {t("languages")}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {huissier.languages.map((language, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    {language.toUpperCase() || '--'}
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
                {t("contact")}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {huissier.phone && onCall && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => onCall(huissier.phone!)}
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      {t("call")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{huissier.phone}</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {huissier.whatsapp && onWhatsApp && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => onWhatsApp(huissier.whatsapp!)}
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {t("whatsapp")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{huissier.whatsapp}</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {huissier.email && onEmail && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => onEmail(huissier.email!)}
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      {t("email")}
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
