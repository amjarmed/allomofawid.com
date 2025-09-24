-- Supabase function to find nearby huissiers using PostGIS
-- This function should be run in your Supabase SQL editor
-- It requires PostGIS extension to be enabled

-- Enable PostGIS extension if not already enabled
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Function to get nearby huissiers
CREATE OR REPLACE FUNCTION get_nearby_huissiers(
    user_lat FLOAT,
    user_lng FLOAT,
    max_distance_km FLOAT DEFAULT 50,
    result_limit INTEGER DEFAULT 3
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    city_ar TEXT,
    city_fr TEXT,
    specialties TEXT[],
    working_hours TEXT,
    verification_status TEXT,
    distance FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        h.id,
        h.name,
        h.phone,
        h.whatsapp,
        h.email,
        c.name_ar as city_ar,
        c.name_fr as city_fr,
        h.specialties,
        h.working_hours,
        h.verification_status,
        ST_Distance(
            ST_MakePoint(user_lng, user_lat)::geography,
            ST_MakePoint(c.longitude, c.latitude)::geography
        ) / 1000.0 as distance -- Convert meters to kilometers
    FROM huissiers h
    INNER JOIN cities c ON h.city_id = c.id
    WHERE
        h.verification_status = 'verified'
        AND c.latitude IS NOT NULL
        AND c.longitude IS NOT NULL
        AND ST_DWithin(
            ST_MakePoint(user_lng, user_lat)::geography,
            ST_MakePoint(c.longitude, c.latitude)::geography,
            max_distance_km * 1000 -- Convert km to meters
        )
    ORDER BY distance
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT * FROM get_nearby_huissiers(33.5731, -7.5898, 50, 3);
-- This would find huissiers near Casablanca within 50km radius
