<script lang="ts">
	import BigLink from '$lib/common/BigLink.svelte';
	import type { ContributionData, ContributionRepo, UserResponse } from '$lib/types';
	export let contributionData: ContributionData;
	export let user: UserResponse;

	const sortedRepos = (): ContributionRepo[] => {
		// sort repos by total contributions by user
		const sorted = [] as ContributionRepo[];
		let unsorted = contributionData.repositories;
		for (let i = 0; i < contributionData.repositories.length-2; i++) {
			let highest: [number, number] = [0, unsorted[0].userTotal];
			unsorted.forEach((repo, j) => {
				if (repo.userTotal > highest[1]) {
					highest = [j, repo.userTotal];
				}
			})
			let j = highest[0];
			sorted.push(...unsorted.slice(j, j+1));
			unsorted = [...unsorted.slice(0, j), ...unsorted.slice(j+1, unsorted.length)];
		}
		console.log(sorted);
		return sorted;
	}
</script>

<div class="repos-wrapper">
	<div class="title-line">
		<h4>Repositories by</h4>
		<select><option>Contributions</option></select>
	</div>
	<div class="repos box-dark">
		{#each sortedRepos() as repo}
			<div
				class="repo box"
				data-private={String(repo.isPrivate)}
				data-archived={String(repo.isArchived)}
				data-forked={String(repo.isForked)}
			>
				<div class="repo-left">
					<h6 class="repo-name">
						<BigLink url={'https://github.com' + repo.url} text={repo.owner != user.login ? repo.nameWithOwner : repo.name} />
					</h6>
					<span>{repo.userTotal} Contributions Total</span>
					<span>{repo.userCommitsTotal} Commit Contributions</span>
				</div>
				{#if repo.description}
					<p class="repo-desc">
						{repo.description}
					</p>
				{/if}
				{#if repo.totals && !repo.isPrivate}
				<div class="repo-stats">
					<div class="stat">
						<i class="ph-git-commit ph-sm" />
						<div>
							<span class="number">{repo.totals.commits}</span>
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
				{/if}
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

				&[data-private='true'] {
					background-color: var(--c-private);
					border-color: var(--c-private-light);
				}
				&[data-private='true']::selection {
					background-color: red;
				}

				.repo-left {
					width: 200px;
					display: flex;
					gap: 2px;
					flex-direction: column;
					.repo-name {
						word-break: keep-all;
						margin-bottom: 5px;
					}
					span {
						font-size: 8px;
						color: var(--c-text-muted);
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
