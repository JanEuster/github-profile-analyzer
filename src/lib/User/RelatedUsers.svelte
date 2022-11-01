<script lang="ts">
	import type {
		AuthenticationStore,
		RepoResponse,
		ReposResponse,
		UserPreviewResponse,
		UserResponse
	} from '../types';
	import { authStore } from '../../stores';
	import { onMount } from 'svelte';

	export let user: UserResponse;
	let auth: AuthenticationStore;
	let selected = 'following';
	let relatedUsers: UserResponse[] = [];

	let followingUsers: UserResponse[] | false = false;
	let followersUsers: UserResponse[] | false = false;
	let contributorsUsers: UserResponse[] | false = false;

	authStore.subscribe((value) => (auth = value));

	async function getFollowing(): Promise<UserResponse[]> {
		return fetch(`https://api.github.com/users/${user.login}/following`)
			.then((res) => res.json() as Promise<UserPreviewResponse>)
			.then(async (res) => {
				let u = [];
				for (const user of res) {
					let res = await fetch(user.url);
					let json = (await res.json()) as UserResponse;
					u.push(json);
				}
				followingUsers = u;
				return followingUsers;
			});
	}
	async function getFollowers(): Promise<UserResponse[]> {
		return fetch(user.followers_url)
			.then((res) => res.json() as Promise<UserPreviewResponse>)
			.then(async (res) => {
				let u = [];
				for (const user of res) {
					let res = await fetch(user.url);
					let json = (await res.json()) as UserResponse;
					u.push(json);
				}
				followersUsers = u;
				return followersUsers;
			});
	}
	async function getContributors(): Promise<UserResponse[]> {
		return fetch(user.repos_url)
			.then((res) => res.json() as Promise<ReposResponse>)
			.then(async (res) => {
				let u: UserResponse[] = [];
				for (let repoPreview of res) {
					let repoRes = await fetch(
						`https://api.github.com/repos/${repoPreview.owner.login}/${repoPreview.name}`,
						{
							headers: {
								Authorization: 'Bearer ' + auth.token
							}
						}
					);
					let repo = (await repoRes.json()) as RepoResponse;

					let contributorsRes = await fetch(
						`https://api.github.com/repos/${repo.owner.login}/${repo.name}/collaborators`,
						{
							headers: {
								Authorization: 'Bearer ' + auth.token
							}
						}
					);
					let contributors = (await contributorsRes.json()) as UserResponse[];

					for (const contributor of contributors) {
						if (user.id !== contributor.id) {
							u.push(contributor);
						}
					}

					// if repo is forked
					if (repo.fork && repo.parent) {
						let isDup = false;
						for (const uu of u) {
							if (uu.id == repo.parent.owner.id) {
								console.log('dup', uu, repo.parent.owner);
								isDup = true;
							}
						}
						if (!isDup) {
							let ownerRes = await fetch(`https://api.github.com/users/${repo.parent.owner.login}`);
							let owner = (await ownerRes.json()) as UserResponse;
							u.push(owner);
						}
					}
				}
				contributorsUsers = u;
				return contributorsUsers;
			});
	}

	const setRelatedUsers = async () => {
		switch (selected) {
			case 'following':
				relatedUsers = [];
				relatedUsers = followingUsers ? followingUsers : await getFollowing();
				break;
			case 'followers':
				relatedUsers = [];
				relatedUsers = followersUsers ? followersUsers : await getFollowers();
				break;
			case 'co-contributors':
				relatedUsers = [];
				relatedUsers = contributorsUsers ? contributorsUsers : await getContributors();
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
