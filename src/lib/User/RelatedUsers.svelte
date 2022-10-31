<script lang="ts">
	import type { AuthenticationStore, UserResponse } from '../types';
	import { authStore } from '../../stores';
	import { onMount } from 'svelte';

	export let user: UserResponse;
	let auth: AuthenticationStore;
	let selected = 'following';

	authStore.subscribe((value) => (auth = value));

	onMount(() => {});

	const setSelectedCategory = (e: MouseEvent) => {
		const parent = document.getElementById('related-users-categories');
		selected = (e.target as HTMLElement).getAttribute('name') ?? selected;
		// only change the selected element if the target has a name attribute,
		// which it always should have, so basically this outer if is useless
		if (selected) {
			if (parent) {
				for (const child of parent.children) {
					(child as HTMLDataElement).dataset.selected = 'false';
				}
				(e.target as HTMLDataElement).dataset.selected = 'true';
			}
		}
	};
</script>

<div class="related-users box">
	<h3>Related Users</h3>
	<div class="related-users-categories" id="related-users-categories">
		<button on:click={setSelectedCategory} name="following" data-selected="true">Following</button>
		<button on:click={setSelectedCategory} name="followers" data-selected="false">Followers</button>
		<button on:click={setSelectedCategory} name="co-contributors" data-selected="false"
			>Co-Contributors</button
		>
	</div>
</div>

<style lang="scss">
	.related-users {
		width: 231px;
		padding: 7px 9px;
		.related-users-categories {
			margin-top: 6px;
			display: flex;
			flex-wrap: wrap;
			button {
				margin-right: 4px;
				margin-bottom: 4px;
				height: 19px;
				font-size: 11px;
				color: var(--c-text-muted);
				&[data-selected='true'] {
					border-color: var(--c-text-muted);
					color: var(--c-text);
				}
			}
		}
	}
</style>
