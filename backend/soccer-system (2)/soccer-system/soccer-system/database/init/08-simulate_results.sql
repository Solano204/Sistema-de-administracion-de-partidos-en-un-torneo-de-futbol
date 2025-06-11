CREATE OR REPLACE PROCEDURE fut_jaguar.simulate_elimination_matches(
    p_tournament_id UUID,
    p_division_id UUID DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_match RECORD;
    v_home_goals INT;
    v_away_goals INT;
    v_winner_id UUID;
    v_current_phase VARCHAR(20);
    v_player RECORD;
    v_goals_scored INT;
    v_yellow_cards INT;
    v_red_cards INT;
    v_attended BOOLEAN;
    v_division_name VARCHAR(20);
    v_division_phase VARCHAR(20);
    v_team_stats RECORD;
    v_home_team_strength INT;
    v_away_team_strength INT;
    v_goals_left INT;
    v_player_count INT;
BEGIN
    -- Get division info if specified
    IF p_division_id IS NOT NULL THEN
        SELECT division_name, current_phase INTO v_division_name, v_division_phase
        FROM fut_jaguar.divisions
        WHERE id = p_division_id;
    ELSE
        -- Get current tournament phase if no division specified
        SELECT current_phase INTO v_current_phase
        FROM fut_jaguar.tournaments
        WHERE id = p_tournament_id;
    END IF;
    
    -- Process each pending elimination match
    FOR v_match IN 
        SELECT m.id, m.home_team_id, m.away_team_id, m.phase, 
               m.journey_id, ht.team_name as home_team_name, 
               at.team_name as away_team_name
        FROM fut_jaguar.matches m
        JOIN fut_jaguar.teams ht ON m.home_team_id = ht.id
        JOIN fut_jaguar.teams at ON m.away_team_id = at.id
        WHERE m.tournament_id = p_tournament_id 
        AND m.status = 'PENDIENTE'
        AND (
            (p_division_id IS NULL AND m.phase = v_current_phase) OR
            (p_division_id IS NOT NULL AND (
                m.phase = v_division_phase OR
                m.phase LIKE '%' || v_division_name
            ))
        )
    LOOP
        RAISE NOTICE 'Simulating match %: % vs % (%)', 
            v_match.id, v_match.home_team_name, v_match.away_team_name, v_match.phase;
        
        -- Get team strengths based on their stats
        SELECT 
            COALESCE(ts.points, 0) * 3 + COALESCE(ts.goals_for, 0) - COALESCE(ts.goals_against, 0) AS strength
        INTO v_home_team_strength
        FROM fut_jaguar.team_stats ts
        WHERE ts.team_id = v_match.home_team_id;
        
        SELECT 
            COALESCE(ts.points, 0) * 3 + COALESCE(ts.goals_for, 0) - COALESCE(ts.goals_against, 0) AS strength
        INTO v_away_team_strength
        FROM fut_jaguar.team_stats ts
        WHERE ts.team_id = v_match.away_team_id;
        
        -- Handle case where team stats don't exist yet
        IF v_home_team_strength IS NULL THEN
            v_home_team_strength := 10; -- Default value
        END IF;
        
        IF v_away_team_strength IS NULL THEN
            v_away_team_strength := 10; -- Default value
        END IF;
        
        -- Adjust strength to ensure it's positive
        v_home_team_strength := GREATEST(v_home_team_strength, 10);
        v_away_team_strength := GREATEST(v_away_team_strength, 10);
        
        -- Generate match results with weighted randomness based on team strength
        -- Base goals (0-2) plus potential extra based on strength difference
        v_home_goals := floor(random() * 3);
        v_away_goals := floor(random() * 3);
        
        -- Add bonus based on team strength difference
        DECLARE
            v_strength_diff INT := (v_home_team_strength - v_away_team_strength) / 10;
            v_extra_goals INT;
        BEGIN
            IF v_strength_diff > 0 THEN
                -- Home team stronger
                v_extra_goals := floor(random() * LEAST(v_strength_diff, 3));
                v_home_goals := v_home_goals + v_extra_goals;
            ELSIF v_strength_diff < 0 THEN
                -- Away team stronger
                v_extra_goals := floor(random() * LEAST(ABS(v_strength_diff), 3));
                v_away_goals := v_away_goals + v_extra_goals;
            END IF;
        END;
        
        -- Ensure we have a winner (extra time/penalties simulation if needed)
        IF v_home_goals = v_away_goals THEN
            IF random() < (v_home_team_strength * 1.0 / (v_home_team_strength + v_away_team_strength)) THEN
                v_home_goals := v_home_goals + 1;
            ELSE
                v_away_goals := v_away_goals + 1;
            END IF;
        END IF;
        
        -- Determine winner
        v_winner_id := CASE WHEN v_home_goals > v_away_goals THEN v_match.home_team_id ELSE v_match.away_team_id END;
        
        -- Update the match record
        UPDATE fut_jaguar.matches
        SET 
            winner_team_id = v_winner_id,
            status = 'COMPLETADO'
        WHERE id = v_match.id;
        
        -- Create or update team_match_stats for home team
        INSERT INTO fut_jaguar.team_match_stats (
            id, match_id, team_id, goals, goals_against, points
        ) VALUES (
            gen_random_uuid(), 
            v_match.id, 
            v_match.home_team_id, 
            v_home_goals, 
            v_away_goals, 
            CASE WHEN v_home_goals > v_away_goals THEN 3 ELSE 0 END
        )
        ON CONFLICT (match_id, team_id) 
        DO UPDATE SET 
            goals = EXCLUDED.goals,
            goals_against = EXCLUDED.goals_against,
            points = EXCLUDED.points;
        
        -- Create or update team_match_stats for away team
        INSERT INTO fut_jaguar.team_match_stats (
            id, match_id, team_id, goals, goals_against, points
        ) VALUES (
            gen_random_uuid(), 
            v_match.id, 
            v_match.away_team_id, 
            v_away_goals, 
            v_home_goals, 
            CASE WHEN v_away_goals > v_home_goals THEN 3 ELSE 0 END
        )
        ON CONFLICT (match_id, team_id) 
        DO UPDATE SET 
            goals = EXCLUDED.goals,
            goals_against = EXCLUDED.goals_against,
            points = EXCLUDED.points;
        
        -- Update player stats for home team players
        v_goals_left := v_home_goals;
        SELECT COUNT(*) INTO v_player_count
        FROM fut_jaguar.players
        WHERE team_id = v_match.home_team_id;
        
        -- Create player_match_stats records if they don't exist
        INSERT INTO fut_jaguar.player_match_stats (
            id, player_id, match_id, team_id, first_name, jersey_number, 
            goals, yellow_cards, red_cards, attended
        )
        SELECT 
            gen_random_uuid(), 
            p.id, 
            v_match.id, 
            p.team_id, 
            p.first_name, 
            p.jersey_number, 
            0, 0, 0, false
        FROM fut_jaguar.players p
        WHERE p.team_id = v_match.home_team_id
        AND NOT EXISTS (
            SELECT 1 FROM fut_jaguar.player_match_stats pms 
            WHERE pms.player_id = p.id AND pms.match_id = v_match.id
        );
        
        FOR v_player IN 
            SELECT p.id, pms.id as pms_id, p.jersey_number, p.first_name
            FROM fut_jaguar.players p
            JOIN fut_jaguar.player_match_stats pms ON p.id = pms.player_id
            WHERE p.team_id = v_match.home_team_id AND pms.match_id = v_match.id
            ORDER BY random() -- Random order for goal distribution
        LOOP
            -- Random stats for each player
            v_yellow_cards := CASE WHEN random() < 0.15 THEN 1 ELSE 0 END; -- 15% chance
            v_red_cards := CASE WHEN random() < 0.03 THEN 1 ELSE 0 END; -- 3% chance
            v_attended := random() < 0.95; -- 95% attendance rate
            
            -- Distribute goals among players (higher chance for lower jersey numbers)
            v_goals_scored := 0;
            IF v_goals_left > 0 AND random() < (0.3 + (0.5 * (1 - (v_player.jersey_number / 99.0)))) THEN
                v_goals_scored := 1;
                v_goals_left := v_goals_left - 1;
            END IF;
            
            -- Update player match stats (including first_name and jersey_number)
            UPDATE fut_jaguar.player_match_stats
            SET 
                first_name = v_player.first_name,
                jersey_number = v_player.jersey_number,
                goals = v_goals_scored,
                yellow_cards = v_yellow_cards,
                red_cards = v_red_cards,
                attended = v_attended
            WHERE id = v_player.pms_id;
            
            -- Update player career stats if they scored or got cards
            IF v_goals_scored > 0 OR v_yellow_cards > 0 OR v_red_cards > 0 THEN
                INSERT INTO fut_jaguar.player_stats (
                    id, player_id, goals, yellow_cards, red_cards, jersey_number
                )
                VALUES (
                    gen_random_uuid(), 
                    v_player.id, 
                    v_goals_scored, 
                    v_yellow_cards, 
                    v_red_cards,
                    v_player.jersey_number
                )
                ON CONFLICT (player_id) 
                DO UPDATE SET 
                    goals = player_stats.goals + EXCLUDED.goals,
                    yellow_cards = player_stats.yellow_cards + EXCLUDED.yellow_cards,
                    red_cards = player_stats.red_cards + EXCLUDED.red_cards;
            END IF;
        END LOOP;
        
        -- Update player stats for away team players (same logic)
        v_goals_left := v_away_goals;
        SELECT COUNT(*) INTO v_player_count
        FROM fut_jaguar.players
        WHERE team_id = v_match.away_team_id;
        
        -- Create player_match_stats records if they don't exist
        INSERT INTO fut_jaguar.player_match_stats (
            id, player_id, match_id, team_id, first_name, jersey_number, 
            goals, yellow_cards, red_cards, attended
        )
        SELECT 
            gen_random_uuid(), 
            p.id, 
            v_match.id, 
            p.team_id, 
            p.first_name, 
            p.jersey_number, 
            0, 0, 0, false
        FROM fut_jaguar.players p
        WHERE p.team_id = v_match.away_team_id
        AND NOT EXISTS (
            SELECT 1 FROM fut_jaguar.player_match_stats pms 
            WHERE pms.player_id = p.id AND pms.match_id = v_match.id
        );
        
        FOR v_player IN 
            SELECT p.id, pms.id as pms_id, p.jersey_number, p.first_name
            FROM fut_jaguar.players p
            JOIN fut_jaguar.player_match_stats pms ON p.id = pms.player_id
            WHERE p.team_id = v_match.away_team_id AND pms.match_id = v_match.id
            ORDER BY random()
        LOOP
            v_yellow_cards := CASE WHEN random() < 0.15 THEN 1 ELSE 0 END;
            v_red_cards := CASE WHEN random() < 0.03 THEN 1 ELSE 0 END;
            v_attended := random() < 0.95;
            
            v_goals_scored := 0;
            IF v_goals_left > 0 AND random() < (0.3 + (0.5 * (1 - (v_player.jersey_number / 99.0)))) THEN
                v_goals_scored := 1;
                v_goals_left := v_goals_left - 1;
            END IF;
            
            -- Update player match stats (including first_name and jersey_number)
            UPDATE fut_jaguar.player_match_stats
            SET 
                first_name = v_player.first_name,
                jersey_number = v_player.jersey_number,
                goals = v_goals_scored,
                yellow_cards = v_yellow_cards,
                red_cards = v_red_cards,
                attended = v_attended
            WHERE id = v_player.pms_id;
            
            IF v_goals_scored > 0 OR v_yellow_cards > 0 OR v_red_cards > 0 THEN
                INSERT INTO fut_jaguar.player_stats (
                    id, player_id, goals, yellow_cards, red_cards, jersey_number
                )
                VALUES (
                    gen_random_uuid(), 
                    v_player.id, 
                    v_goals_scored, 
                    v_yellow_cards, 
                    v_red_cards,
                    v_player.jersey_number
                )
                ON CONFLICT (player_id) 
                DO UPDATE SET 
                    goals = player_stats.goals + EXCLUDED.goals,
                    yellow_cards = player_stats.yellow_cards + EXCLUDED.yellow_cards,
                    red_cards = player_stats.red_cards + EXCLUDED.red_cards;
            END IF;
        END LOOP;
        
        -- Create team_stats records if they don't exist
        INSERT INTO fut_jaguar.team_stats (
            id, team_id, goals_for, goals_against, matches_played, matches_won, matches_lost, points
        )
        VALUES (
            gen_random_uuid(),
            v_match.home_team_id,
            0, 0, 0, 0, 0, 0
        )
        ON CONFLICT (team_id) DO NOTHING;
        
        INSERT INTO fut_jaguar.team_stats (
            id, team_id, goals_for, goals_against, matches_played, matches_won, matches_lost, points
        )
        VALUES (
            gen_random_uuid(),
            v_match.away_team_id,
            0, 0, 0, 0, 0, 0
        )
        ON CONFLICT (team_id) DO NOTHING;
        
        -- Update team aggregate statistics
        -- Home team
        UPDATE fut_jaguar.team_stats
        SET 
            goals_for = goals_for + v_home_goals,
            goals_against = goals_against + v_away_goals,
            matches_played = matches_played + 1,
            matches_won = matches_won + CASE WHEN v_home_goals > v_away_goals THEN 1 ELSE 0 END,
            matches_lost = matches_lost + CASE WHEN v_home_goals < v_away_goals THEN 1 ELSE 0 END,
            points = points + CASE WHEN v_home_goals > v_away_goals THEN 3 ELSE 0 END
        WHERE team_id = v_match.home_team_id;
        
        -- Away team
        UPDATE fut_jaguar.team_stats
        SET 
            goals_for = goals_for + v_away_goals,
            goals_against = goals_against + v_home_goals,
            matches_played = matches_played + 1,
            matches_won = matches_won + CASE WHEN v_away_goals > v_home_goals THEN 1 ELSE 0 END,
            matches_lost = matches_lost + CASE WHEN v_away_goals < v_home_goals THEN 1 ELSE 0 END,
            points = points + CASE WHEN v_away_goals > v_home_goals THEN 3 ELSE 0 END
        WHERE team_id = v_match.away_team_id;
        
        RAISE NOTICE 'Match result: % % - % %', 
            v_match.home_team_name, v_home_goals, 
            v_away_goals, v_match.away_team_name;
    END LOOP;
    
    -- Mark journey as completed if all its matches are done
    UPDATE fut_jaguar.journeys j
    SET completed = true
    FROM (
        SELECT m.journey_id, COUNT(*) as total_matches,
               SUM(CASE WHEN m.status = 'COMPLETADO' THEN 1 ELSE 0 END) as completed_matches
        FROM fut_jaguar.matches m
        WHERE m.tournament_id = p_tournament_id
        AND (
            (p_division_id IS NULL) OR
            (p_division_id IS NOT NULL AND (
                m.phase = v_division_phase OR
                m.phase LIKE '%' || v_division_name
            ))
        )
        GROUP BY m.journey_id
    ) AS match_counts
    WHERE j.id = match_counts.journey_id
    AND match_counts.total_matches = match_counts.completed_matches;
    
    RAISE NOTICE 'Completed simulating matches for tournament % (division: %)', 
        p_tournament_id, COALESCE(v_division_name, 'ALL');
END;
$$;