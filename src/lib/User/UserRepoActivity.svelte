<script lang="ts">
import { onMount } from "svelte";


	let timelineBegin = new Date('2020-08-26T19:29:09Z');
	let timelineEnd = new Date();

	const daysOfAccount = (start: Date, end: Date) =>
		(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
	const dayOfYear = (date: Date) =>
		Math.floor(
			1 + (date.getTime() - new Date(String(date.getFullYear())).getTime()) / (1000 * 60 * 60 * 24)
		);
	const fullYearsInRange = (start: Date, end: Date) => {
		let max = end.getFullYear();
		let min = start.getFullYear() + 1;
		let years = [];
		for (let i = min; i <= max; i++) {
			years.push(i);
		}
		return years;
	};
	onMount(() => {
	  const years = document.getElementsByClassName("timeline-overlay-year");
	  const length = daysOfAccount(timelineBegin, timelineEnd);
	  const yearLength = 365;
	  const beforeFirst = dayOfYear(timelineBegin);
	  for (let i = 0; i < years.length; i++) {
	    let year = years[i];
	    (year as HTMLElement).style.left = `${(beforeFirst + (i*yearLength))/length*100}%`
	  }
	  const widthOfDay = 1/length;
	})
</script>

<div class="user-repo-activity box">
	<div class="timeline-wrapper">
		<div class="timeline box-dark">
			<div class="data-wrapper">
				<div class="overlay">
					<div class="years">
						{#each fullYearsInRange(timelineBegin, timelineEnd) as year}
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
		min-width: 400px;

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
