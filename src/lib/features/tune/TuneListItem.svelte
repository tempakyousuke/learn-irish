<script lang="ts">
	import type { TuneFull } from '$core/data/models/Tune';

	let { tune }: { tune: TuneFull } = $props();
</script>

<div class="border py-2 border-teal-300">
	<a href="/tune/{tune.id}">
		{tune.name}
	</a>
</div>
