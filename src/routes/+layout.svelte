<script lang="ts">
	import { authStore } from '../stores';

	import { onMount } from 'svelte';

	import '../app.scss';

	let triedAuth = false;

	onMount(async () => {
		let token = localStorage.getItem('gh-access-token');
		let res = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: 'Bearer ' + token
			}
		});
		let json = await res.json();
		console.log(json.login);
		if (json.login) {
			authStore.set({ valid: true, token: token ?? '', me: json, iat: new Date().getSeconds() });
			triedAuth = true;
			if (window.location.pathname == '/') {
				window.location.pathname = '/me';
			}
		}
	});
</script>

<svelte:head>
	<title>github-profile-analyzer</title>
	<meta name="description" content="github-profile-analyzer" />
	<!-- phosphor-icons -->
	<link rel="stylesheet" href="https://unpkg.com/phosphor-icons@1.4.2/src/css/icons.css" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link
		href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{#if triedAuth}
	<slot />
{/if}
