<script lang="ts">
	import Navbar from '$lib/Navbar.svelte';
	import type { UserResponse } from '$lib/types';

	import { onMount } from 'svelte';

	let token: string | null;
	let user: UserResponse | undefined;

	onMount(async () => {
		token = localStorage.getItem('gh-access-token');
		if (token == null) {
			window.location.href = '/?redirect_reason=no auth';
		}
		let res = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: 'Bearer ' + token
			}
		});
		user = (await res.json()) as UserResponse;
		console.log(user);
	});
</script>

<Navbar {user} />
{#if user}{/if}

<style lang="scss">
</style>
