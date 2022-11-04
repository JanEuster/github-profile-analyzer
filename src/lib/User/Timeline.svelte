<script lang="ts">
	import { dayOfYear, daysBetween, fullYearsInRange } from '$lib/utils/date';
	import { onMount } from 'svelte';

	export let daysOfContribution: number[];
	export let timelineStart: Date;
	export let timelineEnd: Date;
	let isMounted = false;
	let years: number[] = [];


	const setTimelineData = (dOC: number[]) => {
		let node = document.getElementById('timeline-data');
		if (dOC && node) {
			// delete old children
			let notDay = [];
			for (const child of node?.children) {
				if (child.className != 'timeline-day') {
					notDay.push(child);
				}
			}
			node.innerHTML = '';
			notDay.forEach((elem) => node?.appendChild(elem));

			node = document.getElementById('timeline-data');
			// create new ones
			const maxContributions = Math.max(...dOC);
			dOC.forEach((day, i) => {
				const elem = document.createElement('div');
				elem.className = 'timeline-day';
				elem.setAttribute('name', String(i) + '-' + String(day));
				elem.style.backgroundColor = 'var(--c-green)';
				elem.style.width = '100%';
				elem.style.height = `${(100 * day) / maxContributions}%`;
				node?.appendChild(elem);
			});
		}
	};

	const setYears = () => {
		const years = document.getElementsByClassName('timeline-overlay-year');
		const length = daysBetween(timelineStart, timelineEnd) + 1;
		const beforeFirst = 365 - dayOfYear(timelineStart) + 1;
		for (let i = 0; i < years.length; i++) {
			let year = years[i];
			(year as HTMLElement).style.left = `${((beforeFirst + i * 365) / length) * 100}%`;
		}
	};

	// executes when prop daysOfContribution changes
	$: {
		if (isMounted) {
			setTimelineData(daysOfContribution);
			setYears();
		} 
		years = fullYearsInRange(timelineStart, timelineEnd);
	}
	onMount(() => {
		isMounted = true;
	});
</script>

<div class="timeline-wrapper">
	<div class="timeline box-dark">
		<div id="timeline-data" class="data-wrapper">
			<div class="overlay">
				<div class="years">
					{#each years as year}
						<span class="timeline-overlay-year">{year}</span>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
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
				justify-content: center;

				.overlay {
					position: absolute;
					top: -10px;
					left: 0;
					width: 100%;
					height: 100%;

					.years {
						position: relative;
						width: 100%;
						height: 10px;
						& > * {
							position: absolute;
							display: inline-block;
							font-size: 10px;
							transform: translate(-3%, -50%);
							text-align: center;
						}
					}
				}
			}
		}
	}
</style>
