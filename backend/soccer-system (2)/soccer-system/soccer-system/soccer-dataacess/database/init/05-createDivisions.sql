CREATE OR REPLACE PROCEDURE fut_jaguar.create_tournament_divisions(
    p_tournament_id UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_qualified_team_count INT;
    v_total_team_count INT;
    v_division1_id UUID;
    v_division2_id UUID;
    v_team_record RECORD;
    v_position INT;
    v_journey_id UUID;
    v_journey_number INT;
    v_match_id UUID;
    v_match_date TIMESTAMP;
    v_phase VARCHAR(50);
    v_team_order RECORD;
    v_home_team UUID;
    v_away_team UUID;
    v_player RECORD;
    v_category_id UUID;
BEGIN
    -- Get the tournament's category_id
    SELECT category_id INTO v_category_id
    FROM fut_jaguar.tournaments
    WHERE id = p_tournament_id;
    
    -- Count total teams in tournament
    SELECT COUNT(*) INTO v_total_team_count
    FROM fut_jaguar.teams
    WHERE tournament_id = p_tournament_id;
    
    -- First, clear any existing qualification flags
    UPDATE fut_jaguar.team_stats
    SET qualified_next_round = false
    WHERE team_id IN (
        SELECT id FROM fut_jaguar.teams
        WHERE tournament_id = p_tournament_id
    );
    
    -- Automatically qualify top 16 teams based on points
    WITH ranked_teams AS (
        SELECT 
            ts.team_id,
            ROW_NUMBER() OVER (
                ORDER BY ts.points DESC, 
                (ts.goals_for - ts.goals_against) DESC, 
                ts.goals_for DESC
            ) as rank
        FROM fut_jaguar.team_stats ts
        JOIN fut_jaguar.teams t ON ts.team_id = t.id
        WHERE t.tournament_id = p_tournament_id
    )
    UPDATE fut_jaguar.team_stats
    SET qualified_next_round = true
    FROM ranked_teams
    WHERE team_stats.team_id = ranked_teams.team_id
    AND ranked_teams.rank <= 16;
    
    -- Count how many teams are now qualified
    SELECT COUNT(*) INTO v_qualified_team_count
    FROM fut_jaguar.team_stats ts
    WHERE ts.qualified_next_round = true
    AND ts.team_id IN (
        SELECT t.id FROM fut_jaguar.teams t
        WHERE t.tournament_id = p_tournament_id
    );
    
    RAISE NOTICE 'Tournament % has % qualified teams (out of % total teams)', 
        p_tournament_id, v_qualified_team_count, v_total_team_count;
    
    -- Delete any existing divisions for this tournament
    DELETE FROM fut_jaguar.division_teams
    WHERE division_id IN (
        SELECT id FROM fut_jaguar.divisions
        WHERE tournament_id = p_tournament_id
    );
    
    DELETE FROM fut_jaguar.divisions
    WHERE tournament_id = p_tournament_id;
    
    -- Get the next journey number
    SELECT COALESCE(MAX(journey_number), 0) + 1 INTO v_journey_number
    FROM fut_jaguar.journeys
    WHERE tournament_id = p_tournament_id;
    
    -- Create a new journey for the division phase
    INSERT INTO fut_jaguar.journeys (id, journey_number, tournament_id, start_date, end_date, completed)
    VALUES (
        gen_random_uuid(),
        v_journey_number,
        p_tournament_id,
        CURRENT_DATE + INTERVAL '1 day',
        CURRENT_DATE + INTERVAL '7 days',
        false
    )
    RETURNING id INTO v_journey_id;
    
    -- Decision logic for divisions
    IF v_qualified_team_count >= 16 THEN
        -- Case 1: 16+ qualified teams - split into two divisions of 8 each
        RAISE NOTICE 'Creating two divisions (Primera and Segunda) with 8 teams each';
        
        -- Create Primera division (top 8 teams)
        INSERT INTO fut_jaguar.divisions (
            id, tournament_id, division_name, category_id, 
            current_phase, next_phase
        )
        VALUES (
            gen_random_uuid(), 
            p_tournament_id, 
            'PRIMERA', 
            v_category_id,
            'CUARTOS_PRIMERA', 
            'SEMIFINAL_PRIMERA'
        )
        RETURNING id INTO v_division1_id;
        
        -- Create Segunda division (next 8 teams)
        INSERT INTO fut_jaguar.divisions (
            id, tournament_id, division_name, category_id,
            current_phase, next_phase
        )
        VALUES (
            gen_random_uuid(), 
            p_tournament_id, 
            'SEGUNDA', 
            v_category_id,
            'CUARTOS_SEGUNDA', 
            'SEMIFINAL_SEGUNDA'
        )
        RETURNING id INTO v_division2_id;
        
        -- Add teams to divisions (top 16 by points)
        v_position := 1;
        FOR v_team_record IN 
            SELECT ts.team_id
            FROM fut_jaguar.team_stats ts
            JOIN fut_jaguar.teams t ON ts.team_id = t.id
            WHERE ts.qualified_next_round = true
            AND t.tournament_id = p_tournament_id
            ORDER BY ts.points DESC, (ts.goals_for - ts.goals_against) DESC, ts.goals_for DESC
            LIMIT 16 -- Only take top 16 teams
        LOOP
            IF v_position <= 8 THEN
                -- Primera division (top 8)
                INSERT INTO fut_jaguar.division_teams (
                    id, division_id, team_id, initial_position, current_position
                )
                VALUES (
                    gen_random_uuid(),
                    v_division1_id,
                    v_team_record.team_id,
                    v_position,
                    v_position
                );
                
                -- Update team_stats with division
                UPDATE fut_jaguar.team_stats
                SET division_id = v_division1_id
                WHERE team_id = v_team_record.team_id;
            ELSE
                -- Segunda division (next 8)
                INSERT INTO fut_jaguar.division_teams (
                    id, division_id, team_id, initial_position, current_position
                )
                VALUES (
                    gen_random_uuid(),
                    v_division2_id,
                    v_team_record.team_id,
                    v_position - 8,
                    v_position - 8
                );
                
                -- Update team_stats with division
                UPDATE fut_jaguar.team_stats
                SET division_id = v_division2_id
                WHERE team_id = v_team_record.team_id;
            END IF;
            
            v_position := v_position + 1;
        END LOOP;
        
        -- Create matches for Primera division (1v8, 2v7, 3v6, 4v5)
        v_phase := 'CUARTOS_PRIMERA';
        v_match_date := CURRENT_TIMESTAMP + INTERVAL '1 day';
        
        -- Get teams in Primera division ordered by position
        SELECT array_agg(dt.team_id ORDER BY dt.initial_position) AS team_ids
        INTO v_team_order
        FROM fut_jaguar.division_teams dt
        WHERE dt.division_id = v_division1_id;
        
        -- Create matches for Primera division
        FOR i IN 1..4 LOOP
            v_home_team := v_team_order.team_ids[i];
            v_away_team := v_team_order.team_ids[9 - i];
            
            -- Create the match (with category_id)
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
                v_match_date + (i * INTERVAL '2 hours'),
                v_phase,
                'PENDIENTE',
                v_category_id
            )
            RETURNING id INTO v_match_id;
            
            -- Create team_match_stats for both teams
            INSERT INTO fut_jaguar.team_match_stats (id, match_id, team_id, goals, goals_against, points)
            VALUES (gen_random_uuid(), v_match_id, v_home_team, 0, 0, 0);
            
            INSERT INTO fut_jaguar.team_match_stats (id, match_id, team_id, goals, goals_against, points)
            VALUES (gen_random_uuid(), v_match_id, v_away_team, 0, 0, 0);
            
            -- Create player_match_stats for home team players
            FOR v_player IN 
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
                    v_player.first_name,
                    v_player.jersey_number,
                    v_player.id,
                    v_match_id,
                    v_home_team,
                    0, 0, 0, false
                );
            END LOOP;
            
            -- Create player_match_stats for away team players
            FOR v_player IN 
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
                    v_player.first_name,
                    v_player.jersey_number,
                    v_player.id,
                    v_match_id,
                    v_away_team,
                    0, 0, 0, false
                );
            END LOOP;
        END LOOP;
        
        -- Create matches for Segunda division (1v8, 2v7, 3v6, 4v5)
        v_phase := 'CUARTOS_SEGUNDA';
        v_match_date := CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '8 hours';
        
        -- Get teams in Segunda division ordered by position
        SELECT array_agg(dt.team_id ORDER BY dt.initial_position) AS team_ids
        INTO v_team_order
        FROM fut_jaguar.division_teams dt
        WHERE dt.division_id = v_division2_id;
        
        -- Create matches for Segunda division
        FOR i IN 1..4 LOOP
            v_home_team := v_team_order.team_ids[i];
            v_away_team := v_team_order.team_ids[9 - i];
            
            -- Create the match
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
                v_match_date + (i * INTERVAL '2 hours'),
                v_phase,
                'PENDIENTE',
                v_category_id
            )
            RETURNING id INTO v_match_id;
            
            -- Create team_match_stats for both teams
            INSERT INTO fut_jaguar.team_match_stats (id, match_id, team_id, goals, goals_against, points)
            VALUES (gen_random_uuid(), v_match_id, v_home_team, 0, 0, 0);
            
            INSERT INTO fut_jaguar.team_match_stats (id, match_id, team_id, goals, goals_against, points)
            VALUES (gen_random_uuid(), v_match_id, v_away_team, 0, 0, 0);
            
            -- Create player_match_stats for home team players
            FOR v_player IN 
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
                    v_player.first_name,
                    v_player.jersey_number,
                    v_player.id,
                    v_match_id,
                    v_home_team,
                    0, 0, 0, false
                );
            END LOOP;
            
            -- Create player_match_stats for away team players
            FOR v_player IN 
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
                    v_player.first_name,
                    v_player.jersey_number,
                    v_player.id,
                    v_match_id,
                    v_away_team,
                    0, 0, 0, false
                );
            END LOOP;
        END LOOP;
        
    ELSIF v_qualified_team_count >= 14 THEN
        -- Case 2: 14-15 qualified teams - single division (Primera only)
        RAISE NOTICE 'Creating single division (Primera) with % teams', v_qualified_team_count;
        
        -- Create Primera division with current_phase and next_phase
        INSERT INTO fut_jaguar.divisions (
            id, tournament_id, division_name, category_id, 
            current_phase, next_phase
        )
        VALUES (
            gen_random_uuid(), 
            p_tournament_id, 
            'PRIMERA', 
            v_category_id,
            'CUARTOS_PRIMERA', 
            'SEMIFINAL_PRIMERA'
        )
        RETURNING id INTO v_division1_id;
        
        -- Add all qualified teams to Primera division
        v_position := 1;
        FOR v_team_record IN 
            SELECT ts.team_id
            FROM fut_jaguar.team_stats ts
            JOIN fut_jaguar.teams t ON ts.team_id = t.id
            WHERE ts.qualified_next_round = true
            AND t.tournament_id = p_tournament_id
            ORDER BY ts.points DESC, (ts.goals_for - ts.goals_against) DESC, ts.goals_for DESC
        LOOP
            INSERT INTO fut_jaguar.division_teams (
                id, division_id, team_id, initial_position, current_position
            )
            VALUES (
                gen_random_uuid(),
                v_division1_id,
                v_team_record.team_id,
                v_position,
                v_position
            );
            
            -- Update team_stats with division
            UPDATE fut_jaguar.team_stats
            SET division_id = v_division1_id
            WHERE team_id = v_team_record.team_id;
            
            v_position := v_position + 1;
        END LOOP;
        
        -- Create matches for Primera division (1v8, 2v7, 3v6, 4v5)
        v_phase := 'CUARTOS_PRIMERA';
        v_match_date := CURRENT_TIMESTAMP + INTERVAL '1 day';
        
        -- Get teams in Primera division ordered by position
        SELECT array_agg(dt.team_id ORDER BY dt.initial_position) AS team_ids
        INTO v_team_order
        FROM fut_jaguar.division_teams dt
        WHERE dt.division_id = v_division1_id;
        
        -- Calculate how many matches to create (top 8 teams if available)
        DECLARE
            v_max_teams INT := LEAST(v_qualified_team_count, 8);
            v_matches_to_create INT := v_max_teams / 2;
        BEGIN
            -- Create matches for Primera division
            FOR i IN 1..v_matches_to_create LOOP
                v_home_team := v_team_order.team_ids[i];
                v_away_team := v_team_order.team_ids[v_max_teams - i + 1];
                
                -- Create the match
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
                    v_match_date + (i * INTERVAL '2 hours'),
                    v_phase,
                    'PENDIENTE',
                    v_category_id
                )
                RETURNING id INTO v_match_id;
                
                -- Create team_match_stats for both teams
                INSERT INTO fut_jaguar.team_match_stats (id, match_id, team_id, goals, goals_against, points)
                VALUES (gen_random_uuid(), v_match_id, v_home_team, 0, 0, 0);
                
                INSERT INTO fut_jaguar.team_match_stats (id, match_id, team_id, goals, goals_against, points)
                VALUES (gen_random_uuid(), v_match_id, v_away_team, 0, 0, 0);
                
                -- Create player_match_stats for home team players
                FOR v_player IN 
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
                        v_player.first_name,
                        v_player.jersey_number,
                        v_player.id,
                        v_match_id,
                        v_home_team,
                        0, 0, 0, false
                    );
                END LOOP;
                
                -- Create player_match_stats for away team players
                FOR v_player IN 
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
                        v_player.first_name,
                        v_player.jersey_number,
                        v_player.id,
                        v_match_id,
                        v_away_team,
                        0, 0, 0, false
                    );
                END LOOP;
            END LOOP;
        END;
    ELSE
        -- Case 3: Less than 14 qualified teams - no divisions (all teams play in one bracket)
        RAISE NOTICE 'Not enough teams (% qualified) to create divisions - all teams play in one bracket', v_qualified_team_count;
        
        -- No divisions created - all qualified teams will play in the main bracket
        -- We still need to update their positions
        v_position := 1;
        FOR v_team_record IN 
            SELECT ts.team_id
            FROM fut_jaguar.team_stats ts
            JOIN fut_jaguar.teams t ON ts.team_id = t.id
            WHERE ts.qualified_next_round = true
            AND t.tournament_id = p_tournament_id
            ORDER BY ts.points DESC, (ts.goals_for - ts.goals_against) DESC, ts.goals_for DESC
        LOOP
            -- Update team position without assigning to a division
            UPDATE fut_jaguar.team_stats
            SET position = v_position
            WHERE team_id = v_team_record.team_id;
            
            v_position := v_position + 1;
        END LOOP;
        
        -- Create elimination matches for all qualified teams
        v_phase := 'ELIMINATION';
        v_match_date := CURRENT_TIMESTAMP + INTERVAL '1 day';
        
        -- Get all qualified teams ordered by position
        SELECT array_agg(ts.team_id ORDER BY ts.points DESC, 
               (ts.goals_for - ts.goals_against) DESC, 
               ts.goals_for DESC) AS team_ids
        INTO v_team_order
        FROM fut_jaguar.team_stats ts
        WHERE ts.qualified_next_round = true
        AND ts.team_id IN (
            SELECT id FROM fut_jaguar.teams
            WHERE tournament_id = p_tournament_id
        );
        
        -- Calculate how many matches to create
        DECLARE
            v_teams_count INT := array_length(v_team_order.team_ids, 1);
            v_matches_to_create INT := v_teams_count / 2;
        BEGIN
            -- Create elimination matches (1vN, 2vN-1, etc.)
            FOR i IN 1..v_matches_to_create LOOP
                v_home_team := v_team_order.team_ids[i];
                v_away_team := v_team_order.team_ids[v_teams_count - i + 1];
                
                -- Create the match
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
                    v_match_date + (i * INTERVAL '2 hours'),
                    v_phase,
                    'PENDIENTE',
                    v_category_id
                )
                RETURNING id INTO v_match_id;
                
                -- Create team_match_stats for both teams
                INSERT INTO fut_jaguar.team_match_stats (id, match_id, team_id, goals, goals_against, points)
                VALUES (gen_random_uuid(), v_match_id, v_home_team, 0, 0, 0);
                
                INSERT INTO fut_jaguar.team_match_stats (id, match_id, team_id, goals, goals_against, points)
                VALUES (gen_random_uuid(), v_match_id, v_away_team, 0, 0, 0);
                
                -- Create player_match_stats for home team players
                FOR v_player IN 
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
                        v_player.first_name,
                        v_player.jersey_number,
                        v_player.id,
                        v_match_id,
                        v_home_team,
                        0, 0, 0, false
                    );
                END LOOP;
                
                -- Create player_match_stats for away team players
                FOR v_player IN 
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
                        v_player.first_name,
                        v_player.jersey_number,
                        v_player.id,
                        v_match_id,
                        v_away_team,
                        0, 0, 0, false
                    );
                END LOOP;
            END LOOP;
        END;
    END IF;
    
    -- Update tournament current_phase only (removed primera_phase and segunda_phase)
    UPDATE fut_jaguar.tournaments
    SET current_phase = CASE 
            WHEN v_qualified_team_count >= 14 THEN 'DIVISION_PHASE' 
            ELSE 'ELIMINATION_PHASE' 
        END
    WHERE id = p_tournament_id;
    
    RAISE NOTICE 'Finished creating divisions and matches for tournament %', p_tournament_id;
END;
$$;