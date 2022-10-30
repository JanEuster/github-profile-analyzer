import type { Endpoints } from '@octokit/types';
// github api types
export type UserResponse = Endpoints['GET /user']['response']['data'];

export type AuthData = {
	code: string;
	state: string;
};
export type LoginRes = {
	access_token: string;
	scope: string;
	token_type: string;
};
