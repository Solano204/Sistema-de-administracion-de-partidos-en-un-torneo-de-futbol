CREATE OR REPLACE PROCEDURE fut_jaguar.initialize_tournament_roll(
    p_tournament_name VARCHAR(100),
    p_category_name VARCHAR(100),
    p_start_date DATE,
    p_end_date DATE
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_category_id UUID;
    v_tournament_id UUID;
    v_team_count INT;
    v_journey_count INT;
    v_dummy_team_id UUID := gen_random_uuid(); -- For odd team handling
    v_match_rec RECORD;
    v_journey_id UUID;
    v_teams UUID[];
    v_fixtures UUID[][];
    v_round INT;
    v_temp_team_id UUID;
    v_home_idx INT;
    v_away_idx INT;
    v_stats_exists BOOLEAN;
BEGIN
    -- Get category ID
    SELECT id INTO v_category_id FROM fut_jaguar.categories WHERE category_name = p_category_name;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Category % not found', p_category_name;
    END IF;

    -- Create tournament
    INSERT INTO fut_jaguar.tournaments (id, tournament_name, category_id, start_date, end_date, current_phase, status)
    VALUES (
        gen_random_uuid(),
        p_tournament_name,
        v_category_id,
        p_start_date,
        p_end_date,
        'ROUND_ROBIN',
        'ACTIVO'
    )
    RETURNING id INTO v_tournament_id;

    -- Update all active teams in this category to belong to this tournament
    UPDATE fut_jaguar.teams
    SET tournament_id = v_tournament_id
    WHERE category_id = v_category_id AND active = true;

    -- Get active teams for category into an array
    SELECT array_agg(id) INTO v_teams 
    FROM fut_jaguar.teams 
    WHERE category_id = v_category_id AND active = true;
    
    v_team_count := array_length(v_teams, 1);
    
    IF v_team_count < 2 THEN
        RAISE EXCEPTION 'Need at least 2 teams in category %, found %', p_category_name, v_team_count;
    END IF;

    -- Handle odd number of teams by adding a dummy team
    IF v_team_count % 2 != 0 THEN
        INSERT INTO fut_jaguar.teams (id, team_name, category_id, active, tournament_id)
        VALUES (v_dummy_team_id, 'Dummy Team', v_category_id, false, v_tournament_id);
        v_teams := array_append(v_teams, v_dummy_team_id);
        v_team_count := v_team_count + 1;
    END IF;

    -- Calculate number of journeys (N-1 for all cases after dummy team addition)
    v_journey_count := v_team_count - 1;

    -- Create journeys first
    FOR jrn_num IN 1..v_journey_count LOOP
        INSERT INTO fut_jaguar.journeys (id, journey_number, tournament_id, start_date, end_date, completed)
        VALUES (
            gen_random_uuid(),
            jrn_num,
            v_tournament_id,
            p_start_date + (jrn_num - 1) * INTERVAL '7 days',
            p_start_date + (jrn_num - 1) * INTERVAL '7 days' + INTERVAL '2 days',
            false
        );
    END LOOP;

    -- Generate round-robin fixtures using the circle method
    FOR v_round IN 1..v_journey_count LOOP
        -- Get the journey ID for this round
        SELECT id INTO v_journey_id 
        FROM fut_jaguar.journeys 
        WHERE tournament_id = v_tournament_id AND journey_number = v_round;
        
        -- Create matches for this round
        FOR v_home_idx IN 1..(v_team_count/2) LOOP
            v_away_idx := v_team_count - v_home_idx + 1;
            
            -- Skip if either team is the dummy team
            CONTINUE WHEN v_teams[v_home_idx] = v_dummy_team_id OR v_teams[v_away_idx] = v_dummy_team_id;
            
            -- Insert the match with category_id
            INSERT INTO fut_jaguar.matches (id, tournament_id, journey_id, home_team_id, away_team_id, phase, status, category_id)
            VALUES (
                gen_random_uuid(),
                v_tournament_id,
                v_journey_id,
                v_teams[v_home_idx],
                v_teams[v_away_idx],
                'ROUND_ROBIN',
                'PENDIENTE',
                v_category_id
            );
        END LOOP;
        
        -- Rotate all teams except the first one
        v_temp_team_id := v_teams[2];
        FOR i IN 2..(v_team_count-1) LOOP
            v_teams[i] := v_teams[i+1];
        END LOOP;
        v_teams[v_team_count] := v_temp_team_id;
    END LOOP;

    -- Create team_match_stats entries for each match (only if they don't exist)
    FOR v_match_rec IN 
        SELECT id, home_team_id, away_team_id FROM fut_jaguar.matches 
        WHERE tournament_id = v_tournament_id
    LOOP
        -- Check if stats already exist for home team
        SELECT EXISTS (
            SELECT 1 FROM fut_jaguar.team_match_stats 
            WHERE match_id = v_match_rec.id AND team_id = v_match_rec.home_team_id
        ) INTO v_stats_exists;
        
        IF NOT v_stats_exists THEN
            -- Create team match stats for home team
            INSERT INTO fut_jaguar.team_match_stats (id, match_id, team_id, goals, goals_against, points)
            VALUES (gen_random_uuid(), v_match_rec.id, v_match_rec.home_team_id, 0, 0, 0);
        END IF;
        
        -- Check if stats already exist for away team
        SELECT EXISTS (
            SELECT 1 FROM fut_jaguar.team_match_stats 
            WHERE match_id = v_match_rec.id AND team_id = v_match_rec.away_team_id
        ) INTO v_stats_exists;
        
        IF NOT v_stats_exists THEN
            -- Create team match stats for away team
            INSERT INTO fut_jaguar.team_match_stats (id, match_id, team_id, goals, goals_against, points)
            VALUES (gen_random_uuid(), v_match_rec.id, v_match_rec.away_team_id, 0, 0, 0);
        END IF;
    END LOOP;

    -- Create player_match_stats for all players in both teams (only for this category)
    INSERT INTO fut_jaguar.player_match_stats (
        id, first_name, jersey_number, player_id, match_id, team_id, 
        goals, yellow_cards, red_cards, attended
    )
    SELECT 
        gen_random_uuid(),
        p.first_name,
        p.jersey_number,
        p.id,
        m.id,
        p.team_id,
        0,  -- goals
        0,  -- yellow_cards
        0,  -- red_cards
        false  -- attended
    FROM fut_jaguar.matches m
    JOIN fut_jaguar.players p ON p.team_id IN (m.home_team_id, m.away_team_id)
    JOIN fut_jaguar.teams t ON p.team_id = t.id
    WHERE m.tournament_id = v_tournament_id
    AND t.category_id = v_category_id
    AND NOT EXISTS (
        SELECT 1 FROM fut_jaguar.player_match_stats pms
        WHERE pms.player_id = p.id AND pms.match_id = m.id
    );

    -- Cleanup dummy team if used
    IF EXISTS (SELECT 1 FROM fut_jaguar.teams WHERE id = v_dummy_team_id) THEN
        DELETE FROM fut_jaguar.teams WHERE id = v_dummy_team_id;
    END IF;
END;
$$;
CREATE OR REPLACE PROCEDURE fut_jaguar.simulate_round_robin_matches(
    p_tournament_id UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_match RECORD;
    v_home_goals INT;
    v_away_goals INT;
    v_home_points INT;
    v_away_points INT;
    v_player RECORD;
    v_goals_scored INT;
    v_yellow_cards INT;
    v_red_cards INT;
    v_attended BOOLEAN;
    v_winner_id UUID;
BEGIN
    -- Process each pending match in the tournament
    FOR v_match IN 
        SELECT m.id, m.home_team_id, m.away_team_id, j.journey_number
        FROM fut_jaguar.matches m
        JOIN fut_jaguar.journeys j ON m.journey_id = j.id
        WHERE m.tournament_id = p_tournament_id 
        AND m.phase = 'ROUND_ROBIN'
        AND m.status = 'PENDIENTE'
        ORDER BY j.journey_number
    LOOP
        -- Generate random match results (0-5 goals)
        v_home_goals := floor(random() * 6);
        v_away_goals := floor(random() * 6);
        
        -- Determine points (3 for win, 1 for draw, 0 for loss)
        IF v_home_goals > v_away_goals THEN
            v_home_points := 3;
            v_away_points := 0;
            v_winner_id := v_match.home_team_id;
        ELSIF v_home_goals < v_away_goals THEN
            v_home_points := 0;
            v_away_points := 3;
            v_winner_id := v_match.away_team_id;
        ELSE
            v_home_points := 1;
            v_away_points := 1;
            v_winner_id := NULL;
        END IF;
        
        -- Update the match record to mark as completed
        UPDATE fut_jaguar.matches
        SET 
            winner_team_id = v_winner_id,
            status = 'COMPLETADO'
        WHERE id = v_match.id;
        
        -- Update team_match_stats for home team (corrected column name)
        UPDATE fut_jaguar.team_match_stats
        SET 
            goals = v_home_goals,
            goals_against = v_away_goals,
            points = v_home_points
        WHERE match_id = v_match.id AND team_id = v_match.home_team_id;
        
        -- Update team_match_stats for away team (corrected column name)
        UPDATE fut_jaguar.team_match_stats
        SET 
            goals = v_away_goals,
            goals_against = v_home_goals,
            points = v_away_points
        WHERE match_id = v_match.id AND team_id = v_match.away_team_id;
        
        -- Update player stats for home team players
        FOR v_player IN 
            SELECT p.id, pms.id as pms_id
            FROM fut_jaguar.players p
            JOIN fut_jaguar.player_match_stats pms ON p.id = pms.player_id
            WHERE p.team_id = v_match.home_team_id AND pms.match_id = v_match.id
        LOOP
            -- Random stats for each player
            v_goals_scored := CASE WHEN random() < 0.3 THEN 1 ELSE 0 END; -- 30% chance to score
            v_yellow_cards := CASE WHEN random() < 0.15 THEN 1 ELSE 0 END; -- 15% chance
            v_red_cards := CASE WHEN random() < 0.03 THEN 1 ELSE 0 END; -- 3% chance
            v_attended := random() < 0.95; -- 95% attendance rate
            
            -- Limit goals to team's total
            IF v_goals_scored > v_home_goals THEN
                v_goals_scored := v_home_goals;
            END IF;
            
            -- Update player match stats
            UPDATE fut_jaguar.player_match_stats
            SET 
                goals = v_goals_scored,
                yellow_cards = v_yellow_cards,
                red_cards = v_red_cards,
                attended = v_attended
            WHERE id = v_player.pms_id;
            
            -- Update player career stats if they scored
            IF v_goals_scored > 0 THEN
                INSERT INTO fut_jaguar.player_stats (id, player_id, goals, yellow_cards, red_cards)
                VALUES (gen_random_uuid(), v_player.id, v_goals_scored, 0, 0)
                ON CONFLICT (player_id) 
                DO UPDATE SET goals = player_stats.goals + v_goals_scored;
            END IF;
            
            -- Update cards in player stats
            IF v_yellow_cards > 0 OR v_red_cards > 0 THEN
                INSERT INTO fut_jaguar.player_stats (id, player_id, goals, yellow_cards, red_cards)
                VALUES (gen_random_uuid(), v_player.id, 0, v_yellow_cards, v_red_cards)
                ON CONFLICT (player_id) 
                DO UPDATE SET 
                    yellow_cards = player_stats.yellow_cards + v_yellow_cards,
                    red_cards = player_stats.red_cards + v_red_cards;
            END IF;
        END LOOP;
        
        -- Update player stats for away team players (same logic)
        FOR v_player IN 
            SELECT p.id, pms.id as pms_id
            FROM fut_jaguar.players p
            JOIN fut_jaguar.player_match_stats pms ON p.id = pms.player_id
            WHERE p.team_id = v_match.away_team_id AND pms.match_id = v_match.id
        LOOP
            v_goals_scored := CASE WHEN random() < 0.3 THEN 1 ELSE 0 END;
            v_yellow_cards := CASE WHEN random() < 0.15 THEN 1 ELSE 0 END;
            v_red_cards := CASE WHEN random() < 0.03 THEN 1 ELSE 0 END;
            v_attended := random() < 0.95;
            
            IF v_goals_scored > v_away_goals THEN
                v_goals_scored := v_away_goals;
            END IF;
            
            UPDATE fut_jaguar.player_match_stats
            SET 
                goals = v_goals_scored,
                yellow_cards = v_yellow_cards,
                red_cards = v_red_cards,
                attended = v_attended
            WHERE id = v_player.pms_id;
            
            IF v_goals_scored > 0 THEN
                INSERT INTO fut_jaguar.player_stats (id, player_id, goals, yellow_cards, red_cards)
                VALUES (gen_random_uuid(), v_player.id, v_goals_scored, 0, 0)
                ON CONFLICT (player_id) 
                DO UPDATE SET goals = player_stats.goals + v_goals_scored;
            END IF;
            
            IF v_yellow_cards > 0 OR v_red_cards > 0 THEN
                INSERT INTO fut_jaguar.player_stats (id, player_id, goals, yellow_cards, red_cards)
                VALUES (gen_random_uuid(), v_player.id, 0, v_yellow_cards, v_red_cards)
                ON CONFLICT (player_id) 
                DO UPDATE SET 
                    yellow_cards = player_stats.yellow_cards + v_yellow_cards,
                    red_cards = player_stats.red_cards + v_red_cards;
            END IF;
        END LOOP;
        
        -- Mark journey as completed if all its matches are done
        UPDATE fut_jaguar.journeys j
        SET completed = true
        FROM (
            SELECT journey_id, COUNT(*) as total_matches,
                   SUM(CASE WHEN status = 'COMPLETADO' THEN 1 ELSE 0 END) as completed_matches
            FROM fut_jaguar.matches
            WHERE tournament_id = p_tournament_id
            GROUP BY journey_id
        ) AS match_counts
        WHERE j.id = match_counts.journey_id
        AND match_counts.total_matches = match_counts.completed_matches;
    END LOOP;
    
    -- Update team statistics (corrected column name in this query too)
    INSERT INTO fut_jaguar.team_stats (
        id, team_id, goals_for, goals_against, matches_played, 
        matches_won, matches_drawn, matches_lost, points
    )
    SELECT 
        gen_random_uuid(),
        t.id,
        COALESCE(SUM(tms.goals), 0),
        COALESCE(SUM(tms.goals_against), 0),
        COUNT(tms.id),
        SUM(CASE WHEN tms.points = 3 THEN 1 ELSE 0 END),
        SUM(CASE WHEN tms.points = 1 THEN 1 ELSE 0 END),
        SUM(CASE WHEN tms.points = 0 AND tms.goals IS NOT NULL THEN 1 ELSE 0 END),
        COALESCE(SUM(tms.points), 0)
    FROM fut_jaguar.teams t
    LEFT JOIN fut_jaguar.team_match_stats tms ON t.id = tms.team_id
    LEFT JOIN fut_jaguar.matches m ON tms.match_id = m.id AND m.tournament_id = p_tournament_id
    WHERE t.id IN (
        SELECT team_id FROM fut_jaguar.team_match_stats tms
        JOIN fut_jaguar.matches m ON tms.match_id = m.id
        WHERE m.tournament_id = p_tournament_id
    )
    GROUP BY t.id
    ON CONFLICT (team_id) 
    DO UPDATE SET
        goals_for = EXCLUDED.goals_for,
        goals_against = EXCLUDED.goals_against,
        matches_played = EXCLUDED.matches_played,
        matches_won = EXCLUDED.matches_won,
        matches_drawn = EXCLUDED.matches_drawn,
        matches_lost = EXCLUDED.matches_lost,
        points = EXCLUDED.points;
END;
$$;






