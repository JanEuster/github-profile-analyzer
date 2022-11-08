import type { Endpoints } from '@octokit/types';
// github api types
export type UserResponse = Endpoints['GET /user']['response']['data'];
export type UserPreviewResponse = Endpoints['GET /user/following']['response']['data'];
export type RepoResponse = Endpoints['GET /repos/{owner}/{repo}']['response']['data'];
export type ReposResponse = Endpoints['GET /user/repos']['response']['data'];
export type CommitsResponse = Endpoints['GET /repos/{owner}/{repo}/commits']['response']['data'];

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

export type ContributionsYearTotal = {
	year: number;
	total: number;
};
export type ContributionsOfType = {
	total: number;
	years: ContributionsYearTotal[];
};
export type ContributionDay = {
	color: string;
	date: string;
	weekday: number;
	contributionCount: number;
};
export type ContributionWeek = {
	firstDay: string;
	contributionDays: ContributionDay[];
};

export type ContributionTotals = {
	total: number;
	commits: ContributionsOfType;
	issues: ContributionsOfType;
	pullRequests: ContributionsOfType;
	pullRequestReviews: ContributionsOfType;
	repos: ContributionsOfType;
};
export type RepositoryTotals = {
	commits: number;
	issues: number;
	pullRequests: number;
	watchers: number;
	stars: number;
};

export type ContributionRepo = {
	userTotal: number;
	userCommitsTotal: number;
	totals: RepositoryTotals | undefined;
	name: string;
	nameWithOwner: string;
	owner: string;
	description: string;
	forkCount: number;
	isForked: boolean;
	isPrivate: boolean;
	isArchived: boolean;
	homepage: string;
	lastUpdated: Date;
	url: string;
};

export type ContributionData = {
	totals: ContributionTotals;
	weeks: ContributionWeek[];
	repositories: ContributionRepo[];
};
