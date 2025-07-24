<script lang="ts">
	import { TuneRepository } from '$core/data/repositories/tuneRepository';
	import type { SetFull } from '$core/data/models/Set';
	import type { TuneFull } from '$core/data/models/Tune';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import Fa from 'svelte-fa';
	import {
		faTrash,
		faArrowUp,
		faArrowDown,
		faPaste,
		faInfoCircle,
		faExternalLinkAlt
	} from '@fortawesome/free-solid-svg-icons';
	import {
		parseSpreadsheetData,
		matchTunesWithDatabase,
		getSpreadsheetExample
	} from '$core/utils/spreadsheetParser';

	const {
		set = null,
		mode = 'create',
		onSubmit,
		onCancel
	}: {
		set?: Partial<SetFull> | null;
		mode?: 'create' | 'edit';
		onSubmit?: (payload: { setData: any; tuneIds: string[] }) => void;
		onCancel?: () => void;
	} = $props();

	// コールバックが渡されなかった場合に備えて no-op を用意
	const onSubmitCallback = onSubmit ?? (() => {});
	const onCancelCallback = onCancel ?? (() => {});

	// フォームデータ
	let formData = $state({
		name: '',
		videoLink: '',
		description: '',
		setNo: ''
	});

	let selectedTuneIds = $state<string[]>([]);
	let allTunes = $state<TuneFull[]>([]);
	let searchQuery = $state('');
	let loading = $state(true);
	let showHelp = $state(false);

	// 検索フィルタリング
	let filteredTunes = $derived(
		searchQuery
			? allTunes.filter(
					(tune) =>
						tune.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
						tune.tuneNo.toString().includes(searchQuery) ||
						(tune.rhythm && tune.rhythm.toLowerCase().includes(searchQuery.toLowerCase()))
				)
			: allTunes
	);

	// 既存セットの場合は初期値を設定
	$effect(() => {
		if (set && mode === 'edit') {
			formData = {
				name: set.name || '',
				videoLink: set.videoLink || '',
				description: set.description || '',
				setNo: set.setNo || ''
			};
			selectedTuneIds = [...(set.tuneIds || [])];
		}
	});

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
		selectedTuneIds = selectedTuneIds.filter((id) => id !== tuneId);
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
		const tune = allTunes.find((t) => t.id === tuneId);
		return tune ? tune.name : `未知の曲(${tuneId})`;
	};

	const getTune = (tuneId: string): TuneFull | undefined => {
		return allTunes.find((t) => t.id === tuneId);
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

		// コールバックで親へ通知
		onSubmitCallback({
			setData: {
				id: set?.id || '',
				...formData
			},
			tuneIds: selectedTuneIds
		});
	};

	const handleCancel = () => {
		onCancelCallback();
	};

	// HTMLからYouTube動画リンクを抽出する関数
	const extractVideoLinksFromHTML = (html: string): string[] => {
		const videoLinks: string[] = [];
		const linkPattern = /https:\/\/youtu\.be\/[a-zA-Z0-9_-]+/g;
		const matches = html.match(linkPattern);
		if (matches) {
			videoLinks.push(...matches);
		}
		return videoLinks;
	};

	// HTMLをテキスト形式に変換する関数
	const convertHTMLToText = (html: string): string => {
		// HTMLテーブルをタブ区切りテキストに変換
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, 'text/html');
		const table = doc.querySelector('table');

		if (table) {
			const rows = table.querySelectorAll('tr');
			const textLines: string[] = [];

			rows.forEach((row) => {
				const cells = row.querySelectorAll('td');
				const cellTexts = Array.from(cells).map((cell) => cell.textContent?.trim() || '');
				textLines.push(cellTexts.join('\t'));
			});

			return textLines.join('\n');
		}

		return html;
	};

	const processClipboardData = (data: string) => {
		if (!data.trim()) {
			toast.error('データが空です');
			return;
		}

		const parsedData = parseSpreadsheetData(data);
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
			toast.warning(
				`${matchedTuneIds.length}曲がマッチしました。${unmatchedCount}曲は見つかりませんでした。`
			);
		} else {
			toast.success(`${matchedTuneIds.length}曲のデータを取り込みました！`);
		}
	};

	// 自動データ取り込み - クリップボードから直接データを読み取って処理
	const handleAutoImport = async () => {
		try {
			const clipboardItems = await navigator.clipboard.read();
			for (const clipboardItem of clipboardItems) {
				let dataToProcess = '';

				// HTML形式のデータを優先的に取得
				if (clipboardItem.types.includes('text/html')) {
					const htmlBlob = await clipboardItem.getType('text/html');
					const htmlText = await htmlBlob.text();

					// HTMLから動画リンクを抽出
					const videoLinks = extractVideoLinksFromHTML(htmlText);
					if (videoLinks.length > 0) {
						// 複数の動画リンクがある場合は最初のものを使用
						formData.videoLink = videoLinks[0];
					}

					// HTMLをテキストに変換
					dataToProcess = convertHTMLToText(htmlText);
				}
				// HTML形式がない場合はテキスト形式を使用
				else if (clipboardItem.types.includes('text/plain')) {
					const textBlob = await clipboardItem.getType('text/plain');
					dataToProcess = await textBlob.text();
				}

				if (dataToProcess) {
					processClipboardData(dataToProcess);
					return;
				}
			}

			toast.error('クリップボードにデータが見つかりませんでした');
		} catch (error) {
			console.error('クリップボードの読み取りに失敗しました:', error);
			toast.error('クリップボードの読み取りに失敗しました。手動で貼り付けてください。');
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
					onclick={() => (showHelp = !showHelp)}
					class="text-blue-600 hover:text-blue-800 p-1"
					title="ヘルプ"
				>
					<Fa icon={faInfoCircle} />
				</button>
				<button
					onclick={handleAutoImport}
					class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
					title="クリップボードから自動取り込み"
				>
					<Fa icon={faPaste} size="sm" />
					<span>自動取り込み</span>
				</button>
			</div>
		</div>

		{#if showHelp}
			<div class="bg-white border border-blue-200 rounded p-4 mb-4 text-sm">
				<h4 class="font-medium text-blue-800 mb-2">使い方:</h4>
				<ol class="list-decimal list-inside space-y-1 text-gray-700">
					<li>Google Sheetsで同じセット番号の行を選択</li>
					<li>Ctrl+C (Cmd+C) でコピー</li>
					<li>「自動取り込み」ボタンをクリック</li>
				</ol>
				<div class="mt-3 text-xs text-gray-600 bg-gray-50 p-2 rounded">
					<pre>{getSpreadsheetExample()}</pre>
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
				<label for="setNo" class="block text-sm font-medium text-gray-700 mb-1"> セット番号 </label>
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
			<div class="flex space-x-2">
				<input
					id="videoLink"
					type="url"
					bind:value={formData.videoLink}
					class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
					placeholder="https://www.youtube.com/watch?v=..."
					required
				/>
				<button
					type="button"
					onclick={() => window.open(formData.videoLink, '_blank')}
					disabled={!formData.videoLink.trim()}
					class="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm flex items-center space-x-1"
					title="新しいタブで開く"
				>
					<Fa icon={faExternalLinkAlt} size="sm" />
				</button>
			</div>
		</div>

		<div class="mt-4">
			<label for="description" class="block text-sm font-medium text-gray-700 mb-1"> 説明 </label>
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
								onclick={() => moveTuneUp(index)}
								disabled={index === 0}
								class="p-1 text-gray-500 hover:text-teal-600 disabled:opacity-50"
								title="上に移動"
							>
								<Fa icon={faArrowUp} size="sm" />
							</button>
							<button
								onclick={() => moveTuneDown(index)}
								disabled={index === selectedTuneIds.length - 1}
								class="p-1 text-gray-500 hover:text-teal-600 disabled:opacity-50"
								title="下に移動"
							>
								<Fa icon={faArrowDown} size="sm" />
							</button>
							<button
								onclick={() => removeTune(tuneId)}
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
					<div
						class="flex items-center justify-between p-3 border rounded-lg {isSelected
							? 'bg-teal-50 border-teal-200'
							: 'hover:bg-gray-50'}"
					>
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
							onclick={() => (isSelected ? removeTune(tune.id) : addTune(tune.id))}
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
			onclick={handleCancel}
			class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
		>
			キャンセル
		</button>
		<button
			onclick={handleSubmit}
			class="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
		>
			{mode === 'create' ? '作成' : '更新'}
		</button>
	</div>
</div>
