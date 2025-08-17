-- Seed data for Madras Mini Golf local development

-- Insert default admin user (password: admin123)
-- Note: This is a bcrypt hash of 'admin123'
INSERT INTO users (id, username, password_hash) 
VALUES (
  gen_random_uuid(),
  'admin', 
  '$2b$10$8K1p/a0dclxviVBgjEWuu.PJ.ydkNlqWlLB1k/5sYcvhBQ7l.TIoi'
) ON CONFLICT (username) DO NOTHING;

-- Insert default pricing
INSERT INTO pricing (id, weekday_price, weekend_price, updated_by) 
VALUES (
  gen_random_uuid(),
  70.00,
  80.00,
  (SELECT id FROM users WHERE username = 'admin' LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Sample players for testing (optional)
INSERT INTO players (id, name, phone, contact, email) VALUES
  (gen_random_uuid(), 'Test Player 1', '9876543210', '9876543210', 'test1@example.com'),
  (gen_random_uuid(), 'Test Player 2', '9876543211', '9876543211', 'test2@example.com')
ON CONFLICT DO NOTHING;

COMMIT;