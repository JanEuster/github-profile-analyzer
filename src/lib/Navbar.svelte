<script lang="ts">
	import type { UserResponse } from './types';

	export let user: UserResponse | undefined;
</script>

<nav class="navbar">
	<div>
		<div class="global-navigation">
			<div class="row">
				<button class="square home-button"><i class="ph-house ph-xl" /></button>
				<div class="search-bar">
					<input />
					<i class="ph-magnifying-glass ph-sm" />
				</div>
			</div>
			{#if user}
				<span class="bread-crums">
					Users > {user.login}
				</span>
			{/if}
		</div>
		{#if user}
			<div class="user-info">
				<img class="profile-picture" src={user.avatar_url} alt="profile avatar" />
				<div class="info">
					<h2>{user.login}</h2>
					<h3>{user.name}</h3>
					<div class="more">
						<span
							><i class="ph-link-simple" /><a href={user.blog} rel="noreferrer" target="_blank"
								>{user.blog}</a
							></span
						>
						<span
							><i class="ph-at" /><a href={'mailto:' + user.email} rel="noreferrer" target="_blank"
								>{user.email}</a
							></span
						>
						<span><i class="ph-push-pin" />{user.location}</span>
						<span
							><i class="ph-buildings" />
							{#if user.company}
								<span
									><i class="ph-house"
										><a href={user.company} rel="noreferrer" target="_blank">{user.company}</a></i
									></span
								>
							{:else}
								No Company
							{/if}
						</span>
						<span
							><i class="ph-twitter-logo" />
							{#if user.twitter_username}
								<a href={user.twitter_username} rel="noreferrer" target="_blank"
									>{user.twitter_username}</a
								>
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
		{/if}
	</div>
</nav>

<style lang="scss">
	.navbar {
		border-bottom: var(--border-thick);
		& > div {
			display: flex;
			flex-wrap: wrap;
		}
	}
	.global-navigation {
		margin: 9px 13px;
		margin-right: 0;
		min-width: 261px;
		max-width: 100%;
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
		flex-wrap: wrap;
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
