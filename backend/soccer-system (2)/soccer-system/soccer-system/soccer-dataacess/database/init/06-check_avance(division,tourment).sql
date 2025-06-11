CREATE OR REPLACE FUNCTION fut_jaguar.check_tournament_stage(
    p_tournament_id UUID,
    p_category_id UUID
)
RETURNS TABLE (
    current_stage VARCHAR(20),
    can_create_divisions BOOLEAN,
    recommended_divisions INTEGER,
    total_teams INTEGER,
    completed_matches INTEGER,
    total_matches INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_team_count INTEGER := 0;
    v_completed_matches INTEGER := 0;
    v_total_matches INTEGER := 0;
    v_current_phase VARCHAR(20);
    v_division_count INTEGER := 1;
    v_can_create BOOLEAN := FALSE;
BEGIN
    -- Get current phase of the tournament
    SELECT current_phase INTO v_current_phase 
    FROM fut_jaguar.tournaments 
    WHERE id = p_tournament_id;
    
    IF v_current_phase IS NULL THEN
        v_current_phase := 'UNKNOWN';
    END IF;
    
    -- Count active teams in this tournament and category
    SELECT COUNT(*) INTO v_team_count
    FROM fut_jaguar.teams
    WHERE tournament_id = p_tournament_id 
    AND category_id = p_category_id
    AND active = TRUE;
    
    -- Count completed matches in round robin phase
    SELECT 
        COUNT(*) FILTER (WHERE status = 'COMPLETADO') AS completed,
        COUNT(*) AS total
    INTO 
        v_completed_matches,
        v_total_matches
    FROM fut_jaguar.matches
    WHERE tournament_id = p_tournament_id
    AND category_id = p_category_id
    AND phase = 'ROUND_ROBIN';
    
    -- Determine if divisions can be created
    -- Only allow in ROUND_ROBIN phase when all matches are completed
    IF v_current_phase = 'ROUND_ROBIN' AND v_completed_matches = v_total_matches AND v_total_matches > 0 THEN
        -- Check if divisions already exist
        IF NOT EXISTS (
            SELECT 1 FROM fut_jaguar.divisions 
            WHERE tournament_id = p_tournament_id 
            AND category_id = p_category_id
        ) THEN
            v_can_create := TRUE;
        END IF;
    END IF;
    
    -- Calculate recommended number of divisions
    IF v_team_count > 14 THEN
        v_division_count := 2;
    ELSE
        v_division_count := 1;
    END IF;
    
    -- Return results
    RETURN QUERY
    SELECT 
        v_current_phase::VARCHAR(20) AS current_stage,
        v_can_create AS can_create_divisions,
        v_division_count AS recommended_divisions,
        v_team_count AS total_teams,
        v_completed_matches AS completed_matches,
        v_total_matches AS total_matches;
END;
$$;

CREATE OR REPLACE FUNCTION fut_jaguar.can_advance_division(
    p_division_id UUID,
    p_tournament_id UUID,
    p_category_id UUID
) RETURNS TABLE (
    can_advance BOOLEAN,
    current_phase VARCHAR(20),
    next_phase VARCHAR(20),
    completed_matches INTEGER,
    total_matches INTEGER,
    teams_ready INTEGER,
    total_teams INTEGER,
    division_name VARCHAR(20)
) LANGUAGE plpgsql AS $$
DECLARE
    v_current_phase VARCHAR(20);
    v_division_name VARCHAR(20);
    v_completed_matches INTEGER;
    v_total_matches INTEGER;
    v_teams_ready INTEGER;
    v_total_teams INTEGER;
    v_next_phase VARCHAR(20);
BEGIN
    -- Get division name and current phase from the divisions table
    SELECT 
        d.division_name,
        d.current_phase
    INTO 
        v_division_name,
        v_current_phase
    FROM 
        fut_jaguar.divisions d
    WHERE 
        d.id = p_division_id
        AND d.tournament_id = p_tournament_id;
        
    -- If division doesn't exist
    IF v_division_name IS NULL THEN
        RETURN QUERY SELECT 
            FALSE,
            'DIVISION_NOT_FOUND',
            'N/A',
            0,
            0,
            0,
            0,
            'N/A';
        RETURN;
    END IF;
        
    -- Determine next phase based on current phase for THIS division
    CASE v_current_phase
        WHEN 'ROUND_ROBIN' THEN v_next_phase := 'CUARTOS_' || v_division_name;
        WHEN 'CUARTOS_PRIMERA' THEN v_next_phase := 'SEMIFINAL_PRIMERA';
        WHEN 'CUARTOS_SEGUNDA' THEN v_next_phase := 'SEMIFINAL_SEGUNDA';
        WHEN 'SEMIFINAL_PRIMERA' THEN v_next_phase := 'FINAL_PRIMERA';
        WHEN 'SEMIFINAL_SEGUNDA' THEN v_next_phase := 'FINAL_SEGUNDA';
        WHEN 'FINAL_PRIMERA' THEN v_next_phase := 'TERCER_LUGAR_PRIMERA';
        WHEN 'FINAL_SEGUNDA' THEN v_next_phase := 'TERCER_LUGAR_SEGUNDA';
        WHEN 'TERCER_LUGAR_PRIMERA' THEN v_next_phase := 'COMPLETED';
        WHEN 'TERCER_LUGAR_SEGUNDA' THEN v_next_phase := 'COMPLETED';
        ELSE v_next_phase := 'UNKNOWN';
    END CASE;
    
    -- Count matches for the CURRENT phase in the tournament
    -- For phases that include division name in their phase (like SEMIFINAL_PRIMERA)
    SELECT 
        COUNT(*) FILTER (WHERE m.status = 'COMPLETADO') AS completed,
        COUNT(*) AS total
    INTO 
        v_completed_matches,
        v_total_matches
    FROM 
        fut_jaguar.matches m
    WHERE 
        m.tournament_id = p_tournament_id
        AND m.category_id = p_category_id
        AND m.phase = v_current_phase;
        
    -- Count teams ready to advance in THIS division only
    SELECT 
        COUNT(*) FILTER (WHERE ts.qualified_next_round = TRUE) AS ready,
        COUNT(*) AS total
    INTO 
        v_teams_ready,
        v_total_teams
    FROM 
        fut_jaguar.team_stats ts
    JOIN 
        fut_jaguar.division_teams dt ON ts.team_id = dt.team_id
    WHERE 
        dt.division_id = p_division_id;
        
    -- Return results
    RETURN QUERY SELECT 
        (v_completed_matches = v_total_matches AND v_total_matches > 0) AND
        (v_next_phase NOT IN ('COMPLETED', 'UNKNOWN')) AS can_advance,
        v_current_phase AS current_phase,
        v_next_phase AS next_phase,
        v_completed_matches AS completed_matches,
        v_total_matches AS total_matches,
        v_teams_ready AS teams_ready,
        v_total_teams AS total_teams,
        v_division_name AS division_name;
END;
$$;
