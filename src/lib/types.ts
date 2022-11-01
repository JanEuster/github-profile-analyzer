import type { Endpoints } from '@octokit/types';
// github api types
export type UserResponse = Endpoints['GET /user']['response']['data'];
export type UserPreviewResponse = Endpoints['GET /user/following']['response']['data'];
export type RepoResponse = Endpoints['GET /repos/{owner}/{repo}']['response']['data'];
export type ReposResponse = Endpoints['GET /user/repos']['response']['data'];

export type AuthData = {
	code: string;
	state: string;
};
export type LoginRes = {
	access_token: string;
	scope: string;
	token_type: string;
};

export type AuthenticationStore = {
	valid: boolean;
	token: string;
	me: UserResponse;
	iat: number;
};
