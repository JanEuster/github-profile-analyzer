import type { GraphQlQueryResponseData } from '@octokit/graphql';
import type { AuthenticationStore } from '$lib/types';

export const fetchGraphQL = async (
	auth: AuthenticationStore,
	query: string
): Promise<GraphQlQueryResponseData> => {
	const body = {
		query: query
	};
	return await fetch('https://api.github.com/graphql', {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {
			authorization: 'Bearer ' + auth.token
		}
	}).then((res) => res.json());
};
