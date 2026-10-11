-- Amazon Aurora Serverless v2 PostgreSQL + PostGIS Schema for TERRA Digital Twin
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Environmental Telemetry Stations Table
CREATE TABLE IF NOT EXISTS environmental_stations (
    station_id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country_code VARCHAR(8) NOT NULL,
    geom GEOMETRY(Point, 4326) NOT NULL,
    elevation_meters NUMERIC(7, 2),
    cams_station_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stations_geom ON environmental_stations USING GIST(geom);

-- 2. Sensor Telemetry Timeseries Table
CREATE TABLE IF NOT EXISTS sensor_telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id VARCHAR(64) REFERENCES environmental_stations(station_id),
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    pm25 NUMERIC(6, 2),
    pm10 NUMERIC(6, 2),
    no2 NUMERIC(6, 2),
    so2 NUMERIC(6, 2),
    o3 NUMERIC(6, 2),
    aqi INT,
    temperature_c NUMERIC(5, 2),
    humidity_pct NUMERIC(5, 2),
    wind_speed_ms NUMERIC(5, 2)
);

CREATE INDEX IF NOT EXISTS idx_telemetry_station_time ON sensor_telemetry(station_id, recorded_at DESC);

-- 3. Citizen Pollution Reports Table with Geometry
CREATE TABLE IF NOT EXISTS citizen_pollution_reports (
    report_id VARCHAR(64) PRIMARY KEY,
    city_name VARCHAR(128) NOT NULL,
    geom GEOMETRY(Point, 4326) NOT NULL,
    pollution_type VARCHAR(64) NOT NULL,
    severity VARCHAR(32) NOT NULL,
    image_url TEXT,
    description TEXT,
    author_cognito_sub VARCHAR(128),
    author_name VARCHAR(128),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_citizen_reports_geom ON citizen_pollution_reports USING GIST(geom);

-- 4. Spatial Buffer Function: Find Active Pollution Hotspots within Radius (KM)
CREATE OR REPLACE FUNCTION get_hotspots_near_coords(
    target_lng DOUBLE PRECISION,
    target_lat DOUBLE PRECISION,
    radius_km DOUBLE PRECISION
)
RETURNS TABLE (
    report_id VARCHAR,
    city_name VARCHAR,
    distance_km DOUBLE PRECISION,
    pollution_type VARCHAR,
    severity VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.report_id,
        r.city_name,
        ROUND((ST_Distance(r.geom::geography, ST_SetSRID(ST_MakePoint(target_lng, target_lat), 4326)::geography) / 1000)::numeric, 2)::double precision AS distance_km,
        r.pollution_type,
        r.severity
    FROM citizen_pollution_reports r
    WHERE ST_DWithin(r.geom::geography, ST_SetSRID(ST_MakePoint(target_lng, target_lat), 4326)::geography, radius_km * 1000)
    ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;
