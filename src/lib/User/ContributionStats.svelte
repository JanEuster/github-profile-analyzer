<script lang="ts">
	import type { ContributionData } from '$lib/types';
	import { dateInRange, months, weekdays } from '$lib/utils/date';
	import type { GraphQlQueryResponseData } from '@octokit/graphql';

	export let contributionData: ContributionData;
	export let contributionDataPerYear: GraphQlQueryResponseData;
	export let selectedStart: Date;
	export let selectedEnd: Date;
	let monthAverages: number[] = new Array(12).fill(0);
	let weekdayAverages: number[] = new Array(7).fill(0);

	// get month & weekday averages
	let days = 0;
	for (const week of contributionData.weeks) {
		for (const day of week.contributionDays) {
			let date = new Date(day.date);
			if (dateInRange(selectedStart, selectedEnd, date)) {
				weekdayAverages[date.getDay()] += day.contributionCount;
				monthAverages[date.getMonth()] += day.contributionCount;
				days += 1;
			}
		}
	}
	monthAverages.forEach(
		(monthTotal, i) => (monthAverages[i] = Math.round(((10 * monthTotal) / days) * 12) / 10)
	);
	weekdayAverages.forEach(
		(weekdayTotal, i) => (weekdayAverages[i] = Math.round(((10 * weekdayTotal) / days) * 7) / 10)
	);
	const getWidthStr = (part: number, total: number): string => {
		const width = Math.round((100 * part) / total);
		const widthStr = `--width: ${width}%`;
		let color = 'var(--c-green)';
		if (width <= 25) {
			color = 'var(--c-green-20)';
		} else if (width <= 45) {
			color = 'var(--c-green-40)';
		} else if (width <= 65) {
			color = 'var(--c-green-60)';
		} else if (width <= 90) {
			color = 'var(--c-green-80)';
		}
		const colorStr = `--bar-color: ${color}`;
		return `${widthStr}; ${colorStr};`;
	};
</script>

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
			<div class="stat-group">
				<div class="stat-small">
					<span>Total Contributions</span>
					<div>
						<span class="number">
							{contributionData.totals.total}
						</span>
						<div class="bar" style={getWidthStr(1, 1)} />
					</div>
				</div>
				<div class="stat-small">
					<span>Contributions This Year</span>
					<div>
						<span class="number">
							{contributionDataPerYear[contributionDataPerYear.length - 1].contributionCalendar
								.totalContributions}
						</span>
						<div
							class="bar"
							style={getWidthStr(
								contributionDataPerYear[contributionDataPerYear.length - 1].contributionCalendar
									.totalContributions,
								contributionData.totals.total
							)}
						/>
					</div>
				</div>
			</div>
			<div class="stat-group">
				<div class="stat-small">
					<span>Total Commits</span>
					<div>
						<span class="number">
							{contributionData.totals.commits.total}
						</span>
						<div class="bar" style={getWidthStr(1, 1)} />
					</div>
				</div>
				<div class="stat-small">
					<span>Commits This Year</span>
					<div>
						<span class="number">
							{contributionDataPerYear[contributionDataPerYear.length - 1].totalCommitContributions}
						</span>
						<div
							class="bar"
							style={getWidthStr(
								contributionDataPerYear[contributionDataPerYear.length - 1]
									.totalCommitContributions,
								contributionData.totals.commits.total
							)}
						/>
					</div>
				</div>
			</div>
		</div>
		<hr />
	</div>
	<div class="stats-averages">
		<div class="averages-month">
			<h5>Month Average</h5>
			{#each months as month, i}
				<div class="stat-small">
					<span>{month}</span>
					<div>
						<span class="number">
							{monthAverages[i]}
						</span>
						<div class="bar" style={getWidthStr(monthAverages[i], Math.max(...monthAverages))} />
					</div>
				</div>
			{/each}
		</div>
		<div class="averages-weekday">
			<h5>Weekday Average</h5>
			{#each weekdays as day, i}
				<div class="stat-small">
					<span>{day}</span>
					<div>
						<span class="number">
							{weekdayAverages[i]}
						</span>
						<div
							class="bar"
							style={getWidthStr(weekdayAverages[i], Math.max(...weekdayAverages))}
						/>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style lang="scss">
	hr {
		height: 1px;
		background-color: var(--c-grey);
	}
	.stats {
		display: flex;
		flex-direction: column;
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
					background-color: var(--bar-color);
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
			padding: 4px 0;
			display: flex;
			flex-direction: column;
		}
		.stat-small {
			margin: 2px 0;
		}
	}
	.stats-averages {
		padding: 6px 2px;
		display: flex;
		gap: 15px;
		& > * {
			width: 135px;
			h5 {
				margin-bottom: 4px;
			}
			.stat-small {
				padding: 2px 0;
			}
		}
	}
</style>
