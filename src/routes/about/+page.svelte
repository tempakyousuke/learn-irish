<script lang="ts">
	import TunePage from '$lib/assets/tune_page.png';
	import PracticeRecord from '$lib/assets/practice_record.png';
</script>

<div class="md:w-[50rem] w-11/12 mx-auto">
	<h2 class="text-3xl font-bold">当サイトについて</h2>
	<div class="mt-5 text-xl">
		このサイトはhataoさんがyoutubeにあげている「Learn an Irish Tune Every
		Day」の動画を探しやすく、また自分の練習の進捗を記録してモチベーションを上げるために作成しました。
	</div>
	<h2 class="mt-10 text-3xl font-bold">製作者</h2>
	<div class="mt-5 text-xl">丸山恭輔</div>

	<h2 class="mt-10 text-3xl font-bold">機能について</h2>
	<div class="mt-5 img-wrapper">
		<img class="img" src={TunePage} alt="動画ページ画像" />
		<p class="img-text">
			ログインすると上の画像のように名前やメロディーを覚えたことや、演奏した回数など、自分の練習の記録を残せるようになります。
		</p>
	</div>
	<div class="img-wrapper">
		<img class="img" src={PracticeRecord} alt="練習記録画像" />
		<p class="img-text">
			トップページで名前を覚えた曲の総数やメロディーを覚えた曲の総数を確認できる他、その日に練習した曲の一覧を確認できます。
		</p>
	</div>
</div>

<style lang="postcss">
	.img-wrapper {
		@apply border bg-white mx-auto md:w-[50rem] w-11/12 py-10 rounded-lg shadow-lg mt-10;
	}
	.img {
		@apply md:w-[40rem] w-11/12 mx-auto;
	}
	.img-text {
		@apply md:w-[40rem] w-11/12 mx-auto mt-10 text-left text-xl;
	}
</style>
