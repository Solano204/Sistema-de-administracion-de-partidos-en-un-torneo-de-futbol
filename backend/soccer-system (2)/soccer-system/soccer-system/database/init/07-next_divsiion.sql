CREATE OR REPLACE PROCEDURE fut_jaguar.advance_to_next_phase(
    p_tournament_id UUID,
    p_division_name VARCHAR(20) DEFAULT NULL -- 'PRIMERA', 'SEGUNDA', or NULL for both
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_tournament RECORD;
    v_division_count INT;
    v_next_phase VARCHAR(20);
    v_journey_id UUID;
    v_journey_number INT;
    v_division_teams RECORD;
    v_team_order RECORD;
    v_home_team UUID;
    v_away_team UUID;
    v_match_date TIMESTAMP;
    v_division_phase VARCHAR(20);
    v_current_division_name VARCHAR(20);
    v_division_id UUID;
    v_qualified_teams UUID[];
    v_qualified_count INT;
    v_semifinal_losers UUID[];
    v_match_id UUID;
    v_player RECORD;
    v_semifinal_matches RECORD;
    v_player_data RECORD;
    v_category_id UUID;
BEGIN
    -- Get tournament info
    SELECT * INTO v_tournament
    FROM fut_jaguar.tournaments
    WHERE id = p_tournament_id;
    
    -- Get category_id from tournament
    SELECT category_id INTO v_category_id
    FROM fut_jaguar.tournaments
    WHERE id = p_tournament_id;
    
    -- Count divisions
    SELECT COUNT(*) INTO v_division_count
    FROM fut_jaguar.divisions
    WHERE tournament_id = p_tournament_id;
    
    -- Handle round-robin phase (transition to divisions)
    IF v_tournament.current_phase = 'ROUND_ROBIN' THEN
        -- Validate all round-robin matches are completed
        IF EXISTS (
            SELECT 1 FROM fut_jaguar.matches
            WHERE tournament_id = p_tournament_id
            AND phase = 'ROUND_ROBIN'
            AND status != 'COMPLETADO'
        ) THEN
            RAISE EXCEPTION 'Not all round-robin matches are completed';
        END IF;
        
        -- Create divisions based on standings
        CALL fut_jaguar.create_tournament_divisions(p_tournament_id);
        RETURN;
    END IF;
    
    -- Handle division phases
    IF v_tournament.current_phase = 'DIVISION_PHASE' THEN
        -- Get next journey number
        SELECT COALESCE(MAX(journey_number), 0) + 1 INTO v_journey_number
        FROM fut_jaguar.journeys
        WHERE tournament_id = p_tournament_id;
        
        -- Create a new journey for the next phase
        INSERT INTO fut_jaguar.journeys (id, journey_number, tournament_id, start_date, end_date, completed)
        VALUES (
            gen_random_uuid(),
            v_journey_number,
            p_tournament_id,
            CURRENT_DATE + INTERVAL '1 day',
            CURRENT_DATE + INTERVAL '3 days',
            false
        )
        RETURNING id INTO v_journey_id;
        
        -- Process divisions (either specific one or all)
        FOR v_division_teams IN 
            SELECT d.id, d.division_name, d.current_phase AS current_division_phase, d.category_id
            FROM fut_jaguar.divisions d
            WHERE d.tournament_id = p_tournament_id
            AND (p_division_name IS NULL OR d.division_name = p_division_name)
        LOOP
            v_division_id := v_division_teams.id;
            v_current_division_name := v_division_teams.division_name;
            v_division_phase := v_division_teams.current_division_phase;
            v_category_id := v_division_teams.category_id;
            
            RAISE NOTICE 'Processing division % (current phase: %)', 
                v_current_division_name, v_division_phase;
            
            -- Validate all current phase matches are completed for this division
            IF EXISTS (
                SELECT 1 FROM fut_jaguar.matches
                WHERE tournament_id = p_tournament_id
                AND phase = v_division_phase
                AND status != 'COMPLETADO'
            ) THEN
                RAISE EXCEPTION 'Not all matches in current phase (%) are completed for division %', 
                    v_division_phase, v_current_division_name;
            END IF;
            
            -- Clear previous qualifications for this division
            UPDATE fut_jaguar.team_stats ts
            SET qualified_next_round = false
            WHERE ts.division_id = v_division_id
            AND ts.team_id IN (
                SELECT team_id FROM fut_jaguar.team_match_stats tms
                JOIN fut_jaguar.matches m ON tms.match_id = m.id
                WHERE m.tournament_id = p_tournament_id
            );
            
            -- Set qualified teams (winners from current phase)
            IF v_division_phase != 'ROUND_ROBIN' THEN
                UPDATE fut_jaguar.team_stats ts
                SET qualified_next_round = true
                WHERE ts.team_id IN (
                    SELECT winner_team_id 
                    FROM fut_jaguar.matches
                    WHERE tournament_id = p_tournament_id
                    AND phase = v_division_phase
                    AND winner_team_id IS NOT NULL
                )
                AND ts.division_id = v_division_id;
            END IF;
            
            -- Determine next phase for this division
            CASE v_division_phase
                WHEN 'CUARTOS_PRIMERA', 'CUARTOS_SEGUNDA' THEN
                    v_next_phase := REPLACE(v_division_phase, 'CUARTOS', 'SEMIFINAL');
                WHEN 'SEMIFINAL_PRIMERA', 'SEMIFINAL_SEGUNDA' THEN
                    v_next_phase := REPLACE(v_division_phase, 'SEMIFINAL', 'FINAL');
                WHEN 'FINAL_PRIMERA', 'FINAL_SEGUNDA' THEN
                    -- For finals, we're done with this division
                    CONTINUE;
                ELSE
                    RAISE EXCEPTION 'Invalid division phase: %', v_division_phase;
            END CASE;
            
            -- Get qualified teams for next phase ordered by position (1st, 2nd, etc.)
            SELECT array_agg(dt.team_id ORDER BY dt.current_position) AS team_ids
            INTO v_team_order
            FROM fut_jaguar.division_teams dt
            JOIN fut_jaguar.team_stats ts ON dt.team_id = ts.team_id
            WHERE dt.division_id = v_division_id
            AND ts.qualified_next_round = true;
            
            v_qualified_count := array_length(v_team_order.team_ids, 1);
            
            -- Create matches for next phase with "extremo a extremo" pairing
            IF v_next_phase LIKE 'SEMIFINAL_%' THEN
                -- Semifinals: 1v4, 2v3
                IF v_qualified_count != 4 THEN
                    RAISE EXCEPTION 'Expected 4 teams for semifinals, got %', v_qualified_count;
                END IF;
                
                FOR i IN 1..2 LOOP
                    v_home_team := v_team_order.team_ids[i];
                    v_away_team := v_team_order.team_ids[5 - i]; -- 1v4, 2v3
                    
                    -- Calculate match date (spread matches across days)
                    v_match_date := CURRENT_TIMESTAMP + (i * INTERVAL '1 day');
                    
                    -- Create the match - ADD CATEGORY_ID HERE
                    INSERT INTO fut_jaguar.matches (
                        id, tournament_id, journey_id, home_team_id, away_team_id, 
                        match_date, phase, status, category_id
                    )
                    VALUES (
                        gen_random_uuid(),
                        p_tournament_id,
                        v_journey_id,
                        v_home_team,
                        v_away_team,
                        v_match_date,
                        v_next_phase,
                        'PENDIENTE',
                        v_category_id
                    )
                    RETURNING id INTO v_match_id;
                    
                    -- Initialize team_match_stats for both teams
                    INSERT INTO fut_jaguar.team_match_stats (id, match_id, team_id, goals, goals_against, points)
                    VALUES (gen_random_uuid(), v_match_id, v_home_team, 0, 0, 0);
                    
                    INSERT INTO fut_jaguar.team_match_stats (id, match_id, team_id, goals, goals_against, points)
                    VALUES (gen_random_uuid(), v_match_id, v_away_team, 0, 0, 0);
                    
                    -- Initialize player_match_stats for home team with all required fields
                    FOR v_player_data IN 
                        SELECT p.id, p.first_name, p.jersey_number 
                        FROM fut_jaguar.players p
                        WHERE p.team_id = v_home_team
                    LOOP
                        INSERT INTO fut_jaguar.player_match_stats (
                            id, first_name, jersey_number, player_id, match_id, team_id, 
                            goals, yellow_cards, red_cards, attended
                        )
                        VALUES (
                            gen_random_uuid(),
                            v_player_data.first_name,
                            v_player_data.jersey_number,
                            v_player_data.id,
                            v_match_id,
                            v_home_team,
                            0, 0, 0, false
                        );
                    END LOOP;
                    
                    -- Initialize player_match_stats for away team with all required fields
                    FOR v_player_data IN 
                        SELECT p.id, p.first_name, p.jersey_number 
                        FROM fut_jaguar.players p
                        WHERE p.team_id = v_away_team
                    LOOP
                        INSERT INTO fut_jaguar.player_match_stats (
                            id, first_name, jersey_number, player_id, match_id, team_id, 
                            goals, yellow_cards, red_cards, attended
                        )
                        VALUES (
                            gen_random_uuid(),
                            v_player_data.first_name,
                            v_player_data.jersey_number,
                            v_player_data.id,
                            v_match_id,
                            v_away_team,
                            0, 0, 0, false
                        );
                    END LOOP;
                END LOOP;
                
            ELSIF v_next_phase LIKE 'FINAL_%' THEN
                -- Final: 1v2 (winners from semifinals)
                IF v_qualified_count != 2 THEN
                    RAISE EXCEPTION 'Expected 2 teams for final, got %', v_qualified_count;
                END IF;
                
                v_home_team := v_team_order.team_ids[1];
                v_away_team := v_team_order.team_ids[2];
                
                v_match_date := CURRENT_TIMESTAMP + INTERVAL '1 day';
                
                -- Create the final match - ADD CATEGORY_ID HERE
                INSERT INTO fut_jaguar.matches (
                    id, tournament_id, journey_id, home_team_id, away_team_id, 
                    match_date, phase, status, category_id
                )
                VALUES (
                    gen_random_uuid(),
                    p_tournament_id,
                    v_journey_id,
                    v_home_team,
                    v_away_team,
                    v_match_date,
                    v_next_phase,
                    'PENDIENTE',
                    v_category_id
                )
                RETURNING id INTO v_match_id;
                
                -- Initialize team_match_stats for both teams
                INSERT INTO fut_jaguar.team_match_stats (id, match_id, team_id, goals, goals_against, points)
                VALUES (gen_random_uuid(), v_match_id, v_home_team, 0, 0, 0);
                
                INSERT INTO fut_jaguar.team_match_stats (id, match_id, team_id, goals, goals_against, points)
                VALUES (gen_random_uuid(), v_match_id, v_away_team, 0, 0, 0);
                
                -- Initialize player_match_stats for home team with all required fields
                FOR v_player_data IN 
                    SELECT p.id, p.first_name, p.jersey_number 
                    FROM fut_jaguar.players p
                    WHERE p.team_id = v_home_team
                LOOP
                    INSERT INTO fut_jaguar.player_match_stats (
                        id, first_name, jersey_number, player_id, match_id, team_id, 
                        goals, yellow_cards, red_cards, attended
                    )
                    VALUES (
                        gen_random_uuid(),
                        v_player_data.first_name,
                        v_player_data.jersey_number,
                        v_player_data.id,
                        v_match_id,
                        v_home_team,
                        0, 0, 0, false
                    );
                END LOOP;
                
                -- Initialize player_match_stats for away team with all required fields
                FOR v_player_data IN 
                    SELECT p.id, p.first_name, p.jersey_number 
                    FROM fut_jaguar.players p
                    WHERE p.team_id = v_away_team
                LOOP
                    INSERT INTO fut_jaguar.player_match_stats (
                        id, first_name, jersey_number, player_id, match_id, team_id, 
                        goals, yellow_cards, red_cards, attended
                    )
                    VALUES (
                        gen_random_uuid(),
                        v_player_data.first_name,
                        v_player_data.jersey_number,
                        v_player_data.id,
                        v_match_id,
                        v_away_team,
                        0, 0, 0, false
                    );
                END LOOP;
                
                -- Create Tercer Lugar (third place) match for losers from semifinals
                -- Get the losing teams from semifinals
                SELECT array_agg(
                    CASE WHEN home_team_id = winner_team_id THEN away_team_id ELSE home_team_id END
                ) INTO v_semifinal_losers
                FROM fut_jaguar.matches
                WHERE tournament_id = p_tournament_id
                AND phase = REPLACE(v_next_phase, 'FINAL', 'SEMIFINAL')
                AND status = 'COMPLETADO'
                AND winner_team_id IS NOT NULL;
                
                IF array_length(v_semifinal_losers, 1) = 2 THEN
                    v_match_date := CURRENT_TIMESTAMP + INTERVAL '2 days';
                    
                    -- Create the third place match - ADD CATEGORY_ID HERE
                    INSERT INTO fut_jaguar.matches (
                        id, tournament_id, journey_id, home_team_id, away_team_id, 
                        match_date, phase, status, category_id
                    )
                    VALUES (
                        gen_random_uuid(),
                        p_tournament_id,
                        v_journey_id,
                        v_semifinal_losers[1],
                        v_semifinal_losers[2],
                        v_match_date,
                        REPLACE(v_next_phase, 'FINAL', 'TERCER_LUGAR'),
                        'PENDIENTE',
                        v_category_id
                    )
                    RETURNING id INTO v_match_id;
                    
                    -- Initialize team_match_stats for both teams
                    INSERT INTO fut_jaguar.team_match_stats (id, match_id, team_id, goals, goals_against, points)
                    VALUES (gen_random_uuid(), v_match_id, v_semifinal_losers[1], 0, 0, 0);
                    
                    INSERT INTO fut_jaguar.team_match_stats (id, match_id, team_id, goals, goals_against, points)
                    VALUES (gen_random_uuid(), v_match_id, v_semifinal_losers[2], 0, 0, 0);
                    
                    -- Initialize player_match_stats for home team with all required fields
                    FOR v_player_data IN 
                        SELECT p.id, p.first_name, p.jersey_number 
                        FROM fut_jaguar.players p
                        WHERE p.team_id = v_semifinal_losers[1]
                    LOOP
                        INSERT INTO fut_jaguar.player_match_stats (
                            id, first_name, jersey_number, player_id, match_id, team_id, 
                            goals, yellow_cards, red_cards, attended
                        )
                        VALUES (
                            gen_random_uuid(),
                            v_player_data.first_name,
                            v_player_data.jersey_number,
                            v_player_data.id,
                            v_match_id,
                            v_semifinal_losers[1],
                            0, 0, 0, false
                        );
                    END LOOP;
                    
                    -- Initialize player_match_stats for away team with all required fields
                    FOR v_player_data IN 
                        SELECT p.id, p.first_name, p.jersey_number 
                        FROM fut_jaguar.players p
                        WHERE p.team_id = v_semifinal_losers[2]
                    LOOP
                        INSERT INTO fut_jaguar.player_match_stats (
                            id, first_name, jersey_number, player_id, match_id, team_id, 
                            goals, yellow_cards, red_cards, attended
                        )
                        VALUES (
                            gen_random_uuid(),
                            v_player_data.first_name,
                            v_player_data.jersey_number,
                            v_player_data.id,
                            v_match_id,
                            v_semifinal_losers[2],
                            0, 0, 0, false
                        );
                    END LOOP;
                END IF;
            END IF;
            
            -- Update division phase in divisions table
            UPDATE fut_jaguar.divisions
            SET current_phase = v_next_phase,
                next_phase = CASE 
                             WHEN v_next_phase LIKE 'SEMIFINAL_%' THEN REPLACE(v_next_phase, 'SEMIFINAL', 'FINAL')
                             ELSE NULL
                             END
            WHERE id = v_division_id;
            
            RAISE NOTICE 'Advanced division % to phase %', v_current_division_name, v_next_phase;
        END LOOP;
        
        RAISE NOTICE 'Successfully advanced tournament %', p_tournament_id;
    END IF;
END;
$$;