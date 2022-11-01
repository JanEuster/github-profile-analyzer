<script lang="ts">
</script>

<div class="user-repo-activity box">
	<div class="timeline-wrapper">
		<div class="timeline box-dark">
			<div class="data-wrapper">
				<div class="overlay">
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
					}
				}
			}
		}
	}
</style>
