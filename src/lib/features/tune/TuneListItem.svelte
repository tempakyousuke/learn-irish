<script lang="ts">
	import type { Tune } from '$core/data/models/Tune';
	export let tune!: Tune;
</script>

<div class="border py-2 border-teal-300">
	<a href="/tune/{tune.id}">
		{tune.name}
	</a>
</div>
