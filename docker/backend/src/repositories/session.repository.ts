import { PoolClient } from "pg";

export async function createSession(
	client: PoolClient,
	userId: string,
	refreshTokenHash: string,
	userAgent?: string,
	ip?: string
) {
	const result = await client.query(`
		INSERT INTO sessions
		(user_id, refresh_token_hash, user_agent, ip_address, expires_at)
		VALUES ($1, $2, $3, $4, NOW() + INTERVAL '30 days')
		RETURNING id, user_id, created_at, user_agent, ip_address
	`, [userId, refreshTokenHash, userAgent, ip]);

	return result.rows[0] ?? null;
}


export async function findSessionByRefreshTokenHash(
	client: PoolClient,
	refreshTokenHash: string
) {
	const result = await client.query(`
		SELECT * FROM sessions
		WHERE refresh_token_hash = $1
		AND revoked_at IS NULL
	`, [refreshTokenHash]);

	return result.rows[0] ?? null;
}

export async function revokeSession(
	client: PoolClient,
	sessionId: string
) {
	await client.query(`
		UPDATE sessions
		SET revoked_at = NOW()
		WHERE id = $1
	`, [sessionId]);
}

export async function findSessionByRefreshTokenHashAnyState(client: PoolClient, refreshTokenHash: string) {
	const  result = await client.query(`
		SELECT * FROM sessions
		WHERE refresh_token_hash = $1
	`, [refreshTokenHash]);

	return result.rows[0] ?? null;
}

export async function revokeAllUserSessions(
	client: PoolClient,
	userId: string
) {
	await client.query(`
		UPDATE sessions
		SET revoked_at = NOW()
		WHERE user_id = $1
		AND revoked_at IS NULL
	`, [userId]);
}
