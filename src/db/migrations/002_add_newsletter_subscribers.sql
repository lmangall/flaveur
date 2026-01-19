-- Newsletter Subscribers Table
-- Stores email subscriptions with confirmation tracking

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  confirmation_token UUID DEFAULT gen_random_uuid(),
  source VARCHAR(50), -- 'homepage', 'about', 'footer'
  locale VARCHAR(5) DEFAULT 'fr'
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_token ON newsletter_subscribers(confirmation_token);
