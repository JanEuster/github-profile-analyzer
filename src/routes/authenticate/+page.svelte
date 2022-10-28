<script lang="ts">
	import type { AuthData, LoginRes } from 'src/lib/types';
	import { onMount } from 'svelte';

	export let data: AuthData;
	let loginFailed = false;
	onMount(async () => {
		let storedState = localStorage.getItem('gh-state');
		if (storedState == data.state) {
			let res = await fetch(`/api/login?code=7ee1dd9037de53ae07c7`, { method: 'POST' });
			let json = await res.json();
			if (res.ok && json.access_token) {
				localStorage.setItem('gh-access-token', json.access_token);
				window.location.href = '/me';
			} else {
				loginFailed = true;
				// window.location.href = '/';
			}
		} else {
			loginFailed = true;
			// window.location.href = '/';
		}
	});
</script>

{#if data && !loginFailed}
	<h1>Login in Process...</h1>
{:else}
	<h1>Login failed, Redirecting to Home</h1>
{/if}
