<script lang="ts">
	import { onMount } from 'svelte';
	import type { GraphQlQueryResponseData } from '@octokit/graphql';
	import type {
		AuthenticationStore,
		ContributionData,
		ContributionRepo,
		ContributionsYearTotal,
		ContributionWeek,
		UserResponse
	} from '$lib/types';
	import { dateToIndex, dayOfYear, fullYearsInRange } from '$lib/utils/date';
	import { authStore } from '../../stores';
	import Timeline from './Timeline.svelte';
	import ContributionStats from './ContributionStats.svelte';
	import ContributionRepos from './ContributionRepos.svelte';

	export let user: UserResponse;
	let auth: AuthenticationStore;
	authStore.subscribe((value) => (auth = value));

	let timelineStart = new Date('2020-08-26T19:29:09Z');
	let timelineEnd = new Date();
	let selectedStart = timelineStart;
	let selectedEnd = timelineEnd;

	let daysOfContribution: number[];
	let firstContributionDataReceived = false;
	let allContributionDataReceived = false;
	let contributionDataPerYear: GraphQlQueryResponseData[] = [];
	let contributionData: ContributionData = {
		totals: {
			total: 0,
			repos: {
				total: 0,
				years: [] as ContributionsYearTotal[]
			},
			commits: {
				total: 0,
				years: [] as ContributionsYearTotal[]
			},
			issues: {
				total: 0,
				years: [] as ContributionsYearTotal[]
			},
			pullRequests: {
				total: 0,
				years: [] as ContributionsYearTotal[]
			},
			pullRequestReviews: {
				total: 0,
				years: [] as ContributionsYearTotal[]
			}
		},
		weeks: [] as ContributionWeek[],
		repositories: [] as ContributionRepo[]
	};

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

	onMount(async () => {
		// array of account lifetime to store contributions
		const beforeFirst = dayOfYear(timelineStart);
		daysOfContribution = new Array(
			365 -
				beforeFirst +
				365 * (fullYearsInRange(timelineStart, timelineEnd).length - 1) +
				dayOfYear(timelineEnd)
		);
		daysOfContribution.fill(0);
		// iterate of years of contribution and query contribution data for each one
		for (let year = timelineStart.getFullYear(); year <= timelineEnd.getFullYear(); year++) {
			let dateStart;
			dateStart = `${year}-01-01T01:00:01Z`;
			let paramStr = `(${'from: "' + dateStart + '"'})`;
			let body = contributionsQuery(paramStr);
			let contributionsRes = await fetch('https://api.github.com/graphql', {
				method: 'POST',
				body: JSON.stringify(body),
				headers: {
					authorization: 'Bearer ' + auth.token
				}
			});

			const contributions = ((await contributionsRes.json()) as GraphQlQueryResponseData).data.user
				.contributionsCollection;
			for (const repo of contributions.commitContributionsByRepository) {
				if (repo.contributions.nodes[0] != null) {
					for (const contribution of repo.contributions.nodes) {
						const contriDate = new Date(contribution.occurredAt);
						const years = (contriDate.getFullYear() - timelineStart.getFullYear()) * 365;
						const contriIndex = years + (dayOfYear(contriDate) - dayOfYear(timelineStart)) - 1;
						daysOfContribution[contriIndex] += contribution.commitCount ?? 1;
					}
				}
				// fill list of repos that where contributed to
				// if its not already in the array
				let dupIndex = -1;
				for (let i = 0; i < contributionData.repositories.length; i++) {
					const listedRepo = contributionData.repositories[i];
					if (
						repo.repository.name == listedRepo.name &&
						repo.repository.owner.login == listedRepo.owner
					) {
						dupIndex = i;
						break;
					}
				}
				if (dupIndex > -1) {
					contributionData.repositories[dupIndex].total += repo.contributions.totalCount;
				} else {
					contributionData.repositories.push({
						total: repo.contributions.totalCount,
						url: repo.repository.resourcePath,
						name: repo.repository.name,
						owner: repo.repository.owner.login,
						homepage: repo.repository.homepageUrl,
						isForked: repo.repository.isForked,
						isPrivate: repo.repository.isPrivate,
						isArchived: repo.repository.isArchived,
						forkCount: repo.repository.forkCount,
						description: repo.repository.description,
						lastUpdated: repo.repository.pushedAt
					});
				}
			}
			for (const repo of [
				...contributions.issueContributionsByRepository,
				...contributions.pullRequestContributionsByRepository,
				...contributions.pullRequestReviewContributionsByRepository
			]) {
				if (repo.contributions.nodes[0] != null) {
					for (const contribution of repo.contributions.nodes) {
						const contriDate = new Date(contribution.occurredAt);
						const years = (contriDate.getFullYear() - timelineStart.getFullYear()) * 365;
						const contriIndex = years + (dayOfYear(contriDate) - dayOfYear(timelineStart)) - 1;
						daysOfContribution[contriIndex] += 1;
					}
				}
				for (const repo of contributions.repositoryContributions.nodes) {
					const contriIndex = dateToIndex(timelineStart, repo.occurredAt);
					daysOfContribution[contriIndex] += 1;
				}
				// beginning of year marker
				// daysOfContribution[daysBetween(timelineStart, new Date(String(year))) + 0] = 30;
				// daysOfContribution[daysBetween(timelineStart, new Date(String(year))) + 1] = 50;
				// daysOfContribution[daysBetween(timelineStart, new Date(String(year))) + 2] = 50;
				// daysOfContribution[daysBetween(timelineStart, new Date(String(year))) + 3] = 50;
				// daysOfContribution[daysBetween(timelineStart, new Date(String(year))) + 4] = 50;

				// set contribution data
				contributionDataPerYear.push(contributions);
			}

			// totals over all years
			contributionData.totals.repos.total += contributions.totalRepositoryContributions;
			contributionData.totals.commits.total += contributions.totalCommitContributions;
			contributionData.totals.issues.total += contributions.totalIssueContributions;
			contributionData.totals.pullRequests.total += contributions.totalPullRequestContributions;
			contributionData.totals.pullRequestReviews.total +=
				contributions.totalPullRequestReviewContributions;
			// totals of this year
			contributionData.totals.repos.years.push({
				year: year,
				total: contributions.totalRepositoryContributions
			});
			contributionData.totals.commits.years.push({
				year: year,
				total: contributions.totalCommitContributions
			});
			contributionData.totals.issues.years.push({
				year: year,
				total: contributions.totalIssueContributions
			});
			contributionData.totals.pullRequestReviews.years.push({
				year: year,
				total: contributions.totalPullRequestContributions
			});
			contributionData.totals.pullRequestReviews.years.push({
				year: year,
				total: contributions.totalPullRequestReviewContributions
			});

			contributionData.weeks.push(...contributions.contributionCalendar.weeks);

			firstContributionDataReceived = true;
		}
		contributionData.totals.total =
			contributionData.totals.repos.total +
			contributionData.totals.commits.total +
			contributionData.totals.issues.total +
			contributionData.totals.pullRequests.total +
			contributionData.totals.pullRequestReviews.total;

		console.log(contributionData);
		allContributionDataReceived = true;
	});
</script>

<div class="user-repo-activity box">
	{#if daysOfContribution && firstContributionDataReceived}
		<Timeline {daysOfContribution} {timelineStart} {timelineEnd} />
	{/if}
	<div class="data">
		{#if allContributionDataReceived}
			<ContributionStats
				{contributionData}
				{contributionDataPerYear}
				{selectedStart}
				{selectedEnd}
			/>
			<ContributionRepos {contributionData} />
		{/if}
	</div>
</div>

<style lang="scss">
	.user-repo-activity {
		min-height: 100%;
		min-width: 500px;
		.data {
			margin: 10px;
			margin-left: 20px;
			margin-top: 20px;
			display: flex;
		}
	}
</style>
