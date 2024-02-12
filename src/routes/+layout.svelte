<script>
	import '../app.css';
</script>

<div class="app">
	<header class="flex border-b bg-teal-800 px-10">
		<div class="text-white text-3xl grow my-auto">Learn Irish from hatao's youtube</div>
		<a
			href="/about"
			class="text-white text-2xl ml-3 py-5 border-b-2 border-teal-800 hover:border-white">About</a
		>
		<a
			href="/signin"
			class="text-white text-2xl ml-3 py-5 border-b-2 border-teal-800 hover:border-white"
			>ログイン</a
		>
		<a
			href="/signup"
			class="text-white text-2xl ml-3 py-5 border-b-2 border-teal-800 hover:border-white"
			>新規登録</a
		>
	</header>
	<main class="bg-teal-100 min-h-screen">
		<slot />
	</main>
</div>
