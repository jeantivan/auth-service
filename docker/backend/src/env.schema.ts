export type Env = {
	DB_URL: string,
	JWT_SECRET: string,
	JWT_EXP: string,
	REFRESH_TOKEN_EXP: string
	HOST: string
	PORT: number
}

export const schema = {
	type: 'object',
	required: [ 'DB_URL', 'JWT_SECRET', 'JWT_EXP', 'REFRESH_TOKEN_EXP', 'HOST', 'PORT' ],
	properties: {
		DB_URL: { type: 'string' },
		JWT_SECRET: { type: 'string' },
		JWT_EXP: { type: 'string' },
		REFRESH_TOKEN_EXP: { type: 'string' },
		HOST: { type: 'string' },
		PORT: { type: 'string' }
	}
}
