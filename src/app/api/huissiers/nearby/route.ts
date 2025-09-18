import { handleError } from '@/lib/api/error';
import { createClient } from '@/lib/supabase/server';
import { nearbyHuissiersSchema } from '@/lib/validations/search';
import { NextResponse } from 'next/server';
import { type Database } from '@/lib/types/supabase';

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const params = {
      lat: Number(searchParams.get('lat')),
      lng: Number(searchParams.get('lng')),
      radius: Number(searchParams.get('radius')) || 5000
    };

    // Validate parameters
    const validatedParams = nearbyHuissiersSchema.parse(params);

    const supabase = createClient();

    // Query using the stored procedure
    const { data: huissiers, error } = await supabase
      .rpc('nearby_huissiers', {
        lat: validatedParams.lat,
        lng: validatedParams.lng,
        radius_meters: validatedParams.radius
      }) as unknown as {
        data: Database['public']['Functions']['nearby_huissiers']['Returns'][];
        error: any;
      };
      .rpc('nearby_huissiers', {
        lat: validatedParams.lat,
        lng: validatedParams.lng,
        radius_meters: validatedParams.radius
      });
      .rpc('nearby_huissiers', {
        lat: validatedParams.lat,
        lng: validatedParams.lng,
        radius_meters: validatedParams.radius
      })

    if (error) throw error

    return NextResponse.json({
      huissiers: data
    })
  } catch (error) {
    return handleError(error)
  }
}
