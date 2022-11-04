<script lang="ts">
	import type {
		AuthenticationStore,
		UserResponse
	} from '$lib/types';
	import type { GraphQlQueryResponseData } from '@octokit/graphql';

	import { onMount } from 'svelte';
	import { authStore } from '../../stores';

	export let user: UserResponse;
	let auth: AuthenticationStore;
	authStore.subscribe((value) => (auth = value));

	let timelineBegin = new Date('2020-08-26T19:29:09Z');
	let timelineEnd = new Date();
	let daysOfContribution: number[]; 
	let contributionData: GraphQlQueryResponseData[] = [];

	const contributionsQuery = (paramStr: string) => {
		return {
			query: `query {
				user(login: "${user.login}"){
					contributionsCollection${paramStr}{
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
	};

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
	const dateToIndex = (dateStr: Date | string) => {
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

		// array of account lifetime to store contributions
		const daysOfContribution = new Array(yearLength - beforeFirst + yearLength * (fullYearsInRange().length - 1) + dayOfYear(timelineEnd))
		daysOfContribution.fill(0);
		// iterate of years of contribution and query contribution data for each one
		for (let year = timelineBegin.getFullYear(); year <= timelineEnd.getFullYear(); year++) {
			let dateStart;
			dateStart = `${year}-01-01T01:00:01Z`;
			let paramStr = `(${'from: "' + dateStart + '"'})`;
			let body = contributionsQuery(paramStr);
			let contributionsRes = (await fetch('https://api.github.com/graphql', {
				method: 'POST',
				body: JSON.stringify(body),
				headers: {
					authorization: 'Bearer ' + auth.token
				}
			}));

			const contributions = (await contributionsRes.json() as GraphQlQueryResponseData).data.user.contributionsCollection;
			for (const repo of [...contributions.commitContributionsByRepository, ...contributions.issueContributionsByRepository, ...contributions.pullRequestContributionsByRepository, ...contributions.pullRequestReviewContributionsByRepository]) {
				for (const contribution of repo.contributions.nodes) {
					const contriDate = new Date(contribution.occurredAt);
					const years = (contriDate.getFullYear() - timelineBegin.getFullYear()) * 365;
					const contriIndex = years + (dayOfYear(contriDate) - dayOfYear(timelineBegin)) - 1;
					daysOfContribution[contriIndex] += contribution.commitCount ?? 1;
				}
			}
			for (const repo of contributions.repositoryContributions.nodes) {
					const contriIndex = dateToIndex(repo.occurredAt);
					daysOfContribution[contriIndex] += 1;
			}
			contributionData.push(contributions);
		}
		console.log(contributionData)
		const node = document.getElementById("timeline-data");
		const maxContributions = Math.max(...daysOfContribution);
		for (const day of daysOfContribution) {
			const elem = document.createElement("div");
			elem.style.backgroundColor = "var(--c-green)";
			elem.style.width = "100%";
			elem.style.height = `${100*day/maxContributions}%`
			node?.appendChild(elem)
		}
	});
</script>

<div class="user-repo-activity box">
	<div class="timeline-wrapper">
		<div class="timeline box-dark">
			<div id="timeline-data" class="data-wrapper">
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
					display: flex;
					align-items: end;

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
