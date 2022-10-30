<script lang="ts">
  import { env } from '$env/dynamic/public'
  import { onMount } from 'svelte';

	const authorize = () => {
		// unguessable random string to protect against CSRF attacks
		let state = '';
		for (let i = 0; i < 32; i++) {
			state += '0123456789abcdefghijklmnopqrstuvwxyz'.split('')[parseInt(Math.random() * 36)];
		}
		localStorage.setItem('gh-state', state);
		let redirect_uri = "https://github-profile-analyzer.vercel.app/authenticate";
		let url = `https://github.com/login/oauth/authorize?client_id=${env.PUBLIC_GH_ID}&redirect_uri=${redirect_uri}&state=${state}&scope="repo,user`;
		window.location.href = url;
	};

	onMount(async () => {
		let token = localStorage.getItem('gh-access-token');
		let res = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: 'Bearer ' + token
			}
		});
		let json = await res.json();
		if (json.login) {
	    window.location.href = "/me"
		}
	})
</script>

<h1>Github Profile Analyzer</h1>
<p>
<button on:click={authorize}>Sign In With Github</button> to analyze your own and others Github Profiles. 
</p>
