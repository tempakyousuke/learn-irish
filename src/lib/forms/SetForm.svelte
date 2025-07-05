<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { TuneRepository } from '$data/repositories/tuneRepository';
	import type { SetFull } from '$data/models/Set';
	import type { TuneFull } from '$data/models/Tune';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import Fa from 'svelte-fa';
	import { faTrash, faArrowUp, faArrowDown, faPaste, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
	import { parseSpreadsheetData, matchTunesWithDatabase, getSpreadsheetExample } from '$core/utils/spreadsheetParser';

	export let set: Partial<SetFull> | null = null;
	export let mode: 'create' | 'edit' = 'create';

	const dispatch = createEventDispatcher();

	// フォームデータ
	let formData = {
		name: '',
		videoLink: '',
		description: '',
		setNo: ''
	};

	let selectedTuneIds: string[] = [];
	let allTunes: TuneFull[] = [];
	let filteredTunes: TuneFull[] = [];
	let searchQuery = '';
	let loading = true;
	let pasteText = '';
	let showPasteArea = false;
	let showHelp = false;

	// 既存セットの場合は初期値を設定
	$: if (set && mode === 'edit') {
		formData = {
			name: set.name || '',
			videoLink: set.videoLink || '',
			description: set.description || '',
			setNo: set.setNo || ''
		};
		selectedTuneIds = [...(set.tuneIds || [])];
	}

	// 検索フィルタリング
	$: if (searchQuery) {
		filteredTunes = allTunes.filter(tune =>
			tune.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			tune.tuneNo.toString().includes(searchQuery) ||
			(tune.rhythm && tune.rhythm.toLowerCase().includes(searchQuery.toLowerCase()))
		);
	} else {
		filteredTunes = allTunes;
	}

	onMount(async () => {
		try {
			allTunes = await TuneRepository.getTunes();
		} catch (error) {
			console.error('曲データ取得エラー:', error);
			toast.error('曲データの取得に失敗しました');
		} finally {
			loading = false;
		}
	});

	const addTune = (tuneId: string) => {
		if (!selectedTuneIds.includes(tuneId)) {
			selectedTuneIds = [...selectedTuneIds, tuneId];
		}
	};

	const removeTune = (tuneId: string) => {
		selectedTuneIds = selectedTuneIds.filter(id => id !== tuneId);
	};

	const moveTuneUp = (index: number) => {
		if (index > 0) {
			const newArray = [...selectedTuneIds];
			[newArray[index], newArray[index - 1]] = [newArray[index - 1], newArray[index]];
			selectedTuneIds = newArray;
		}
	};

	const moveTuneDown = (index: number) => {
		if (index < selectedTuneIds.length - 1) {
			const newArray = [...selectedTuneIds];
			[newArray[index], newArray[index + 1]] = [newArray[index + 1], newArray[index]];
			selectedTuneIds = newArray;
		}
	};

	const getTuneName = (tuneId: string): string => {
		const tune = allTunes.find(t => t.id === tuneId);
		return tune ? tune.name : `未知の曲(${tuneId})`;
	};

	const getTune = (tuneId: string): TuneFull | undefined => {
		return allTunes.find(t => t.id === tuneId);
	};

	const handleSubmit = () => {
		// バリデーション
		if (!formData.name.trim()) {
			toast.error('セット名を入力してください');
			return;
		}

		if (!formData.videoLink.trim()) {
			toast.error('動画リンクを入力してください');
			return;
		}

		if (selectedTuneIds.length === 0) {
			toast.error('少なくとも1曲を選択してください');
			return;
		}

		// データを送信
		dispatch('submit', {
			setData: {
				id: set?.id || '',
				...formData
			},
			tuneIds: selectedTuneIds
		});
	};

	const handleCancel = () => {
		dispatch('cancel');
	};

	const handlePasteData = () => {
		if (!pasteText.trim()) {
			toast.error('貼り付けるデータを入力してください');
			return;
		}

		const parsedData = parseSpreadsheetData(pasteText);
		if (!parsedData) {
			toast.error('データの解析に失敗しました。正しい形式で貼り付けてください');
			return;
		}

		// フォームデータを更新（名前、説明、動画リンクは既存の値を保持）
		formData = {
			name: formData.name || '', // 既存の値を保持、なければ空文字
			videoLink: formData.videoLink || '', // 既存の値を保持、なければ空文字
			description: formData.description || '', // 既存の値を保持、なければ空文字
			setNo: parsedData.setNo // Set Noのみ更新
		};

		// 曲データとマッチング
		const matchedTuneIds = matchTunesWithDatabase(parsedData.tunes, allTunes);
		selectedTuneIds = matchedTuneIds;

		// 結果を表示
		const unmatchedCount = parsedData.tunes.length - matchedTuneIds.length;
		if (unmatchedCount > 0) {
			toast.warning(`${matchedTuneIds.length}曲がマッチしました。${unmatchedCount}曲は見つかりませんでした。`);
		} else {
			toast.success(`${matchedTuneIds.length}曲のデータを取り込みました！`);
		}

		// 貼り付けエリアを閉じる
		showPasteArea = false;
		pasteText = '';
	};

	const togglePasteArea = () => {
		showPasteArea = !showPasteArea;
		if (!showPasteArea) {
			pasteText = '';
		}
	};
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<!-- スプレッドシート貼り付けエリア -->
	<div class="bg-blue-50 rounded-lg shadow-md p-6">
		<div class="flex items-center justify-between mb-4">
			<h3 class="text-lg font-semibold text-blue-800">スプレッドシートからデータ取り込み</h3>
			<div class="flex space-x-2">
				<button
					on:click={() => showHelp = !showHelp}
					class="text-blue-600 hover:text-blue-800 p-1"
					title="ヘルプ"
				>
					<Fa icon={faInfoCircle} />
				</button>
				<button
					on:click={togglePasteArea}
					class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
				>
					<Fa icon={faPaste} size="sm" />
					<span>{showPasteArea ? '閉じる' : '貼り付け'}</span>
				</button>
			</div>
		</div>

		{#if showHelp}
			<div class="bg-white border border-blue-200 rounded p-4 mb-4 text-sm">
				<h4 class="font-medium text-blue-800 mb-2">使い方:</h4>
				<ol class="list-decimal list-inside space-y-1 text-gray-700">
					<li>Google Sheetsで同じセット番号の行を選択</li>
					<li>Ctrl+C (Cmd+C) でコピー</li>
					<li>下のテキストエリアにCtrl+V (Cmd+V) で貼り付け</li>
					<li>「データを取り込む」ボタンをクリック</li>
				</ol>
				<div class="mt-3 text-xs text-gray-600 bg-gray-50 p-2 rounded">
					<pre>{getSpreadsheetExample()}</pre>
				</div>
			</div>
		{/if}

		{#if showPasteArea}
			<div class="space-y-3">
				<textarea
					bind:value={pasteText}
					placeholder="Google Sheetsからコピーしたデータをここに貼り付けてください..."
					class="w-full h-32 border border-blue-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
				></textarea>
				<div class="flex justify-end space-x-2">
					<button
						on:click={() => pasteText = ''}
						class="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
					>
						クリア
					</button>
					<button
						on:click={handlePasteData}
						class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm"
						disabled={!pasteText.trim()}
					>
						データを取り込む
					</button>
				</div>
			</div>
		{/if}
	</div>

	<!-- セット基本情報 -->
	<div class="bg-white rounded-lg shadow-md p-6">
		<h3 class="text-lg font-semibold text-teal-800 mb-4">セット基本情報</h3>
		
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<label for="name" class="block text-sm font-medium text-gray-700 mb-1">
					セット名 <span class="text-red-500">*</span>
				</label>
				<input
					id="name"
					type="text"
					bind:value={formData.name}
					class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
					placeholder="例: Jigs Set #1"
					required
				/>
			</div>

			<div>
				<label for="setNo" class="block text-sm font-medium text-gray-700 mb-1">
					セット番号
				</label>
				<input
					id="setNo"
					type="text"
					bind:value={formData.setNo}
					class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
					placeholder="例: SET001, SET-A1"
				/>
			</div>
		</div>

		<div class="mt-4">
			<label for="videoLink" class="block text-sm font-medium text-gray-700 mb-1">
				動画リンク (YouTube URL) <span class="text-red-500">*</span>
			</label>
			<input
				id="videoLink"
				type="url"
				bind:value={formData.videoLink}
				class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
				placeholder="https://www.youtube.com/watch?v=..."
				required
			/>
		</div>

		<div class="mt-4">
			<label for="description" class="block text-sm font-medium text-gray-700 mb-1">
				説明
			</label>
			<textarea
				id="description"
				bind:value={formData.description}
				rows="3"
				class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
				placeholder="セットの説明を入力..."
			></textarea>
		</div>
	</div>

	<!-- 選択された曲リスト -->
	{#if selectedTuneIds.length > 0}
		<div class="bg-white rounded-lg shadow-md p-6">
			<h3 class="text-lg font-semibold text-teal-800 mb-4">
				選択された曲 ({selectedTuneIds.length}曲)
			</h3>
			
			<div class="space-y-2">
				{#each selectedTuneIds as tuneId, index}
					{@const tune = getTune(tuneId)}
					<div class="flex items-center space-x-3 p-3 bg-teal-50 rounded-lg">
						<span class="bg-teal-600 text-white text-sm px-2 py-1 rounded min-w-[32px] text-center">
							{index + 1}
						</span>
						
						<div class="flex-1">
							<div class="font-medium text-gray-900">
								{getTuneName(tuneId)}
							</div>
							{#if tune}
								<div class="text-sm text-gray-600">
									No.{tune.tuneNo}
									{#if tune.rhythm}
										• {tune.rhythm}
									{/if}
									{#if tune.key}
										• {tune.key}
									{/if}
								</div>
							{/if}
						</div>

						<div class="flex space-x-1">
							<button
								on:click={() => moveTuneUp(index)}
								disabled={index === 0}
								class="p-1 text-gray-500 hover:text-teal-600 disabled:opacity-50"
								title="上に移動"
							>
								<Fa icon={faArrowUp} size="sm" />
							</button>
							<button
								on:click={() => moveTuneDown(index)}
								disabled={index === selectedTuneIds.length - 1}
								class="p-1 text-gray-500 hover:text-teal-600 disabled:opacity-50"
								title="下に移動"
							>
								<Fa icon={faArrowDown} size="sm" />
							</button>
							<button
								on:click={() => removeTune(tuneId)}
								class="p-1 text-red-500 hover:text-red-700"
								title="削除"
							>
								<Fa icon={faTrash} size="sm" />
							</button>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- 曲選択 -->
	<div class="bg-white rounded-lg shadow-md p-6">
		<h3 class="text-lg font-semibold text-teal-800 mb-4">曲を選択</h3>
		
		<div class="mb-4">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="曲名、番号、リズムで検索..."
				class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
			/>
		</div>

		{#if loading}
			<div class="text-center py-4 text-gray-600">読み込み中...</div>
		{:else}
			<div class="max-h-96 overflow-y-auto space-y-2">
				{#each filteredTunes as tune}
					{@const isSelected = selectedTuneIds.includes(tune.id)}
					<div class="flex items-center justify-between p-3 border rounded-lg {isSelected ? 'bg-teal-50 border-teal-200' : 'hover:bg-gray-50'}">
						<div class="flex-1">
							<div class="font-medium text-gray-900">
								{tune.name}
							</div>
							<div class="text-sm text-gray-600">
								No.{tune.tuneNo}
								{#if tune.rhythm}
									• {tune.rhythm}
								{/if}
								{#if tune.key}
									• {tune.key}
								{/if}
							</div>
						</div>
						
						<button
							on:click={() => isSelected ? removeTune(tune.id) : addTune(tune.id)}
							class="px-3 py-1 rounded text-sm font-medium {isSelected 
								? 'bg-red-100 text-red-700 hover:bg-red-200' 
								: 'bg-teal-100 text-teal-700 hover:bg-teal-200'}"
						>
							{isSelected ? '削除' : '追加'}
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- アクションボタン -->
	<div class="flex justify-end space-x-4">
		<button
			on:click={handleCancel}
			class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
		>
			キャンセル
		</button>
		<button
			on:click={handleSubmit}
			class="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
		>
			{mode === 'create' ? '作成' : '更新'}
		</button>
	</div>
</div>