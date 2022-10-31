<script lang="ts">
	import Navbar from '$lib/Navbar.svelte';
	import type { AuthenticationStore, UserResponse } from '$lib/types';
	import { authStore } from '../../stores';
	import { onMount } from 'svelte';
	import User from '$lib/User/User.svelte';

	let auth: AuthenticationStore;
	let user: UserResponse | undefined;

	authStore.subscribe((value) => (auth = value));
	onMount(async () => {
		if (auth.valid) {
			if (auth.iat + 60 > new Date().getSeconds()) {
				// use stored value for own user if its not too old
				user = auth.me;
			} else {
				let res = await fetch('https://api.github.com/user', {
					headers: {
						Authorization: 'Bearer ' + auth.token
					}
				});
				let user = (await res.json()) as UserResponse;

				// update old me to current data
				authStore.update((value) => {
					value.me = user;
					value.iat = new Date().getSeconds();
					return value;
				});
			}
		} else {
			window.location.href = '/?redirect_reason=no auth';
		}
	});
</script>

<Navbar {user} />
{#if user}
	<User {user}/>
{/if}

<style lang="scss">
</style>
