<script lang="ts">
	import { onMount } from 'svelte';
	import type { GraphQlQueryResponseData } from '@octokit/graphql';
	import type {
		AuthenticationStore,
		ContributionData,
		ContributionsYearTotal,
		ContributionWeek,
		UserResponse
	} from '$lib/types';
	import { dateInRange, dateToIndex, dayOfYear, daysBetween, fullYearsInRange, months } from '$lib/utils/date';
	import { authStore } from '../../stores';
	import Timeline from './Timeline.svelte';

	export let user: UserResponse;
	let auth: AuthenticationStore;
	authStore.subscribe((value) => (auth = value));

	let timelineStart = new Date('2020-08-26T19:29:09Z');
	let timelineEnd = new Date();
	let selectedStart = timelineStart;
	let selectedEnd = timelineEnd;

	let monthAverages: number[] = new Array(12).fill(0);
	let weekdayAverages: number[] = new Array(7).fill(0);

	let daysOfContribution: number[];
	let firstContributionDataReceived = false;
	let allContributionDataReceived = false;
	let contributionDataPerYear: GraphQlQueryResponseData[] = [];
	let contributionData: ContributionData = {
		totals: {
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
		weeks: [] as ContributionWeek[]
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
			daysOfContribution[daysBetween(timelineStart, new Date(String(year))) + 0] = 30;
			// daysOfContribution[daysBetween(timelineStart, new Date(String(year))) + 1] = 50;
			// daysOfContribution[daysBetween(timelineStart, new Date(String(year))) + 2] = 50;
			// daysOfContribution[daysBetween(timelineStart, new Date(String(year))) + 3] = 50;
			// daysOfContribution[daysBetween(timelineStart, new Date(String(year))) + 4] = 50;

			// set contribution data
			contributionDataPerYear.push(contributions);

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

		// get month averages
		let days = 0;
		for (const week of contributionData.weeks) {
			for (const day of week.contributionDays) {
				let date = new Date(day.date);
				if (dateInRange(selectedStart, selectedEnd, date)) {
					monthAverages[date.getMonth()] += day.contributionCount;
					days += 1
				}
			}
		}
		monthAverages.forEach((monthTotal) => monthTotal/days);
		console.log(monthAverages);

		allContributionDataReceived = true;
	});
</script>

<div class="user-repo-activity box">
	{#if daysOfContribution && firstContributionDataReceived}
		<Timeline {daysOfContribution} {timelineStart} {timelineEnd} />
	{/if}
	<div class="data">
		{#if allContributionDataReceived}
			<div class="stats">
				<h4>Contributions</h4>
				<div class="stats-repo-general">
					<div class="stat">
						<span>Repositories</span>
						<span class="number">{contributionData.totals.repos.total}</span>
					</div>
					<div class="stat">
						<span>Pull Requests</span>
						<span class="number">{contributionData.totals.pullRequests.total}</span>
					</div>
					<div class="stat">
						<span>Issues</span>
						<span class="number">{contributionData.totals.issues.total}</span>
					</div>
					<div class="stat">
						<span>Pull Request Reviews</span>
						<span class="number">{contributionData.totals.pullRequestReviews.total}</span>
					</div>
				</div>
				<div class="stats-commits">
					<hr />
					<div>
						<div class="stat-small">
							<span>Commmits Total</span>
							<div>
								<span class="number">
									{contributionData.totals.commits.total}
								</span>
								<div class="bar" style="--width: 100%" />
							</div>
						</div>
					</div>
					<hr />
				</div>
				<div class="stats-averages">
					<div class="averages-month">
						{#each months as month, i}
							<div class="stat-small">
								<span>{month}</span>
								<div>
									<span class="number">
										{monthAverages[i]}
									</span>
									<div class="bar" style={`--width: ${100*monthAverages[i]/Math.max(...monthAverages)}%`} />
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
			<div class="repos" />
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

			hr {
				height: 1px;
				background-color: var(--c-grey);
			}
			.stats {
				.stat,
				.stat-small {
					display: flex;
					justify-content: space-between;
					.bar {
						min-width: 80%;
						height: 10px;
						margin-left: 9%;
						margin-right: 5%;
						position: relative;
						&::before {
							border-radius: var(--border-r);
							content: '';
							position: absolute;
							top: 0;
							left: 0;
							width: var(--width);
							height: 100%;
							background-color: var(--c-green);
							z-index: 9999999;
						}
					}
					& > div {
						min-width: 50%;
						height: 100%;
						display: flex;
						justify-content: flex-end;
						align-items: center;
					}
				}
				.stat {
					line-height: 14px;
					span {
						font-size: 10px;
					}
				}
				.stat-small {
					line-height: 10px;
					padding: 0 2px;
					span {
						font-size: 8px;
					}
				}
			}
			.stats-repo-general {
				margin: 4px 0;
				display: flex;
				flex-direction: column;
				flex-wrap: wrap;
				width: 110px;
				gap: 3px 20px;
				height: 80px;
				.stat {
					width: 110px;
					.number {
						width: 20%;
						text-align: right;
					}
				}
			}
			.stats-commits {
				width: 290px;
				& > div {
					padding: 6px 0;
					display: flex;
					flex-direction: column;
				}
			}
			.stats-averages {
				padding: 6px 2px;
				& > * {
					width: 155px;
					.stat-small {
						padding: 2px 0;
					}
				}
			}
		}
	}
</style>
