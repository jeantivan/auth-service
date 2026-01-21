
-- Needed for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enum types

-- Authentications providers supported by the system
CREATE TYPE AUTH_PROVIDER as ENUM ('local', 'google', 'github');

-- 2fa types available
CREATE TYPE TWO_FA_METHOD as ENUM('totp', 'email');

-- users table: Represents core identity of a user
CREATE TABLE IF NOT EXISTS users (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	email VARCHAR(255),
	email_verified BOOLEAN NOT NULL DEFAULT false,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW(),
	last_seen_at TIMESTAMP NULL,
	is_active	BOOLEAN NOT NULL DEFAULT true,

	-- Avoid duplicate emails when present
	CONSTRAINT users_unique_email UNIQUE(email)
);


-- auth_providers table: Defines how a user can authenticate
CREATE TABLE IF NOT EXISTS auth_providers (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID REFERENCES users(id) ON DELETE CASCADE,
	provider_type AUTH_PROVIDER NOT NULL,
	provider_id VARCHAR(255) NOT NULL,
	password_hash VARCHAR(255),
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),

	-- A provider identity can belong to only one user
	CONSTRAINT auth_providers_unique_identity UNIQUE (provider_type, provider_id)
);


-- sessions table: Represents active login sessions (multi-device)
CREATE TABLE IF NOT EXISTS sessions (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID REFERENCES users(id) ON DELETE CASCADE,
	refresh_token_hash VARCHAR(255) NOT NULL,
	user_agent VARCHAR(255),
	ip_address INET,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	expires_at TIMESTAMP NOT NULL,
	revoked_at TIMESTAMP
);

-- user_2fa table: To store information about 2 Factor Authentication of user
CREATE TABLE IF NOT EXISTS user_2fa (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID REFERENCES users(id) ON DELETE CASCADE,
	method TWO_FA_METHOD NOT NULL,
	secret VARCHAR(255) NOT NULL,
	enabled_at TIMESTAMP NOT NULL,
	last_used_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_2fa_recovery_codes (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID REFERENCES users(id) ON DELETE CASCADE,
	code_hash VARCHAR(255) NOT NULL,
	used_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_auth_providers_user_id ON auth_providers(user_id);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);

CREATE INDEX idx_sessions_refresh_token_hash ON sessions(refresh_token_hash);

CREATE INDEX idx_user_2fa_user_id ON user_2fa(user_id);

CREATE INDEX idx_user_2fa_recovery_codes_user_id ON user_2fa_recovery_codes(user_id);

-- Triggers for updated_at

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
