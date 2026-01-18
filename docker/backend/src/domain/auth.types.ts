export type LoginInput = {
	email: string;
	password: string;
}

export type LoginResult = {
	accessToken: string;
	refreshToken: string;
}
