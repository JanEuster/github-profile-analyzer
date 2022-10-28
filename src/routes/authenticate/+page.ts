import type { AuthData } from 'src/lib/types';

export async function load({ url }): Promise<AuthData> {
	const state = url.searchParams.get('state');
	const code = url.searchParams.get('code');
	return { state, code } as AuthData;
}
