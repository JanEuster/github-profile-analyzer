<script lang="ts">
	export let url: string;
	export let text: string;
</script>

<a class="big-link" href={url} rel="noreferrer" target="_blank">
	<span>☛</span>
	{text}
	<span>☚</span>
</a>

<style lang="scss">
	.big-link {
		display: inherit;
		text-decoration: none;
		display: flex;
		gap: 5px;
		span {
			display: none;
		}
		&:hover {
			background-color: unset;
			color: var(--c-text);
			span {
				display: inline;
			}
		}
	}
</style>
