-- Drop the existing function completely (specify exact signature)
DROP FUNCTION IF EXISTS fut_jaguar.get_matches_in_date_range_fn(date, date);

-- Create the corrected function WITHOUT category_id
CREATE OR REPLACE FUNCTION fut_jaguar.get_matches_in_date_range_fn(
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    id UUID,
    match_id UUID,
    tournament_id UUID,
    match_day VARCHAR(10),
    match_date DATE,
    match_time TIME,
    home_team_name VARCHAR(100),
    away_team_name VARCHAR(100),
    tournament_name VARCHAR(100),
    category_name VARCHAR(100),  -- ONLY category_name, NO category_id
    phase VARCHAR(20),
    status VARCHAR(20)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ws.id,
        ws.match_id,
        ws.tournament_id,
        ws.match_day,
        ws.match_date,
        ws.match_time,
        ws.home_team_name,
        ws.away_team_name,
        ws.tournament_name,
        ws.category_name,  -- Only this field, no category_id
        ws.phase,
        ws.status
    FROM 
        fut_jaguar.weekly_schedule ws
    WHERE 
        ws.match_date BETWEEN p_start_date AND p_end_date
    ORDER BY 
        ws.match_date, ws.match_time;
END;
$$;