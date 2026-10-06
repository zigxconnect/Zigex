-- Add geolocation columns to internships table for attendance boundary verification
ALTER TABLE public.internships ADD COLUMN IF NOT EXISTS require_geolocation boolean DEFAULT false;
ALTER TABLE public.internships ADD COLUMN IF NOT EXISTS geo_latitude double precision;
ALTER TABLE public.internships ADD COLUMN IF NOT EXISTS geo_longitude double precision;
ALTER TABLE public.internships ADD COLUMN IF NOT EXISTS geo_radius_meters integer DEFAULT 100;

-- Add geolocation columns to programs table for attendance boundary verification
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS require_geolocation boolean DEFAULT false;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS geo_latitude double precision;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS geo_longitude double precision;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS geo_radius_meters integer DEFAULT 100;

COMMENT ON COLUMN public.internships.require_geolocation IS 'When true, students must be within geo_radius_meters of (geo_latitude, geo_longitude) to log attendance';
COMMENT ON COLUMN public.internships.geo_latitude IS 'Latitude of the company office for attendance geofencing';
COMMENT ON COLUMN public.internships.geo_longitude IS 'Longitude of the company office for attendance geofencing';
COMMENT ON COLUMN public.internships.geo_radius_meters IS 'Allowed check-in radius in meters (default 100m)';
