import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for nearby huissiers request
const nearbyHuissiersSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  limit: z.number().int().min(1).max(10).default(3),
  maxDistance: z.number().min(0).max(100).default(50), // km
});

type NearbyHuissiersRequest = z.infer<typeof nearbyHuissiersSchema>;

interface HuissierWithDistance {
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
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  years_experience?: number | null;
  languages?: string[] | null;
  rating?: number | null;
  rating_count?: number | null;
  profile_image_url?: string | null;
  distance: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const result = nearbyHuissiersSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: result.error.issues
        },
        { status: 400 }
      );
    }

    const { lat, lng, limit, maxDistance } = result.data;

    // Use service role client for public huissier search to bypass RLS issues
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Try calling the RPC function with service role - this should bypass RLS
    const { data: huissiers, error } = await supabase.rpc('get_nearby_huissiers', {
      user_lat: lat,
      user_lng: lng,
      max_distance_km: maxDistance,
      result_limit: limit
    });

    if (error) {
      console.error('Supabase error:', error);

      // Fallback to manual calculation if PostGIS function doesn't exist
      return await fallbackNearbySearch(lat, lng, limit, maxDistance);
    }

    // Transform the data to match our interface
    const transformedHuissiers: HuissierWithDistance[] = huissiers?.map((h: any) => ({
      id: h.id,
      full_name: h.full_name, // Changed from 'name' to 'full_name'
      phone: h.phone,
      whatsapp: h.whatsapp,
      email: h.email,
      city_ar: h.city_ar,
      city_fr: h.city_fr,
      specialties: h.specialties,
      working_hours: typeof h.working_hours === 'object' ? JSON.stringify(h.working_hours) : h.working_hours,
      verification_status: h.verification_status,
      distance: Math.round(h.distance * 100) / 100, // Round to 2 decimal places
    })) || [];

    return NextResponse.json(transformedHuissiers);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Fallback function using Haversine formula for distance calculation
async function fallbackNearbySearch(
  userLat: number,
  userLng: number,
  limit: number,
  maxDistance: number
) {
  try {
    // Create service role client for fallback as well
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Direct query approach - get huissiers with city coordinates
    const { data, error } = await supabase
      .from('huissiers')
      .select(`
        id,
        full_name,
        phone,
        whatsapp,
        email,
        office_address,
        city_ar,
        city_fr,
        specialties,
        working_hours,
        verification_status,
        years_experience,
        languages,
        rating,
        rating_count,
        profile_image_url
      `)
      .eq('verification_status', 'verified');

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return NextResponse.json([]);
    }

    // Use helper function to get city coordinates
    const { data: citiesWithCoords, error: citiesError } = await supabase
      .rpc('get_cities_coordinates');

    if (citiesError) {
      // Final fallback - return empty array
      console.error('Cannot extract coordinates for fallback:', citiesError);
      return NextResponse.json([]);
    }

    const huissiersWithDistance = data.map((huissier: any) => {
      // Find city coordinates
      const cityCoords = citiesWithCoords?.find((c: any) => c.id === huissier.cities.id);

      if (!cityCoords) {
        return null;
      }

      const distance = calculateHaversineDistance(
        userLat,
        userLng,
        cityCoords.lat,
        cityCoords.lng
      );

      return {
        id: huissier.id,
        full_name: huissier.full_name,
        phone: huissier.phone,
        whatsapp: huissier.whatsapp,
        email: huissier.email,
        city_ar: huissier.cities.name_ar,
        city_fr: huissier.cities.name_fr,
        specialties: huissier.specialties,
        working_hours: typeof huissier.working_hours === 'object' ? JSON.stringify(huissier.working_hours) : huissier.working_hours,
        verification_status: huissier.verification_status,
        distance: Math.round(distance * 100) / 100,
      };
    }).filter(Boolean) as HuissierWithDistance[];

    // Filter by maximum distance and sort by distance
    const nearbyHuissiers = huissiersWithDistance
      .filter((h: HuissierWithDistance) => h.distance <= maxDistance)
      .sort((a: HuissierWithDistance, b: HuissierWithDistance) => a.distance - b.distance)
      .slice(0, limit);

    return NextResponse.json(nearbyHuissiers);

  } catch (error) {
    console.error('Fallback search error:', error);
    throw error;
  }
}

// Haversine formula to calculate distance between two points on Earth
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
