<script lang="ts">
	import { onMount } from 'svelte';
	import type { Endpoints } from '@octokit/types';
	type UserResponse = Endpoints['GET /user']['response']['data'];

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

{#if user}
	<nav class="navbar">
		<div class="global-navigation">
			<div class="row">
				<button class="square home-button"><i class="ph-house ph-xl" /></button>
				<div class="search-bar">
					<input />
					<i class="ph-magnifying-glass ph-sm" />
				</div>
			</div>
			<span class="bread-crums">
				Users > {user.login}
			</span>
		</div>
		<div class="user-info">
			<img class="profile-picture" src={user.avatar_url} />
			<div class="info">
				<h2>{user.login}</h2>
				<h3>{user.name}</h3>
				<div class="more">
					<span><i class="ph-link-simple" /><a href={user.blog}>{user.blog}</a></span>
					<span><i class="ph-at" /><a href={'mailto:' + user.email}>{user.email}</a></span>
					<span><i class="ph-push-pin" />{user.location}</span>
					<span
						><i class="ph-buildings" />
						{#if user.company}
							<span><i class="ph-house"><a href={user.company}>{user.company}</a></i></span>
						{:else}
							No Company
						{/if}
					</span>
					<span
						><i class="ph-twitter-logo" />
						{#if user.twitter_username}
							<a href={user.twitter_username}>{user.twitter_username}</a>
						{:else}
							No Twitter Handle
						{/if}
					</span>
				</div>
			</div>
			<div class="bio">
				{user.bio ?? 'no bio'}
			</div>
		</div>
	</nav>
{/if}

<style lang="scss">
	.navbar {
		width: 100vw;
		border-bottom: var(--border-thick);
		display: flex;
	}
	.global-navigation {
		margin: 9px 13px;
		margin-right: 0;
		width: 261px;
		border-right: var(--border-thin);

		.row {
			display: flex;
			align-items: center;
		}

		.home-button {
			width: 38px;
		}
		.search-bar {
			margin: 5px 16px;
			position: relative;
			width: 200px;
			height: 25px;
			color: var(--text-muted);
			input {
				width: 100%;
				height: 100%;
			}
			input:focus ~ i {
				opacity: 15%;
			}
			i {
				position: absolute;
				top: 50%;
				right: 5px;
				transform: translateY(-50%);
				color: var(--text-muted);
				&::before {
					color: var(--text-muted);
				}
			}
		}
		.bread-crums {
			color: var(--c-text-muted);
			font-size: 12px;
			line-height: 22px;
			margin-top: 8px;
		}
	}
	.user-info {
		margin: 10px 0;
		display: flex;
		justify-content: flex-start;
		.profile-picture {
			width: 139px;
			height: 139px;
			margin: auto;
			padding-left: 18px;
			padding-right: 11px;
			box-sizing: content-box;
			border-right: var(--border-thin);
		}
		.info {
			padding: 0 6px;
			h2 {
				font-weight: 600;
				font-size: 16px;
			}
			h3 {
				font-weight: 400;
				font-size: 10px;
				border-bottom: var(--border-thin);
				padding-bottom: 4px;
			}
			& > * {
				padding: 0 5px;
			}
			.more {
				& > * {
					padding-top: 5px;
					display: flex;
					align-items: center;
					font-size: 10px;
					gap: 3px;
				}
			}
		}
		.bio {
			min-width: 112px;
			border: var(--border-thin);
			border-radius: var(--border-r);
			background: var(--c-dark);
			padding: 4px;
			font-size: 8px;
		}
	}
</style>
