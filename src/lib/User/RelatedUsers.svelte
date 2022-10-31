<script lang="ts">
	import type { AuthenticationStore, UserPreviewResponse, UserResponse } from '../types';
	import { authStore } from '../../stores';
	import { onMount } from 'svelte';

	export let user: UserResponse;
	let auth: AuthenticationStore;
	let selected = 'following';
	let relatedUsers: UserResponse[] = [];

	authStore.subscribe((value) => (auth = value));

	const setRelatedUsers = async () => {
		switch (selected) {
			case 'following':
				fetch(`https://api.github.com/users/${user.login}/following`)
					.then((res) => res.json() as Promise<UserPreviewResponse[]>)
					.then(async (res) => {
						let u = [];
						for (const user of res) {
							let res = await fetch(user.url);
							let json = await res.json() as UserResponse;
							console.log(json);
							u.push(json);
						}
						relatedUsers = u;
					});
				break;
			case 'followers':
				fetch(user.followers_url)
					.then((res) => res.json() as Promise<UserPreviewResponse[]>)
					.then(async (res) => {
						let u = [];
						for (const user of res) {
							let res = await fetch(user.url);
							let json = await res.json() as UserResponse;
							console.log(json);
							u.push(json);
						}
						relatedUsers = u;
					});
				break;
			case 'co-contributors':
				break;
		}
	};

	onMount(async () => {
		await setRelatedUsers();
		console.log(relatedUsers);
	});

	const setSelectedCategory = async (e: MouseEvent) => {
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
		await setRelatedUsers();
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
	<div class="related-users-box box-dark">
		{#each relatedUsers as relatedUser}
			<div class="related-user">
				<img class="avatar" src={relatedUser.avatar_url} />
				<div class="login-name">
						<span class="name">{relatedUser.name ?? relatedUser.login}</span>
					{#if relatedUser.name}
						<span class="login">{relatedUser.login}</span>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	.related-users {
		width: 241px;
		display: flex;
		flex-direction: column;
		max-height: 300px;
		position: relative;
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
		.related-users-box {
			margin-top: 7px;
			padding: 13px 11px;
			width: 100%;
			min-height: 100px;
			overflow-y: scroll;
			&::-webkit-scrollbar {
				display: none;
			}

			.related-user {
				margin-bottom: 18px;
				display: flex;
				align-items: center;
				.avatar {
					width: 44px;
					height: 44px;
					border-radius: 22px;
				}
				.login-name {
					margin-left: 7px;
					display: flex;
					flex-direction: column;
					.name {
						padding-top: 1px;
						font-size: 12px;
						line-height: 14px;
						display: block;
					}
					.login {
						font-size: 10px;
						color: var(--c-text-muted);
					}
				}
			}
		}
	}
</style>
