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
