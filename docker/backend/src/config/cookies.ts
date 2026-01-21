export const refreshCookieOptions = {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'strict' as const,
	path: '/auth/refresh',
	maxAge: 30 * 24 * 60 * 60
}
