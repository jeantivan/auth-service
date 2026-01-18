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
