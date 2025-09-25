import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cities')
    .select('id, name_ar, name_fr')
    .order('name_fr', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
  }

  return NextResponse.json({ cities: data });
}
