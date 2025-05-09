<script lang="ts">
	export let title: string;
	export let value: string | number;
</script>

<div class="col-span-2 border-2 rounded-xl border-teal-200 p-4 bg-white shadow-md">
	<div class="md:text-2xl text-xl text-center">{title}</div>
	<div class="mt-2 mx-auto bg-teal-100 rounded-xl text-4xl py-2 text-center max-w-56">
		{value}
	</div>
</div>
