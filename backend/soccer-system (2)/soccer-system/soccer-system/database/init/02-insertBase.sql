-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Insert users (4 admin, 4 regular users, 2 referees)
-- Using a simpler password hashing method since gen_salt() isn't available
INSERT INTO fut_jaguar.users (first_name, last_name, username, password_hash, age, birth_date, user_role)
VALUES 
-- Regular users
('User', 'One', 'user1', md5('password123'), 25, CURRENT_DATE - INTERVAL '25 years', 'JUGADOR'),
('User', 'Two', 'user2', md5('password123'), 26, CURRENT_DATE - INTERVAL '26 years', 'JUGADOR'),
('User', 'Three', 'user3', md5('password123'), 27, CURRENT_DATE - INTERVAL '27 years', 'JUGADOR'),
('User', 'Four', 'user4', md5('password123'), 28, CURRENT_DATE - INTERVAL '28 years', 'JUGADOR'),

-- Referees
('Referee', 'One', 'ref1', md5('password123'), 30, CURRENT_DATE - INTERVAL '30 years', 'ARBITRO'),
('Referee', 'Two', 'ref2', md5('password123'), 32, CURRENT_DATE - INTERVAL '32 years', 'ARBITRO');




-- 2. Insert categories (3 categories)
INSERT INTO fut_jaguar.categories (category_name, min_age, max_age)
VALUES 
('Sub-10', 8, 10),
('Sub-12', 10, 12),
('Sub-15', 13, 15);
select * from fut_jaguar.teams;
-- 3. Insert teams (20 teams per category)
DO $$
DECLARE
    cat RECORD;
    current_team_id UUID;
    team_counter INT;
BEGIN
    FOR cat IN SELECT id, category_name FROM fut_jaguar.categories
    LOOP
        -- Insert 20 teams for this category
        FOR team_counter IN 1..20 LOOP
            INSERT INTO fut_jaguar.teams (
                team_name, 
                category_id, 
                logo_url,
                number_of_players,
                active
            )
            VALUES (
                'Equipo ' || cat.category_name || ' ' || team_counter,
                cat.id,
                'https://example.com/logo' || team_counter || '.png',
                15, -- Will be updated when players are inserted
                true
            )
            RETURNING id INTO current_team_id;
            
            -- Insert team stats
            INSERT INTO fut_jaguar.team_stats (team_id)
            VALUES (current_team_id);
            
            -- Insert 15 players per team
            FOR j IN 1..15 LOOP
                INSERT INTO fut_jaguar.players (
                    first_name,
                    last_name,
                    age,
                    jersey_number,
                    team_id,
                    photo_url,
                    birth_date,
                    player_status,
                    captain,
                    email
                )
                VALUES (
                    'Jugador ' || j,
                    'Apellido ' || j || ' ' || team_counter,
                    CASE 
                        WHEN cat.category_name = 'Sub-10' THEN 8 + (j % 3)
                        WHEN cat.category_name = 'Sub-12' THEN 10 + (j % 3)
                        ELSE 13 + (j % 3)
                    END,
                    j,
                    current_team_id,
                    'https://example.com/player' || j || '.jpg',
                    CURRENT_DATE - (INTERVAL '1 year' * (CASE 
                        WHEN cat.category_name = 'Sub-10' THEN 8 + (j % 3)
                        WHEN cat.category_name = 'Sub-12' THEN 10 + (j % 3)
                        ELSE 13 + (j % 3)
                    END)),
                    CASE WHEN random() < 0.1 THEN 'LESIONADO' ELSE 'ACTIVO' END,
                    j = 1, -- First player is captain
                    'player' || j || '_' || team_counter || '@example.com'
                );
                
                -- Insert player stats
                INSERT INTO fut_jaguar.player_stats (player_id)
                SELECT id FROM fut_jaguar.players 
                WHERE team_id = current_team_id AND jersey_number = j;
                
                -- Insert 2 debts per player
                FOR k IN 1..2 LOOP
                    INSERT INTO fut_jaguar.player_debts (
                        player_id,
                        status,
                        amount,
                        currency,
                        description,
                        due_date,
                        paid_date
                    )
                    SELECT 
                        id,
                        CASE 
                            WHEN k = 1 THEN 'PENDIENTE'
                            ELSE 'PAGADO'
                        END,
                        (50 + (random() * 150))::numeric(10,2),
                        CASE 
                            WHEN random() < 0.5 THEN 'USD' 
                            ELSE 'MXN' 
                        END,
                        'Deuda ' || k || ' para uniforme',
                        CURRENT_DATE + (k * INTERVAL '30 days'),
                        CASE 
                            WHEN k = 2 THEN CURRENT_DATE + (k * INTERVAL '15 days')
                            ELSE NULL 
                        END
                    FROM fut_jaguar.players 
                    WHERE team_id = current_team_id AND jersey_number = j;
                END LOOP;
            END LOOP;
            
            -- Update team player count
            UPDATE fut_jaguar.teams 
            SET number_of_players = 15 
            WHERE id = current_team_id;
            
            -- Insert 2 debts per team
            FOR k IN 1..2 LOOP
                INSERT INTO fut_jaguar.team_debts (
                    team_id,
                    status,
                    amount,
                    currency,
                    description,
                    due_date,
                    paid_date
                )
                VALUES (
                    current_team_id,
                    CASE 
                        WHEN k = 1 THEN 'PENDIENTE'
                        ELSE 'PAGADO'
                    END,
                    (200 + (random() * 800))::numeric(10,2),
                    CASE 
                        WHEN random() < 0.5 THEN 'USD' 
                        ELSE 'MXN' 
                    END,
                    'Deuda ' || k || ' para inscripción',
                    CURRENT_DATE + (k * INTERVAL '30 days'),
                    CASE 
                        WHEN k = 2 THEN CURRENT_DATE + (k * INTERVAL '15 days')
                        ELSE NULL 
                    END
                );
            END LOOP;
        END LOOP;
    END LOOP;
END $$;


