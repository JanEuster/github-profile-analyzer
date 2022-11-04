<script lang="ts">
	import { onMount } from 'svelte';
	import type { GraphQlQueryResponseData } from '@octokit/graphql';
	import type { AuthenticationStore, UserResponse } from '$lib/types';
	import { dateToIndex, dayOfYear, daysBetween, fullYearsInRange } from '$lib/utils/date';
	import { authStore } from '../../stores';
	import Timeline from './Timeline.svelte';

	export let user: UserResponse;
	let auth: AuthenticationStore;
	authStore.subscribe((value) => (auth = value));

	let timelineStart = new Date('2020-08-26T19:29:09Z');
	let timelineEnd = new Date();
	let daysOfContribution: number[];
	let firstContributionDataReceived = false;
	let allContributionDataReceived = false;
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
			for (const repo of [
				...contributions.commitContributionsByRepository,
				...contributions.issueContributionsByRepository,
				...contributions.pullRequestContributionsByRepository,
				...contributions.pullRequestReviewContributionsByRepository
			]) {
				for (const contribution of repo.contributions.nodes) {
					const contriDate = new Date(contribution.occurredAt);
					const years = (contriDate.getFullYear() - timelineStart.getFullYear()) * 365;
					const contriIndex = years + (dayOfYear(contriDate) - dayOfYear(timelineStart)) - 1;
					daysOfContribution[contriIndex] += contribution.commitCount ?? 1;
				}
			}
			for (const repo of contributions.repositoryContributions.nodes) {
				const contriIndex = dateToIndex(timelineStart, repo.occurredAt);
				daysOfContribution[contriIndex] += 1;
			}
			// beginning of year marker
			// daysOfContribution[(year-timelineStart.getFullYear()) + 365] += 20;
			// daysOfContribution[(year-timelineStart.getFullYear()) + 366] += 20;
			// daysOfContribution[(year-timelineStart.getFullYear()) + 367] += 20;
			// daysOfContribution[(year-timelineStart.getFullYear()) + 368] += 20;
			// daysOfContribution[(year-timelineStart.getFullYear()) + 369] += 20;
			contributionData.push(contributions);

			firstContributionDataReceived = true;
		}
	});
</script>

<div class="user-repo-activity box">
	{#if daysOfContribution && firstContributionDataReceived}
		<Timeline {daysOfContribution} {contributionData} {timelineStart} {timelineEnd} />
	{/if}
	<div class="data">
		<div class="stats" />
		<div class="repos" />
	</div>
</div>

<style lang="scss">
	.user-repo-activity {
		min-height: 100%;
		min-width: 500px;
	}
</style>
