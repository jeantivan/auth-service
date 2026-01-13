#!/bin/bash

set -e

echo "Starting backend..."

if [ -n "$DB_HOST" ]; then
	echo "Waiting for database..."
	until nc -z "$DB_HOST" "$DB_PORT"; do
		sleep 1;
	done
	echo "Database ready!"
fi

if [ "$NODE_ENV" = "development" ]; then
	echo "Running in development mode"
	exec npx ts-node-dev --respawn --transpile-only src/index.ts
else
	echo "Running in production mode"
	exec node dist/index.js
fi

exec "$@"
