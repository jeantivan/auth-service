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

# 2: Check DB_URL and access to ./migrations
if [ -z "$DB_URL" ]; then
	echo "Error: DB_URL doesn't exists!"
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
psql "$DB_URL" << 'EOF'
CREATE TABLE IF NOT EXISTS schema_migrations (
	version VARCHAR(255) PRIMARY KEY,
	applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
EOF

echo "Table 'schema_migrations' ready."

# 4: Apply migrations
for file in /migrations/*.sql; do
	filename=$(basename "$file")

	exists=$(psql "$DB_URL" -tAc "SELECT 1 FROM schema_migrations WHERE version='$filename'")

	if [ "$exists" != "1" ]; then
		echo "Applying $filename"

		psql "$DB_URL" -v ON_ERROR_STOP=1 -X -1 -f "$file" -c "INSERT INTO schema_migrations (version) VALUES ('$filename');"

		if [ $? -eq 0 ]; then
            echo "Ok: $filename applied successfully"
        else
            echo "Error: Failed to apply $filename"
            exit 1
        fi
	else
		echo "Skipping: $filename already applied"
	fi
done

echo "Migrations applied"
echo "Verificando tablas actuales en la base de datos:"
psql "$DB_URL" -c "\dt"

exit 0
