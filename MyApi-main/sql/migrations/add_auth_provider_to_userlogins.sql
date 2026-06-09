-- Add auth_provider column to UserLogins table
ALTER TABLE UserLogins
ADD COLUMN auth_provider VARCHAR(50) DEFAULT NULL;

-- Update existing records to have 'local' as auth_provider
UPDATE UserLogins
SET auth_provider = 'local'
WHERE auth_provider IS NULL; 