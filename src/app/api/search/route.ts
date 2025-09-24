import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for search parameters
const searchSchema = z.object({
  city: z.string().optional(),
  service: z.string().optional(),
  query: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      city: searchParams.get('city'),
      service: searchParams.get('service'),
      query: searchParams.get('query')
    };

    // Validate input
    const result = searchSchema.safeParse(params);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters' },
        { status: 400 }
      );
    }

    const { city, service, query } = result.data;

    // API Route Example: Search huissiers
    const supabase = await createClient();

    let queryBuilder = supabase
      .from('huissiers')
      .select(`
        id,
        name,
        email,
        phone,
        specializations,
        office_address,
        verification_status,
        rating,
        total_reviews,
        city:cities(id, name_ar, name_fr, region_ar, region_fr)
      `)
      .eq('verification_status', 'verified');

    // Apply filters
    if (city) {
      queryBuilder = queryBuilder.eq('city_id', city);
    }

    if (service) {
      queryBuilder = queryBuilder.contains('specializations', [service]);
    }

    if (query) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,office_address.ilike.%${query}%`);
    }

    // Execute query
    const { data: huissiers, error } = await queryBuilder
      .order('rating', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to search huissiers' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      huissiers: huissiers || [],
      total: huissiers?.length || 0,
      filters: { city, service, query }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Example POST for creating a search request log
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const logSchema = z.object({
      search_query: z.string().min(1).max(200),
      filters: z.object({
        city: z.string().optional(),
        service: z.string().optional()
      }),
      results_count: z.number().int().min(0),
      user_agent: z.string().optional()
    });

    const result = logSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.issues },
        { status: 400 }
      );
    }

    // Log the search for analytics (optional feature)
    const supabase = await createClient();

    const { error } = await supabase
      .from('search_logs')
      .insert({
        search_query: result.data.search_query,
        filters: result.data.filters,
        results_count: result.data.results_count,
        user_agent: result.data.user_agent || request.headers.get('user-agent'),
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        created_at: new Date().toISOString()
      });

    if (error) {
      // Log error but don't fail the request
      console.error('Failed to log search:', error);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
