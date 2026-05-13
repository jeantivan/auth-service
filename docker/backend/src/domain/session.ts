export type SessionResult = {
	id: string,
	userId: string,
	createdAt: Date,
	userAgent: string,
	ipAddress: string,
	expiresAt: Date,
	revokedAt: Date | null
}
