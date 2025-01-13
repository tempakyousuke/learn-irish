<script lang="ts">
	import '../app.css';
	import { onAuthStateChanged, signOut } from 'firebase/auth';
	import { userStore } from '$modules/store';
	import { app, auth } from '$modules/firebase';
	import { getAnalytics } from 'firebase/analytics';
	import Fa from 'svelte-fa';
	import { faClover } from '@fortawesome/free-solid-svg-icons';

	const logout = () => {
		signOut(auth);
	};

	let loaded = false;
	let isLoggedIn = false;
	let drawer = false;
	onAuthStateChanged(auth, async (firebaseUser) => {
		if (firebaseUser) {
			// const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
			// if (userDoc.exists()) {
			// 	const userData = userDoc.data();
			userStore.set({
				uid: firebaseUser.uid,
				isLoggedIn: true
			});
			// }
		} else {
			userStore.set({
				uid: '',
				isLoggedIn: false
			});
		}
	});
	userStore.subscribe((user) => {
		isLoggedIn = user.isLoggedIn;
		loaded = true;
	});
	getAnalytics(app);

	const openDrawer = () => {
		drawer = true;
	};
	const closeDrawer = (event: MouseEvent) => {
		if ((event.target as HTMLElement).classList.contains('drawer-overlay')) {
			drawer = false;
		}
	};
</script>

<div class="app">
	<header class="flex border-b bg-teal-800 md:px-10 pl-4 py-2">
		<a href="/" class="text-white text-3xl grow my-auto flex">
			<Fa class="mr-3 mt-0.5 md:block hidden" icon={faClover} />
			<button
				class="md:hidden bg-white rounded-lg py-1 px-1 mr-4 shadow-lg border"
				on:click={openDrawer}
			>
				<Fa class="text-teal-800" icon={faClover} />
			</button>
			Learn Irish from hatao's youtube</a
		>
		<a
			href="/about"
			class="text-white text-2xl ml-3 py-5 border-b-2 border-teal-800 hover:border-white hidden md:block"
			>About</a
		>
		{#if loaded && !isLoggedIn}
			<a
				href="/signin"
				class="text-white text-2xl ml-3 py-5 border-b-2 border-teal-800 hover:border-white hidden md:block"
				>ログイン</a
			>
			<a
				href="/signup"
				class="text-white text-2xl ml-3 py-5 border-b-2 border-teal-800 hover:border-white hidden md:block"
				>新規登録</a
			>
		{/if}
		{#if loaded && isLoggedIn}
			<button
				class="text-white text-2xl ml-3 py-5 border-b-2 border-teal-800 hover:border-white hidden md:block"
				on:click={logout}>ログアウト</button
			>
		{/if}
	</header>

	<div class="flex h-screen absolute top-0">
		<!-- Drawer -->
		<button
			class="fixed block inset-0 z-40 transition-transform transform bg-gray-900 bg-opacity-50 drawer-overlay"
			class:-translate-x-full={!drawer}
			on:click={closeDrawer}
		>
			<button
				class="fixed flex inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform"
				class:-translate-x-full={!drawer}
				on:click|stopPropagation
			>
				<div class="p-4 w-full">
					<h2 class="text-lg font-bold">Learn Irish</h2>
					<ul class="mt-4 space-y-2">
						<li><a href="/" class="block px-4 py-2 rounded hover:bg-gray-100">TOP</a></li>
						<li><a href="/About" class="block px-4 py-2 rounded hover:bg-gray-100">About</a></li>
						{#if loaded && !isLoggedIn}
							<li>
								<a href="/signin" class="block px-4 py-2 rounded hover:bg-gray-100">ログイン</a>
							</li>
							<li>
								<a href="/signup" class="block px-4 py-2 rounded hover:bg-gray-100">新規登録</a>
							</li>
						{/if}
						{#if loaded && isLoggedIn}
							<li>
								<button class="inline px-4 py-2 rounded hover:bg-gray-100" on:click={logout}
									>ログアウト</button
								>
							</li>
						{/if}
					</ul>
				</div>
			</button>
		</button>
	</div>
	<main class="bg-teal-50 min-h-screen pt-10">
		<slot />
	</main>
	<footer class="pt-5 bg-teal-50"></footer>
</div>
