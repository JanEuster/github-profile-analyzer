<script lang="ts">
	import type {
		AuthenticationStore,
		CommitsResponse,
		ReposResponse,
		UserResponse
	} from '$lib/types';

	import { onMount } from 'svelte';
	import { authStore } from '../../stores';

	export let user: UserResponse;
	let auth: AuthenticationStore;
	authStore.subscribe((value) => (auth = value));

	let timelineBegin = new Date('2020-08-26T19:29:09Z');
	let timelineEnd = new Date();

	const daysBetween = (start: Date, end: Date) =>
		Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
	const dayOfYear = (date: Date) =>
		Math.floor(
			1 + (date.getTime() - new Date(String(date.getFullYear())).getTime()) / (1000 * 60 * 60 * 24)
		);
	const fullYearsInRange = () => {
		let max = timelineEnd.getFullYear();
		let min = timelineBegin.getFullYear() + 1;
		let years = [];
		for (let i = min; i <= max; i++) {
			years.push(i);
		}
		return years;
	};
	const dateToIndex = (dateStr: string) => {
		const date = new Date(dateStr);
		return daysBetween(timelineBegin, date);
	};

	onMount(async () => {
		const years = document.getElementsByClassName('timeline-overlay-year');
		const length = daysBetween(timelineBegin, timelineEnd);
		const yearLength = 365;
		const beforeFirst = dayOfYear(timelineBegin);
		for (let i = 0; i < years.length; i++) {
			let year = years[i];
			(year as HTMLElement).style.left = `${((beforeFirst + i * yearLength) / length) * 100}%`;
		}
		const widthOfDay = 1 / length;

		let body = {
			query: `query {
				user(login: "${user.login}"){
					contributionsCollection(from: "${user.created_at}", to: "${new Date("2020-12-31T23:59:59Z").toISOString()}"){
						contributionCalendar{
							colors
							totalContributions
							weeks{
								contributionDays{
									color
									date
									weekday
									contributionCount
								}
								firstDay
							}
						}
						commitContributionsByRepository(maxRepositories: 50){
							contributions(last: 100){
								nodes{
									commitCount
									occurredAt
									resourcePath
								}
								totalCount
							}
							repository {
								name
								owner {
									login
									resourcePath
								}
								description
								forkCount
								homepageUrl
								isArchived
								isFork
								isPrivate
								collaborators{
									nodes{
										login
										resourcePath
									}
									totalCount
								}
								pushedAt
								resourcePath
							}
							resourcePath
						}
						issueContributionsByRepository{
							contributions(last: 100){
								nodes{
									occurredAt
									resourcePath
								}
								totalCount
							}
							repository {
								name
								owner {
									login
									resourcePath
								}
							}
						}
						pullRequestContributionsByRepository{
							contributions(last: 100){
								nodes{
									occurredAt
									resourcePath
								}
								totalCount
							}
							repository {
								name
								owner {
									login
									resourcePath
								}
							}
						}
						pullRequestReviewContributionsByRepository {
							contributions(last: 100){
								nodes{
									occurredAt
									resourcePath
								}
								totalCount
							}
							repository {
								name
								owner {
									login
									resourcePath
								}
							}
						}
						repositoryContributions(last: 100){
							nodes {
								occurredAt
								repository{
									name
									owner {
										login
										resourcePath
									}
								}
								resourcePath
							}
						}
						firstIssueContribution{
							... on CreatedIssueContribution{
								issue{
									author{
										login
										resourcePath
									}
									createdAt
									closed
									closedAt
								}
								occurredAt
								resourcePath
							}
							... on RestrictedContribution{
								occurredAt
								resourcePath
							}
						}
						firstPullRequestContribution{
							... on CreatedPullRequestContribution{
								pullRequest{
									baseRepository{
										name
										owner {
											login
											resourcePath
										}
									}
									author{
										login
										resourcePath
									}
									createdAt
									closed
									closedAt
								}
								occurredAt
								resourcePath
							}
							... on RestrictedContribution{
								occurredAt
								resourcePath
							}
						}
						firstRepositoryContribution{
							... on CreatedRepositoryContribution{
								occurredAt
								repository{
									name
									owner {
										login
										resourcePath
									}
								}
								resourcePath
							}
							... on RestrictedContribution{
								occurredAt
								resourcePath
							}
						}
						popularIssueContribution{
							issue{
								author{
									login
									resourcePath
								}
								createdAt
								closed
								closedAt
							}
							occurredAt
							resourcePath
						}
						popularPullRequestContribution{
							pullRequest{
								baseRepository{
									name
									owner {
										login
										resourcePath
									}
								}
								author{
									login
									resourcePath
								}
								createdAt
								closed
								closedAt
							}
							occurredAt
							resourcePath
						}
						totalCommitContributions
						totalIssueContributions
						totalPullRequestContributions
						totalPullRequestReviewContributions
						totalRepositoriesWithContributedCommits
						totalRepositoriesWithContributedIssues
						totalRepositoriesWithContributedPullRequests
						totalRepositoriesWithContributedPullRequestReviews
						totalRepositoryContributions
					}
				}
			}
			`
		};
		let contributionsRes = await fetch('https://api.github.com/graphql', {
			method: 'POST',
			body: JSON.stringify(body),
			headers: {
				authorization: 'Bearer ' + auth.token
			}
		});
		console.log(contributionsRes);
	});
</script>

<div class="user-repo-activity box">
	<div class="timeline-wrapper">
		<div class="timeline box-dark">
			<div class="data-wrapper">
				<div class="overlay">
					<div class="years">
						{#each fullYearsInRange() as year}
							<span class="timeline-overlay-year">{year}</span>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="data">
		<div class="stats" />
		<div class="repos" />
	</div>
</div>

<style lang="scss">
	.user-repo-activity {
		min-height: 100%;
		min-width: 500px;

		.timeline-wrapper {
			width: 100%;
			height: 102px;
			border-bottom: var(--border-thin);
			display: flex;
			justify-content: center;
			align-items: center;
			.timeline {
				margin: 32px 20px;
				width: 100%;
				height: 42px;
				border-radius: var(--border-r);

				.data-wrapper {
					margin: 0 10px;
					width: calc(100% - 20px);
					height: 100%;
					background-color: black;
					position: relative;

					.overlay {
						position: absolute;
						top: -10px;
						left: 0;
						width: 100%;
						height: 100%;

						.years {
							position: relative;
							width: calc(100% + 16px);
							transform: translateX(-8px);
							height: 10px;
							& > * {
								position: absolute;
								display: inline-block;
								font-size: 10px;
								transform: translateY(-50%);
								text-align: center;
							}
						}
					}
				}
			}
		}
	}
</style>
