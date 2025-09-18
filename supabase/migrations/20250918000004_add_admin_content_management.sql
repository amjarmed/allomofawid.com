-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create regions table
CREATE TABLE regions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar text NOT NULL,
    name_fr text NOT NULL,
    name_en text NOT NULL,
    code varchar(10) UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create cities table with PostGIS support
CREATE TABLE cities (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id uuid REFERENCES regions(id) ON DELETE CASCADE,
    name_ar text NOT NULL,
    name_fr text NOT NULL,
    name_en text NOT NULL,
    code varchar(10) UNIQUE NOT NULL,
    location geometry(Point, 4326), -- PostGIS point for city center
    bounds geometry(Polygon, 4326), -- PostGIS polygon for city boundaries
    population integer,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create specialties table with multilingual support
CREATE TABLE specialties (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar text NOT NULL,
    name_fr text NOT NULL,
    name_en text NOT NULL,
    description_ar text,
    description_fr text,
    description_en text,
    slug text UNIQUE NOT NULL,
    icon text, -- Icon identifier
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create junction table for huissier specialties
CREATE TABLE huissier_specialties (
    huissier_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    specialty_id uuid REFERENCES specialties(id) ON DELETE CASCADE,
    verified boolean DEFAULT false,
    verification_document_url text,
    verified_at timestamptz,
    verified_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (huissier_id, specialty_id)
);

-- Create activity_logs table for admin actions
CREATE TABLE activity_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid,
    metadata jsonb DEFAULT '{}',
    ip_address inet,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX idx_cities_location ON cities USING gist(location);
CREATE INDEX idx_cities_bounds ON cities USING gist(bounds);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_activity_logs_actor ON activity_logs(actor_id);
CREATE INDEX idx_specialties_slug ON specialties(slug);

-- Add RLS policies

-- Regions policies
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for regions" ON regions
    FOR SELECT USING (true);

CREATE POLICY "Admin write access for regions" ON regions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Cities policies
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for cities" ON cities
    FOR SELECT USING (true);

CREATE POLICY "Admin write access for cities" ON cities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Specialties policies
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for specialties" ON specialties
    FOR SELECT USING (true);

CREATE POLICY "Admin write access for specialties" ON specialties
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Huissier specialties policies
ALTER TABLE huissier_specialties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for huissier_specialties" ON huissier_specialties
    FOR SELECT USING (true);

CREATE POLICY "Huissier can manage own specialties" ON huissier_specialties
    FOR INSERT WITH CHECK (
        auth.uid() = huissier_id
    );

CREATE POLICY "Admin write access for huissier_specialties" ON huissier_specialties
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Activity logs policies
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read access for activity_logs" ON activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "System write access for activity_logs" ON activity_logs
    FOR INSERT WITH CHECK (true);

-- Create updated_at triggers
CREATE TRIGGER update_regions_updated_at
    BEFORE UPDATE ON regions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cities_updated_at
    BEFORE UPDATE ON cities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_specialties_updated_at
    BEFORE UPDATE ON specialties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to find nearest cities
CREATE OR REPLACE FUNCTION find_nearest_cities(
    lat double precision,
    lon double precision,
    radius_km double precision DEFAULT 50,
    limit_count integer DEFAULT 10
)
RETURNS TABLE (
    id uuid,
    name_ar text,
    name_fr text,
    name_en text,
    distance_meters double precision
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name_ar,
        c.name_fr,
        c.name_en,
        ST_Distance(
            c.location::geography,
            ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
        ) as distance_meters
    FROM cities c
    WHERE ST_DWithin(
        c.location::geography,
        ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography,
        radius_km * 1000
    )
    AND c.active = true
    ORDER BY distance_meters
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;
