-- Up: Create firm_users table and index on onboardingCodes.code
CREATE TABLE IF NOT EXISTS firm_users (
  id SERIAL PRIMARY KEY,
  firm_id INTEGER NOT NULL REFERENCES firms(id),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for onboarding code lookup
CREATE INDEX IF NOT EXISTS idx_onboarding_codes_code ON onboardingCodes(code);

-- Down: Drop firm_users table and index
-- To revert, uncomment below:
-- DROP INDEX IF EXISTS idx_onboarding_codes_code;
-- DROP TABLE IF EXISTS firm_users;
