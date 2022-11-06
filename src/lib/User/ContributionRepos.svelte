<script lang="ts">
	import type { ContributionData } from '$lib/types';

	export let contributionData: ContributionData;
</script>

<div class="repos-wrapper">
	<div class="repos box-dark">
		<div class="repo box">
			<div class="repo-left">
				<h6 class="repo-name">github-profile-analyer</h6>
			</div>
			<p class="repo-desc">
				A Webapp to analyze yours and others Github Profiles using the Github REST API
			</p>
			<div class="repo-stats">
				<div class="stat">
					<i class="ph-git-commit ph-sm" />
					<div>
						<span class="number">120</span>
						<span class="text">Commits</span>
					</div>
				</div>
				<div class="stat">
					<i class="ph-star ph-sm" />
					<div>
						<span class="number">6</span>
						<span class="text">Star</span>
					</div>
				</div>
				<div class="stat">
					<i class="ph-git-fork ph-sm" />
					<div>
						<span class="number">2</span>
						<span class="text">Forks</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.repos-wrapper {
		margin-left: 30px;
		width: 370px;
		min-width: 250px;
		.repos {
			width: 100%;
			height: 370px;

			.repo {
				margin: 0 7px;
				margin-top: 7px;
				padding: 5px 7px;
				height: 85px;
				display: flex;
				gap: 20px;

				.repo-left {
					width: 200%;
					.repo-name {
						word-break: keep-all;
					}
				}
				.repo-desc {
					min-width: 85px;
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
