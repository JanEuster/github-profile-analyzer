<script lang="ts">
	import Navbar from '$lib/Navbar.svelte';
	import type { AuthenticationStore, UserResponse } from '$lib/types';
	import { authStore } from '../../stores';
	import { onMount } from 'svelte';

	let auth: AuthenticationStore;
	let user: UserResponse | undefined;

	authStore.subscribe((value) => (auth = value));
	onMount(async () => {
		if (auth.valid) {
			let res = await fetch('https://api.github.com/user', {
				headers: {
					Authorization: 'Bearer ' + auth.token
				}
			});
			user = (await res.json()) as UserResponse;
			console.log(user);
		} else {
			window.location.href = '/?redirect_reason=no auth';
		}
	});
</script>

<Navbar {user} />
{#if user}{/if}

<style lang="scss">
</style>
