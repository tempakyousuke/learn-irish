import { SetRepository } from '$data/repositories/setRepository';
import { error } from '@sveltejs/kit';

export async function load({ params }: { params: { id: string } }) {
	try {
		const set = await SetRepository.getSetById(params.id);
		
		if (!set) {
			throw error(404, 'セットが見つかりません');
		}
		
		return {
			set
		};
	} catch (err) {
		console.error('セット取得エラー:', err);
		throw error(500, 'セットの取得に失敗しました');
	}
}