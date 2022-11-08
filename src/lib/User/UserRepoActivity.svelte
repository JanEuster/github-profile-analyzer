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
	import fetchUserContributions from '$lib/graphql/fetchUserContributions';
	import fetchRepositoryStats from '$lib/graphql/fetchRepositoryStats';

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

	// fill list of repos that where contributed to
	// if its not already in the array
	const getRepoDetails = (repo: GraphQlQueryResponseData, isCommitData: boolean) => {
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
			contributionData.repositories[dupIndex].userTotal += repo.contributions.totalCount;
			if (isCommitData) {
				contributionData.repositories[dupIndex].userCommitsTotal += repo.contributions.totalCount;
			}
		} else {
			contributionData.repositories.push({
				userTotal: repo.contributions.totalCount,
				userCommitsTotal: isCommitData ? repo.contributions.totalCount : 0,
				totals: undefined,
				url: repo.repository.resourcePath,
				name: repo.repository.name,
				owner: repo.repository.owner.login,
				homepage: repo.repository.homepageUrl,
				isForked: repo.repository.isForked,
				isPrivate: repo.repository.isPrivate,
				isArchived: repo.repository.isArchived,
				forkCount: 0,
				description: repo.repository.description,
				lastUpdated: repo.repository.pushedAt
			});
		}
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
			const contributionsRes = fetchUserContributions(auth, user.login, dateStart);

			const contributions = (await contributionsRes).data.user.contributionsCollection;
			for (const repo of contributions.commitContributionsByRepository) {
				if (repo.contributions.nodes[0] != null) {
					for (const contribution of repo.contributions.nodes) {
						const contriDate = new Date(contribution.occurredAt);
						const years = (contriDate.getFullYear() - timelineStart.getFullYear()) * 365;
						const contriIndex = years + (dayOfYear(contriDate) - dayOfYear(timelineStart)) - 1;
						daysOfContribution[contriIndex] += contribution.commitCount ?? 1;
					}
				}
				getRepoDetails(repo, true);
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
				getRepoDetails(repo, false);
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

		// set repository data that is not related to user request
		for (const repo of contributionData.repositories) {
			fetchRepositoryStats(auth, repo.owner, repo.name).then((res) => {
				let newData = res.data.repository;
				repo.forkCount = newData.forkCount;
				repo.totals = {
					commits: newData.defaultBranchRef
						? newData.defaultBranchRef.target.history.totalCount
						: undefined,
					issues: newData.issues.totalCount,
					pullRequests: newData.pullRequests.totalCount,
					stars: newData.stargazerCount,
					watchers: newData.watchers.totalCount
				};
			});
		}

		setTimeout(() => {
			allContributionDataReceived = true;
		}, 300);
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
		min-width: 300px;
		max-width: 1500px;
		.data {
			margin: 10px;
			margin-left: 20px;
			margin-top: 20px;
			display: flex;
		}
	}
</style>
