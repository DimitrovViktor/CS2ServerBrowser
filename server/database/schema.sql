CREATE TABLE servers (
    id SERIAL PRIMARY KEY,
    ip VARCHAR(45) NOT NULL,
    port INTEGER NOT NULL CHECK (port BETWEEN 1 AND 65535),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    country_code CHAR(2),
    map VARCHAR(50),
    current_players INTEGER DEFAULT 0 CHECK (current_players >= 0),
    max_players INTEGER DEFAULT 24 CHECK (max_players >= 1),
    is_online BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_servers_online ON servers(is_online);
CREATE INDEX idx_servers_country ON servers(country_code);