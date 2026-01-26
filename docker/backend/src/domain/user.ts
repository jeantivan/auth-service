export type RegisterInput = {
	email: string,
	password: string,
	phoneNumber: string | null
}

export type RegisteredUser = {
	id: string,
	email: string,
	phoneNumber: string | null
}
