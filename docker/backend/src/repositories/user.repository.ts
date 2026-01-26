import  { PoolClient } from 'pg';

export async function findUserByEmail(
	client: PoolClient,
	email: string,
) {
	const result = await client.query(
		'SELECT id FROM users WHERE email = $1',
		[email],
	);

	return result.rows[0] ?? null;
}

export async function createUser(
	client: PoolClient,
	email: string,
	phoneNumber: string | null
) {
	const result = await client.query(
		'INSERT INTO users (email, phone_number, phone_verified) VALUES ($1, $2, false) RETURNING id, email, phone_number',
		[email, phoneNumber	],
	);
	return result.rows[0];
}
