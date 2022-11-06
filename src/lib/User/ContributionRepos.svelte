<script lang="ts">
	import BigLink from '$lib/common/BigLink.svelte';
import type { ContributionData } from '$lib/types';
	export let contributionData: ContributionData;

</script>

<div class="repos-wrapper">
	<div class="title-line">
		<h4>Repositories by</h4>
		<select><option>Contributions</option></select>
	</div>
	<div class="repos box-dark">
		{#each contributionData.repositories as repo}
			<div class="repo box" data-private={String(repo.isPrivate)} data-archived={String(repo.isArchived)} data-forked={String(repo.isForked)}>
				<div class="repo-left">
					<h6 class="repo-name"><BigLink url={"https://github.com"+repo.url} text={repo.name}></BigLink></h6>
					<span>{repo.total} Contributions Total</span>
					<span>{repo.commitsTotal} Commit Contributions</span>
				</div>
				{#if repo.description}
					<p class="repo-desc">
						{repo.description}
					</p>
				{/if}
				<div class="repo-stats">
					<div class="stat">
						<i class="ph-git-commit ph-sm" />
						<div>
							<span class="number">{repo.commitsTotal}</span>
							<span class="text">Commits</span>
						</div>
					</div>
					<!-- <div class="stat"> -->
					<!-- 	<i class="ph-star ph-sm" /> -->
					<!-- 	<div> -->
					<!-- 		<span class="number">6</span> -->
					<!-- 		<span class="text">Stars</span> -->
					<!-- 	</div> -->
					<!-- </div> -->
					{#if repo.forkCount != undefined}
						<div class="stat">
							<i class="ph-git-fork ph-sm" />
							<div>
								<span class="number">{repo.forkCount}</span>
								<span class="text">Forks</span>
							</div>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	.repos-wrapper {
		margin-left: 30px;
		width: 370px;
		min-width: min(100vw - 20px, 300px);
		.title-line {
			display: flex;
			margin-left: 7px;
			align-items: center;
			gap: 5px;
		}
		.repos {
			margin-top: 6px;
			width: 100%;
			height: 370px;
			overflow-y: scroll;

			.repo {
				margin: 0 10px;
				margin-top: 10px;
				&:last-child {
					margin-bottom: 10px;
				}

				padding: 5px 7px;
				height: 85px;
				display: flex;
				gap: 20px;
				justify-content: space-between;

				.repo-left {
					width: 200px;
					.repo-name {
						word-break: keep-all;
					}
				}
				.repo-desc {
					min-width: 85px;
					max-width: 100px;
					font-size: 8px;
					color: var(--c-text-muted);
				}
				.repo-stats {
					display: flex;
					flex-direction: column;
					gap: 7px;
					margin-top: 3px;
					.stat {
						display: flex;
						i {
							color: var(--c-text-muted);
						}
						div > * {
							display: block;
							color: var(--c-text-muted);
							margin-left: 2px;
						}
						.number {
							font-size: 10px;
							margin-top: -2px;
							line-height: 10px;
						}
						.text {
							font-size: 6px;
							line-height: 6px;
						}
					}
				}
			}
		}
	}
</style>
