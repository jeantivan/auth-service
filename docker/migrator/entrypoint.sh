#!/bin/bash

# 0: Stop script if a command fails
set -e

# 1: Wait for the database
echo "Waiting for database ."

until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t 1; do
	echo -n "."
	sleep 1
done

echo "Database ready!"

# 2: Check DATABASE_URL and access to ./migrations
if [ -z "$DATABASE_URL" ]; then
	echo "Error: DATABASE_URL doesn't exists!"
	exit 1
fi

if [ -d "/migrations" ] && [ "$(ls -A /migrations) 2>/dev/null" ]; then
	echo "Migrations found at '/migrations'"
else
	echo "Error: Can't found migrations"
	exit 1
fi

# 3: Create schema_migrations if doesn't exists
echo "Check 'schema_migrations' table"
psql "$DATABASE_URL" << 'EOF'
CREATE TABLE IF NOT EXISTS schema_migrations (
	version VARCHAR(255) PRIMARY KEY,
	applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
EOF

echo "Table 'schema_migrations' ready."

# 4: Apply migrations
for file in /migrations/*.sql; do
	filename=$(basename "$file")

	exists=$(psql "$DATABASE_URL" -tAc "SELECT 1 FROM schema_migrations WHERE version='$filename'")

	if [ "$exists" != "1" ]; then
		echo "Applying $filename"

		psql "$DATABASE_URL" -X -1 << EOF
		BEGIN;
		\i $file
		INSERT INTO schema_migrations (version) VALUES ('$filename');
		COMMIT;
		EOF

		echo "Ok: $filename applied successfully"
		fi
	else
		echo "Skipping: $filename already applied"
	fi
done

echo "Migrations applied"
exit 0
