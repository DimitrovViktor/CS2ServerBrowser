-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    two_factor_phone VARCHAR(20),
    two_factor_backup_code VARCHAR(255),
    permission_type VARCHAR(10) DEFAULT 'user' CHECK (permission_type IN ('user', 'staff', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT
);

-- Servers Table
CREATE TABLE servers (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ip VARCHAR(45) NOT NULL,
    port INTEGER NOT NULL CHECK (port BETWEEN 1 AND 65535),
    query_port INTEGER CHECK (query_port BETWEEN 1 AND 65535),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    country_code CHAR(2),
    game VARCHAR(10) NOT NULL CHECK (game IN ('CSGO', 'CS2')),
    prime VARCHAR(3) NOT NULL CHECK (prime IN ('Yes', 'No')),  
    current_map VARCHAR(50),
    game_mode VARCHAR(50),
    current_players INTEGER DEFAULT 0 CHECK (current_players >= 0),
    max_players INTEGER DEFAULT 24 CHECK (max_players >= 1),
    status VARCHAR(12) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'maintenance')),
    icon_url TEXT,           
    banner_url TEXT,        
    rank INTEGER DEFAULT 0,
    premium_type VARCHAR(10) DEFAULT 'NONE' CHECK (premium_type IN ('NONE', 'VIP', 'BOOST', 'PRO')),
    likes INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    website_url VARCHAR(255),
    discord_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_queried TIMESTAMP
);

-- Tags Table
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Server Tags Junction Table
CREATE TABLE server_tags (
    server_id INTEGER REFERENCES servers(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (server_id, tag_id)
);

-- Favorites Table
CREATE TABLE user_favorites (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    server_id INTEGER REFERENCES servers(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, server_id)
);

-- Server Statistics Table
CREATE TABLE server_statistics (
    id SERIAL PRIMARY KEY,
    server_id INTEGER REFERENCES servers(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    player_count INTEGER DEFAULT 0,
    map VARCHAR(50),
    response_time INTEGER
);

-- Likes Table
CREATE TABLE server_likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    server_id INTEGER REFERENCES servers(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, server_id)
);

-- Reports Table
CREATE TABLE server_reports (
    id SERIAL PRIMARY KEY,
    server_id INTEGER REFERENCES servers(id) ON DELETE CASCADE,
    reporting_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP
);

-- Audit Log Table
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_users_username ON users(LOWER(username));
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_permission ON users(permission_type);

CREATE INDEX idx_servers_ip_port ON servers(ip, port);
CREATE INDEX idx_servers_status ON servers(status);
CREATE INDEX idx_servers_rank ON servers(rank);
CREATE INDEX idx_servers_premium ON servers(premium_type);
CREATE INDEX idx_servers_owner ON servers(owner_id);
CREATE INDEX idx_servers_country ON servers(country_code);

CREATE INDEX idx_tags_name ON tags(name);

CREATE INDEX idx_server_tags_server ON server_tags(server_id);
CREATE INDEX idx_server_tags_tag ON server_tags(tag_id);

CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_server ON user_favorites(server_id);

CREATE INDEX idx_server_stats_server ON server_statistics(server_id);
CREATE INDEX idx_server_stats_timestamp ON server_statistics(timestamp);

CREATE INDEX idx_server_reports_server ON server_reports(server_id);
CREATE INDEX idx_server_reports_user ON server_reports(reporting_user_id);
CREATE INDEX idx_server_reports_status ON server_reports(status);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_record ON audit_log(record_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);

-- Sample Data Insertion
INSERT INTO users (username, email, password_hash) VALUES
  ('testuser1', 't2est@example.com', 'has3hedpassword');

-- Add tags
INSERT INTO tags (name, description) VALUES
  ('Deathmatch', 'Classic DM mode'),
  ('Retake', 'Retake mode'),
  ('5v5', 'Competitive 5v5'),
  ('Surf', 'Surf maps'),
  ('Bhop', 'Bunny hop maps'),
  ('premium', 'Premium server');

-- Add servers
INSERT INTO servers (owner_id, ip, port, name, description, country_code, game, prime, current_map, game_mode, current_players, max_players, status)
VALUES
  (1, '202.181.188.156', 27016, 'CS2 Deathmatch serv', 'Official DM server', 'US', 'CS2', 'Yes', 'de_nuke', 'Deathmatch', 10, 10, 'online'),
  (1, '202.181.188.157', 27017, 'Retake Pro', 'Retake mode server', 'GB', 'CS2', 'No', 'de_mirage', 'Retake', 10, 10, 'online'),
  (1, '202.181.188.158', 27018, '5v5 Arena', 'Competitive 5v5 server', 'DE', 'CSGO', 'Yes', 'de_inferno', '5v5', 10, 10, 'online'),
  (1, '202.181.188.159', 27019, 'Surf Paradise', 'Surf maps server', 'FR', 'CSGO', 'No', 'surf_ski_2', 'Surf', 10, 10, 'online'),
  (1, '202.181.188.160', 27020, 'Bhop Legends', 'Bunny hop server', 'RU', 'CSGO', 'Yes', 'bhop_eazy', 'Bhop', 10, 10, 'online');

-- Link servers to tags
INSERT INTO server_tags (server_id, tag_id) VALUES
  (1, 1), -- Deathmatch
  (1, 6), -- premium
  (2, 2), -- Retake
  (3, 3), -- 5v5
  (4, 4), -- Surf
  (5, 5); -- Bhop