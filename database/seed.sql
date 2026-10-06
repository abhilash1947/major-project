-- Seed data for Railway DSS (Total South Indian Network)

-- Clear existing data
TRUNCATE trains, track_segments CASCADE;

-- Insert real track segments
INSERT INTO track_segments (segment_id, start_km, end_km, max_capacity, speed_limit)
VALUES 
('MAS-SBC', 0, 350, 20, 130),
('SBC-UBL', 350, 750, 20, 110),
('UBL-MAO', 750, 900, 20, 80),

('MAS-BZA', 900, 1350, 20, 130),
('BZA-SC', 1350, 1630, 20, 130),
('SC-SBC', 1630, 2200, 20, 110),

('MAS-TPJ', 2200, 2530, 20, 110),
('TPJ-MDU', 2530, 2660, 20, 110),
('MDU-TVC', 2660, 2960, 20, 110),

('SBC-CBE', 2960, 3340, 20, 110),
('CBE-ERS', 3340, 3540, 20, 110),
('ERS-TVC', 3540, 3760, 20, 110),

('SBC-MAQ', 3760, 4110, 20, 90);

-- Insert initial South Indian trains
INSERT INTO trains (train_id, position, speed, destination, priority, status)
VALUES 
('VANDE_BHARAT_20607', 100, 120, 'Network Patrolling', 'high', 'active'),
('EXPRESS_16535', 500, 90, 'Network Patrolling', 'normal', 'active'),
('MAIL_12759', 1100, 110, 'Network Patrolling', 'high', 'active'),
('EXPRESS_12637', 2300, 100, 'Network Patrolling', 'high', 'active'),
('MAIL_12625', 3400, 105, 'Network Patrolling', 'normal', 'active'),
('PASSENGER_16345', 3800, 80, 'Network Patrolling', 'normal', 'active'),
('GOODS_WAG9_41002', 1500, 50, 'Network Patrolling', 'low', 'active'),
('SHATABDI_12007', 2000, 110, 'Network Patrolling', 'high', 'active');
