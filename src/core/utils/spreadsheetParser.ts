/**
 * スプレッドシートデータの解析ユーティリティ
 */

export interface SpreadsheetRow {
	tuneNo?: number;
	name?: string;
	rhythm?: string;
	key?: string;
	mode?: string;
	setNo?: string;
	videoLink?: string;
	// 他の必要なフィールドがあれば追加
}

export interface ParsedSetData {
	setNo: string;
	name: string;
	videoLink: string;
	description: string;
	tunes: SpreadsheetRow[];
}

/**
 * スプレッドシートからコピーしたテキストを解析する
 * 実際のスプレッドシート構造に合わせて調整
 * 列構成: A:Set No, B:Tune No, C:Tune Title, D:Learning Video, E:Genre, F:Added, G:Tune Type, H:Key, I:Mode...
 * @param pastedText 貼り付けられたテキスト
 * @returns 解析されたセットデータ
 */
export function parseSpreadsheetData(pastedText: string): ParsedSetData | null {
	try {
		// 改行で分割して行を取得
		const lines = pastedText.trim().split('\n');
		if (lines.length === 0) return null;

		const tunes: SpreadsheetRow[] = [];
		let setNo = '';

		lines.forEach((line) => {
			// タブ区切りで列を分割
			const columns = line.split('\t').map((col) => col.trim());

			if (columns.length < 3) return; // 最低限の列数をチェック

			// 実際のスプレッドシート構造に合わせて列を解析
			// A:Set No, B:Tune No, C:Tune Title, D:Learning Video, E:Genre, F:Added, G:Tune Type, H:Key, I:Mode
			const currentSetNo = columns[0] || ''; // A: Set No
			const tuneNoStr = columns[1] || ''; // B: Tune No
			const tuneName = columns[2] || ''; // C: Tune Title
			const tuneType = columns[6] || ''; // G: Tune Type (rhythm)
			const key = columns[7] || ''; // H: Key
			const mode = columns[8] || ''; // I: Mode

			// セット番号を取得（最初に見つかったものを使用）
			if (currentSetNo && !setNo && currentSetNo !== '') {
				setNo = currentSetNo;
			}

			// 曲番号の解析
			const tuneNo = parseInt(tuneNoStr);
			if (isNaN(tuneNo) || !tuneName) return;

			tunes.push({
				tuneNo,
				name: tuneName,
				rhythm: tuneType || undefined, // Tune Type列をrhythmとして使用
				key: key || undefined,
				mode: mode || undefined,
				setNo: currentSetNo || undefined
			});
		});

		if (tunes.length === 0) {
			return null;
		}

		// セット番号が取得できていない場合は最初の曲のセット番号を使用
		if (!setNo && tunes[0]?.setNo) {
			setNo = tunes[0].setNo;
		}

		return {
			setNo: setNo || '',
			name: '', // セット名は手動入力
			videoLink: '', // 動画リンクは手動入力
			description: '', // 説明は手動入力（現在未使用）
			tunes
		};
	} catch (error) {
		console.error('スプレッドシート解析エラー:', error);
		return null;
	}
}

/**
 * 曲データから既存の曲IDを検索する
 * @param spreadsheetTunes スプレッドシートから解析された曲データ
 * @param allTunes 既存の全曲データ
 * @returns マッチした曲IDの配列
 */
export function matchTunesWithDatabase(
	spreadsheetTunes: SpreadsheetRow[],
	allTunes: Array<{ id: string; tuneNo: number; name: string }>
): string[] {
	const matchedIds: string[] = [];

	spreadsheetTunes.forEach((spreadsheetTune) => {
		// 曲番号での完全一致を優先
		let matched = allTunes.find((tune) => tune.tuneNo === spreadsheetTune.tuneNo);

		// 曲番号でマッチしない場合は名前での部分一致
		if (!matched && spreadsheetTune.name) {
			matched = allTunes.find(
				(tune) =>
					tune.name.toLowerCase().includes(spreadsheetTune.name!.toLowerCase()) ||
					spreadsheetTune.name!.toLowerCase().includes(tune.name.toLowerCase())
			);
		}

		if (matched) {
			matchedIds.push(matched.id);
		}
	});

	return matchedIds;
}

/**
 * スプレッドシートデータの例を生成（ヘルプ用）
 */
export function getSpreadsheetExample(): string {
	return `例：スプレッドシートから以下のような形式でコピー&ペースト

SET001	1	The Maid Behind the Bar	[Learning Video]	[Genre]	[Added]	Reel	D	Major	[Part]...
SET001	2	The Wind That Shakes the Barley	[Learning Video]	[Genre]	[Added]	Reel	D	Major	[Part]...
SET001	3	The Silver Spear	[Learning Video]	[Genre]	[Added]	Reel	D	Major	[Part]...

※ 列構成: Set No | Tune No | Tune Title | Learning Video | Genre | Added | Tune Type | Key | Mode | ...
※ 動画リンクは手動で入力してください（C列のTune Titleにリンクが設定されている場合があります）
※ 同じSet Noの行をまとめて選択してコピーしてください。`;
}
