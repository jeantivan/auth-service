export type Env = {
	DB_URL: string,
	JWT_SECRET: string,
	JWT_EXP: string,
	REFRESH_TOKEN_EXP: string
	HOST: string
	PORT: number
	COOKIE_SECRET: string
}

export const schema = {
	type: 'object',
	required: [ 'DB_URL', 'JWT_SECRET', 'JWT_EXP', 'REFRESH_TOKEN_EXP', 'HOST', 'PORT', 'COOKIE_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI', 'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET', 'GITHUB_REDIRECT_URI' ],
	properties: {
		DB_URL: { type: 'string' },
		JWT_SECRET: { type: 'string' },
		JWT_EXP: { type: 'string' },
		REFRESH_TOKEN_EXP: { type: 'string' },
		HOST: { type: 'string' },
		PORT: { type: 'string' },
		COOKIE_SECRET: { type: 'string' },
		GOOGLE_CLIENT_ID: { type: 'string' },
		GOOGLE_CLIENT_SECRET: { type: 'string' },
		GOOGLE_REDIRECT_URI: { type: 'string' },
		GITHUB_CLIENT_ID: { type: 'string' },
		GITHUB_CLIENT_SECRET: { type: 'string' },
		GITHUB_REDIRECT_URI: { type: 'string' }
	}
}
