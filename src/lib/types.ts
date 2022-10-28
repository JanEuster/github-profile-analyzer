export type AuthData = {
	code: string;
	state: string;
};
export type LoginRes = {
	access_token: string;
	scope: string;
	token_type: string;
};
