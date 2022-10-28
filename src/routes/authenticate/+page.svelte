<script lang="ts">
	import type { AuthData, LoginRes } from 'src/lib/types';
	import { onMount } from 'svelte';

	export let data: AuthData;
	let loginFailed = false;
	onMount(async () => {
		let storedState = localStorage.getItem('gh-state');
		if (storedState == data.state) {
			let res = await fetch(`/api/login?code=${data.code}`, { method: 'POST' });
			if (res.ok) {
				let json: LoginRes = await res.json();
				console.log(data);
				localStorage.setItem('gh-access-token', json.access_token);
				window.location.href = '/me';
			} else {
				loginFailed = true;
				window.location.href = '/';
			}
		} else {
			loginFailed = true;
			window.location.href = '/';
		}
	});
</script>

{#if data && !loginFailed}
	<h1>Login in Process...</h1>
{:else}
	<h1>Login failed, Redirecting to Home</h1>
{/if}
