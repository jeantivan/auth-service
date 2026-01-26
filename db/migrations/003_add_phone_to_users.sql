ALTER TABLE users
ADD COLUMN phone_number VARCHAR(20);

ALTER TABLE users
ADD COLUMN phone_verified BOOLEAN NOT NULL DEFAULT false;

-- Ensure phone numbers are unique when present
CREATE UNIQUE INDEX users_unique_phone_number
ON users(phone_number)
WHERE phone_number IS NOT NULL;
