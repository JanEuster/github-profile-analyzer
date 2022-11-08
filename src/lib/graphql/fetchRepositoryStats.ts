import type { GraphQlQueryResponseData } from '@octokit/graphql';
import type { AuthenticationStore } from '$lib/types';
import { fetchGraphQL } from '$lib/utils/graphql';

export default async (
	auth: AuthenticationStore,
	login: string,
	repo: string
): Promise<GraphQlQueryResponseData> => {
	return fetchGraphQL(
		auth,
		`
		query {
			repository(name: "${repo}", owner: "${login}") {
        defaultBranchRef{
            target{
                ... on Commit {
                    history {
                        totalCount
                    }
                }
            }
        }
        issues {
            totalCount
        }
        pullRequests {
            totalCount
        }
  			name
  			nameWithOwner
    		createdAt
    		forkCount
    		parent {
    			nameWithOwner
    			name
    			owner {
    				login
    			}
    		}
				stargazerCount
				watchers {
					totalCount
				}
			}
		}
   `
	);
};

// query {
//		user(login: "${login}"){
//		  repositories(affiliations: COLLABORATOR, orderBy: {
//		    direction: DESC
//		    field: PUSHED_AT
//		  }, first: 30) {
//		    nodes {
//		    	name
//		    	nameWithOwner
//		      createdAt
//		      forkCount
//		    }
//		    totalCount
//		  }
//		}
// }
