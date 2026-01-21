import { PoolClient } from 'pg';

export async function createLocalAuthProvider(
	client: PoolClient,
	userId: string,
	email: string,
	passwordHash: string,
) {
	const result = await client.query(
		`INSERT INTO auth_providers
		(user_id, provider_type, provider_id, password_hash)
		VALUES ($1, 'local', $2, $3)
		RETURNING id, user_id, provider_type, provider_id`,
		[userId, email, passwordHash],
	);
	return result.rows[0];
}

export async function findLocalAuthProvider(
	client: PoolClient,
	email: string
) {
	const result = await client.query(`
		SELECT ap.user_id, ap.password_hash, u.is_active
		FROM auth_providers ap
		JOIN users u ON ap.user_id = u.id
		WHERE ap.provider_type = 'local'
		AND ap.provider_id = $1
	`, [email]);

	return result.rows[0] ?? null;
}
