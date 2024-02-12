<script lang="ts">
	import '../app.css';
	import { onAuthStateChanged, signOut } from 'firebase/auth';
	import { userStore } from '$modules/store';
	import { app, auth } from '$modules/firebase';
	import { getAnalytics } from 'firebase/analytics';

	const logout = () => {
		signOut(auth);
	};

	let loaded = false;
	let isLoggedIn = false;
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
</script>

<div class="app">
	<header class="flex border-b bg-teal-800 px-10">
		<div class="text-white text-3xl grow my-auto">Learn Irish from hatao's youtube</div>
		<a
			href="/about"
			class="text-white text-2xl ml-3 py-5 border-b-2 border-teal-800 hover:border-white">About</a
		>
		{#if loaded && !isLoggedIn}
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
		{/if}
		{#if loaded && isLoggedIn}
			<button
				class="text-white text-2xl ml-3 py-5 border-b-2 border-teal-800 hover:border-white"
				on:click={logout}>ログアウト</button
			>
		{/if}
	</header>
	<main class="bg-teal-100 min-h-screen">
		<slot />
	</main>
</div>
