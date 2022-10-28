import { PUBLIC_GH_ID } from '$env/static/public';
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import type { LoginRes } from 'src/lib/types';

export async function POST({ url }) {
	const code = url.searchParams.get('code');
	const redirect_uri = 'https://github-profile-analyzer.vercel.app/me';
	const requestUrl = `https://github.com/login/oauth/access_token?client_id=${PUBLIC_GH_ID}&client_secret=${env.GH_SECRET}&code=${code}$redirect_uri=${redirect_uri}`;
	const res = await fetch(requestUrl, {
		method: 'POST',
		headers: {
			Accept: 'application/json'
		}
	});
	console.log(res);
	return new Response(JSON.stringify(await res.json()), {
		headers: { 'Content-Type': 'application/json' }
	});
}
