export type Env = {
	DB_URL: string,
	JWT_SECRET: string,
	JWT_EXP: string,
	REFRESH_TOKEN_EXP: string
	BACKEND_HOST: string
	BACKEND_PORT: number
}

export const schema = {
	type: 'object',
	required: [ 'DB_URL', 'JWT_SECRET', 'JWT_EXP', 'REFRESH_TOKEN_EXP', 'BACKEND_HOST', 'BACKEND_PORT' ],
	properties: {
		DB_URL: { type: 'string' },
		JWT_SECRET: { type: 'string' },
		JWT_EXP: { type: 'string' },
		REFRESH_TOKEN_EXP: { type: 'string' },
		BACKEND_HOST: { type: 'string' },
		BACKEND_PORT: { type: 'string' }
	}
}
