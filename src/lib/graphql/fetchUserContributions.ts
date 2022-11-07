import type { GraphQlQueryResponseData } from '@octokit/graphql';
import type { AuthenticationStore } from '$lib/types';
import { fetchGraphQL } from '$lib/utils/graphql';

export default async (
	auth: AuthenticationStore,
	login: string,
	dateStart: string
): Promise<GraphQlQueryResponseData> => {
	const paramStr = `(${'from: "' + dateStart + '"'})`;
	return fetchGraphQL(
		auth,
		`query {
			user(login: "${login}"){
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
	);
};
