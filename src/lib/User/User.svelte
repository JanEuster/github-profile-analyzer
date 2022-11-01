<script lang="ts">
	import type { AuthenticationStore, UserResponse } from '../types';
	import { authStore } from '../../stores';
	import { onMount } from 'svelte';
	import RelatedUsers from './RelatedUsers.svelte';
import UserRepoActivity from './UserRepoActivity.svelte';

	export let user: UserResponse;
	let auth: AuthenticationStore;

	authStore.subscribe((value) => (auth = value));

	onMount(() => {});
</script>

<main class="user">
	<div class="user-inner">
		<div class="row">
			<RelatedUsers {user} />
			<UserRepoActivity />
		</div>
	</div>
</main>

<style lang="scss">
	.user {
		width: 100vw;
		padding: 17px 13px;
		.user-inner {
			.row {
				min-height: 500px;
				display: flex;
				gap: 18px;
				flex-direction: row;
			}
		}
	}
</style>
