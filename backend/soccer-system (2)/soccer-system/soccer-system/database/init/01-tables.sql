-- Borrar el esquema si existe
DROP SCHEMA IF EXISTS fut_jaguar CASCADE;

-- Crear el esquema
CREATE SCHEMA fut_jaguar;

-- Usar el esquema
SET search_path TO fut_jaguar;

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Tabla de categorías
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	logo_url VARCHAR(255),
    category_name VARCHAR(100) NOT NULL,
    min_age INTEGER NOT NULL,
    max_age INTEGER NOT NULL
);

-- Tabla de usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    email VARCHAR(100),
    birth_date DATE,
    photo_url VARCHAR(255),
    user_role VARCHAR(20) NOT NULL,
    user_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
);

-- Tabla de torneos
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_name VARCHAR(100) NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    start_date DATE,
    end_date DATE,
    current_phase VARCHAR(20) DEFAULT 'ROUND_ROBIN',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
);

-- Tabla de divisiones (con los campos añadidos: current_phase, next_phase y category_id)
CREATE TABLE divisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    division_name VARCHAR(20) NOT NULL CHECK (division_name IN ('PRIMERA', 'SEGUNDA')),
    current_phase VARCHAR(20) DEFAULT 'ROUND_ROBIN',
    next_phase VARCHAR(20) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de equipos
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name VARCHAR(100) NOT NULL,
    logo_url VARCHAR(255),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    number_of_players INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN DEFAULT TRUE
);

-- Tabla de estadísticas de equipo
CREATE TABLE team_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL UNIQUE REFERENCES teams(id) ON DELETE CASCADE,
    division_id UUID REFERENCES divisions(id) ON DELETE SET NULL,
    goals_for INTEGER NOT NULL DEFAULT 0,
    goals_against INTEGER NOT NULL DEFAULT 0,
    matches_played INTEGER NOT NULL DEFAULT 0,
    matches_won INTEGER NOT NULL DEFAULT 0,
    matches_drawn INTEGER NOT NULL DEFAULT 0,
    matches_lost INTEGER NOT NULL DEFAULT 0,
    points INTEGER NOT NULL DEFAULT 0,
    position INTEGER,
    qualified_next_round BOOLEAN DEFAULT FALSE
);

-- Tabla de equipos por división
CREATE TABLE division_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    division_id UUID NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    initial_position INTEGER NOT NULL,
    current_position INTEGER NOT NULL,
    UNIQUE (division_id, team_id)
);

-- Tabla de jornadas
CREATE TABLE journeys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journey_number INTEGER NOT NULL,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    start_date DATE,
    end_date DATE,
    completed BOOLEAN DEFAULT FALSE
);

-- Tabla de jugadores
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL,
    birth_date DATE,
    photo_url VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    jersey_number INTEGER NOT NULL,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    player_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    captain BOOLEAN NOT NULL DEFAULT FALSE
);

-- Tabla de partidos
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
    home_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    away_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    match_date DATE,
    winner_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    phase VARCHAR(20) NOT NULL DEFAULT 'ROUND_ROBIN',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    referee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category_id UUID
);

-- Tabla de estadísticas de partido por equipo
CREATE TABLE team_match_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    goals INTEGER NOT NULL DEFAULT 0,
    goals_against INTEGER NOT NULL DEFAULT 0,
    points INTEGER NOT NULL DEFAULT 0,
    UNIQUE (match_id, team_id)
);

-- Tabla de estadísticas de jugador globales
CREATE TABLE player_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL UNIQUE REFERENCES players(id) ON DELETE CASCADE,
    goals INTEGER NOT NULL DEFAULT 0,
    points INTEGER NOT NULL DEFAULT 0,
    jersey_number INTEGER NOT NULL DEFAULT 0,
    yellow_cards INTEGER NOT NULL DEFAULT 0,
    red_cards INTEGER NOT NULL DEFAULT 0
);

-- Tabla de estadísticas de jugador por partido
CREATE TABLE player_match_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    jersey_number INTEGER NOT NULL,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    goals INTEGER NOT NULL DEFAULT 0,
    yellow_cards INTEGER NOT NULL DEFAULT 0,
    red_cards INTEGER NOT NULL DEFAULT 0,
    attended BOOLEAN NOT NULL DEFAULT FALSE,
    points INT,
    UNIQUE (player_id, match_id)
);

-- Tabla de deudas de jugadores
CREATE TABLE player_debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    description TEXT,
    due_date DATE,
    paid_date DATE
);

-- Tabla de deudas de equipos
CREATE TABLE team_debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    description TEXT,
    due_date DATE,
    paid_date DATE
);

-- Tabla de pagos a árbitros
CREATE TABLE referee_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
    payment_date DATE NOT NULL,
    hours_worked DECIMAL(5,2) NOT NULL,
    hourly_rate_amount DECIMAL(10,2) NOT NULL,
    total_payment_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
);


-- Create the table with all required columns
CREATE TABLE fut_jaguar.weekly_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES fut_jaguar.matches(id) ON DELETE CASCADE,
    tournament_id UUID REFERENCES fut_jaguar.tournaments(id) ON DELETE CASCADE,
    match_day VARCHAR(10) NOT NULL CHECK (match_day IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo')),
    match_date DATE NOT NULL,
    match_time TIME NOT NULL,
    home_team_name VARCHAR(100) NOT NULL,
    away_team_name VARCHAR(100) NOT NULL, -- This was missing in your schema
    tournament_name VARCHAR(100) NOT NULL,
    category_name VARCHAR(100) NOT NULL, -- Changed from category_id to match your entity
    phase VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    CONSTRAINT no_time_overlap EXCLUDE USING gist (
        match_date WITH =,
        match_time WITH =
    )
);



CREATE TABLE fut_jaguar.credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at DATE DEFAULT CURRENT_DATE,  -- Changed to DATE
    updated_at DATE
);

-- Enhanced inscription table
CREATE TABLE fut_jaguar.inscription (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES fut_jaguar.teams(id),
    name_team VARCHAR(100) NOT NULL,
    num_player INTEGER NOT NULL CHECK (num_player > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    status VARCHAR(20) DEFAULT 'PENDING'
);



-- After adding data, you may want to remove the default:
-- ALTER TABLE fut_jaguar.weekly_schedule ALTER COLUMN away_team_name DROP DEFAULT;
-- Índices para programación semanal
CREATE INDEX idx_weekly_schedule_date_time ON weekly_schedule (match_date, match_time);
CREATE INDEX idx_weekly_schedule_match_id ON weekly_schedule (match_id);






CREATE OR REPLACE PROCEDURE delete_category_teams(
    p_category_id UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Delete player match stats for players in this category's teams
    DELETE FROM player_match_stats pms
    USING players p, teams t
    WHERE pms.player_id = p.id
    AND p.team_id = t.id
    AND t.category_id = p_category_id;

    -- Delete team match stats for matches involving these teams
    DELETE FROM team_match_stats tms
    USING teams t
    WHERE tms.team_id = t.id
    AND t.category_id = p_category_id;

    -- Delete matches involving these teams
    DELETE FROM matches m
    USING teams t
    WHERE (m.home_team_id = t.id OR m.away_team_id = t.id)
    AND t.category_id = p_category_id;

    -- Delete weekly schedule entries for these matches
    DELETE FROM weekly_schedule ws
    USING matches m, teams t
    WHERE ws.match_id = m.id
    AND (m.home_team_id = t.id OR m.away_team_id = t.id)
    AND t.category_id = p_category_id;

    -- Delete division teams associations
    DELETE FROM division_teams dt
    USING teams t
    WHERE dt.team_id = t.id
    AND t.category_id = p_category_id;

    -- Delete team stats
    DELETE FROM team_stats ts
    USING teams t
    WHERE ts.team_id = t.id
    AND t.category_id = p_category_id;

    -- Delete players from these teams
    DELETE FROM players p
    USING teams t
    WHERE p.team_id = t.id
    AND t.category_id = p_category_id;

    -- Delete player stats for these players
    DELETE FROM player_stats ps
    USING players p, teams t
    WHERE ps.player_id = p.id
    AND p.team_id = t.id
    AND t.category_id = p_category_id;

    -- Delete player debts
    DELETE FROM player_debts pd
    USING players p, teams t
    WHERE pd.player_id = p.id
    AND p.team_id = t.id
    AND t.category_id = p_category_id;

    -- Delete team debts
    DELETE FROM team_debts td
    USING teams t
    WHERE td.team_id = t.id
    AND t.category_id = p_category_id;

    -- Finally delete the teams themselves
    DELETE FROM teams
    WHERE category_id = p_category_id;

    COMMIT;
END;
$$;
CREATE OR REPLACE PROCEDURE delete_tournament_data(
    p_tournament_id UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Delete player match stats for matches in this tournament
    DELETE FROM player_match_stats pms
    USING matches m
    WHERE pms.match_id = m.id
    AND m.tournament_id = p_tournament_id;

    -- Delete team match stats for matches in this tournament
    DELETE FROM team_match_stats tms
    USING matches m
    WHERE tms.match_id = m.id
    AND m.tournament_id = p_tournament_id;

    -- Delete weekly schedule entries for this tournament
    DELETE FROM weekly_schedule
    WHERE tournament_id = p_tournament_id OR match_id IN (
        SELECT id FROM matches WHERE tournament_id = p_tournament_id
    );

    -- Delete matches in this tournament
    DELETE FROM matches
    WHERE tournament_id = p_tournament_id;

    -- Delete journeys in this tournament
    DELETE FROM journeys
    WHERE tournament_id = p_tournament_id;

    -- Delete division teams for divisions in this tournament
    DELETE FROM division_teams
    WHERE division_id IN (
        SELECT id FROM divisions WHERE tournament_id = p_tournament_id
    );

    -- Delete divisions in this tournament
    DELETE FROM divisions
    WHERE tournament_id = p_tournament_id;

    -- Reset tournament references in teams (without deleting the teams)
    UPDATE teams
    SET tournament_id = NULL
    WHERE tournament_id = p_tournament_id;

    -- Reset team stats division references
    UPDATE team_stats
    SET division_id = NULL
    WHERE division_id IN (
        SELECT id FROM divisions WHERE tournament_id = p_tournament_id
    );

    -- Finally delete the tournament itself
    DELETE FROM tournaments
    WHERE id = p_tournament_id;

    COMMIT;
END;
$$;