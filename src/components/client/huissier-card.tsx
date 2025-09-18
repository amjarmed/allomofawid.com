'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mail, MessageSquare, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface HuissierProps {
  huissier: {
    id: string;
    name: string;
    email: string | null;
    phone: string;
    whatsapp: string | null;
    office_address: string;
    city: string;
    distance: number;
    is_verified: boolean;
    rating: number | null;
  };
}

export function HuissierCard({ huissier }: HuissierProps) {
  const t = useTranslations('huissier');

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return t('distance.meters', { meters: Math.round(meters) });
    }
    return t('distance.kilometers', { kilometers: (meters / 1000).toFixed(1) });
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium">{huissier.name}</h3>
            <p className="text-sm text-muted-foreground">
              {huissier.city} • {formatDistance(huissier.distance)}
            </p>
          </div>
          {huissier.is_verified && (
            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
              {t('verified')}
            </span>
          )}
        </div>

        <p className="text-sm">{huissier.office_address}</p>

        <div className="flex flex-col gap-2">
          <Button
            variant="default"
            size="sm"
            className="w-full"
            onClick={() => window.open(`tel:${huissier.phone}`)}
          >
            <Phone className="mr-2 h-4 w-4" />
            {t('actions.call')}
          </Button>

          {huissier.whatsapp && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() =>
                window.open(
                  `https://wa.me/${huissier.whatsapp.replace(/\D/g, '')}`
                )
              }
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              {t('actions.whatsapp')}
            </Button>
          )}

          {huissier.email && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open(`mailto:${huissier.email}`)}
            >
              <Mail className="mr-2 h-4 w-4" />
              {t('actions.email')}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
