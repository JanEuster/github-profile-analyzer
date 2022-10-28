<script lang="ts">
import { onMount } from "svelte";

let token: string | null;
let user: Object | undefined;

onMount(async () => {
  token = localStorage.getItem("gh-access-token");
  if (token == null) {
    window.location.href = "/?redirect_reason=no auth"
  }
  let res = await fetch("https://api.github.com/user", {
  headers: {
    Authorization: "Bearer " + token, 
  }
  })
  user = await res.json();
  console.log(user)
})
</script>

{#if user}
<img src={user.avatar_url}>
{user.login}
<a href={user.blog}>{user.blog}</a>
Created at {user.created_at}
{/if}
