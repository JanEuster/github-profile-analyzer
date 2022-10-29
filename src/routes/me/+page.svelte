<script lang="ts">
	import { onMount } from 'svelte';

	let token: string | null;
	let user: Object | undefined;

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
		user = await res.json();
		console.log(user);
	});
</script>

{#if user}
	<nav class="navbar">
		<div class="global-navigation" />
		<div class="user-info">
			<img class="profile-picture" src={user.avatar_url} />
			<div class="info">
				<h2>{user.login}</h2>
				<h3>{user.name}</h3>
				<div class="more">
					<a href={user.blog}>{user.blog}</a>
					<a href={'mailto:' + user.email}>{user.email}</a>
					<span>{user.location}</span><br />
					{#if user.company}
						<a href={user.company}>{user.company}</a>
					{:else}
						<span>No Company</span><br />
					{/if}
					{#if user.twitter_username}
						<a href={user.twitter_username}>{user.twitter_username}</a>
					{:else}
						<span>No Twitter Handle</span><br />
					{/if}
				</div>
			</div>
			<div class="bio">
			  {user.bio ?? "no bio"}
			</div>
		</div>
	</nav>
{/if}

<style lang="scss">
	.navbar {
		width: 100vw;
		height: 172px;
		border-bottom: var(--border-thick);
		display: flex;
	}
	.global-navigation {
		width: 261px;
		height: 100%;
		border-right: var(--border-thin);
	}
	.user-info {
		margin: auto 0;
		display: flex;
	  justify-content: flex-start;
		width: 139px;
		.profile-picture {
			height: 139px;
			padding-left: 18px;
			padding-right: 11px;
			box-sizing: content-box;
			border-right: var(--border-thin);
		}
		.info {
			padding: 0 6px;
			h2 {
				font-weight: 900;
				font-size: 16px;
			}
			h3 {
				font-weight: 900;
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
					display: block;
					font-size: 10px;
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
