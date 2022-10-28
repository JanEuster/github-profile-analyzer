<script lang="ts">
  import { env } from '$env/dynamic/public'

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
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<button on:click={authorize}>Signin With Github</button>
