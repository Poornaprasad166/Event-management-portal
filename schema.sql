-- PostgreSQL Schema for Aurelia Events & Production Co. (Project 8: Event Management Portal)
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Corporate Summit',
    event_date DATE NOT NULL,
    venue VARCHAR(255) NOT NULL,
    ticket_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    capacity INTEGER NOT NULL DEFAULT 150,
    organizer_name VARCHAR(255) NOT NULL DEFAULT 'Aurelia Live Productions',
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    company_or_org VARCHAR(255) DEFAULT 'Independent Delegate',
    ticket_tier VARCHAR(50) NOT NULL DEFAULT 'Standard Pass',
    booking_code VARCHAR(32) NOT NULL,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_event_user UNIQUE (event_id, user_email)
);

-- Seed Commercial Event Portfolio
INSERT INTO events (title, category, event_date, venue, ticket_price, capacity, organizer_name, description) VALUES
('Bengaluru Tech & AI Leadership Summit 2026', 'Corporate Summit', '2026-12-08', 'Sheraton Grand Convention Center, Bengaluru', 2499.00, 300, 'Aurelia Live Productions', 'Full-day executive summit featuring keynote panels on enterprise AI, venture capital roundtables, and curated VIP networking lounges.'),
('Echoes & Lights: Live Indie Music & Art Gala', 'Concert & Gala', '2026-12-15', 'Jayamahal Palace Grounds, Bengaluru', 1499.00, 500, 'Aurelia Live Productions', 'Open-air experiential evening with multi-stage live acoustic sets, bespoke culinary pavilions, and interactive projection art.'),
('Founders & D2C Brand Expo 2026', 'Trade Exhibition', '2026-12-22', 'BIEC Hall 4, Tumkur Road, Bengaluru', 999.00, 250, 'Aurelia Live Productions', 'B2B exhibition connecting 80+ emerging consumer brands with retail buyers, supply chain partners, and angel investors.')
ON CONFLICT DO NOTHING;
