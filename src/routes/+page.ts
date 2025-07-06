import { parse } from 'cookie';
import { getTunes } from '$core/data/repositories/tuneRepository';

export const ssr = false;

export async function load({ url }: { url: URL }) {
	// Check for cache refresh parameter
	const forceRefresh = url.searchParams.has('refresh');

	// Fetch tunes data using the existing getTunes function
	const tunes = await getTunes(forceRefresh);

	// Get cookies - client-side only
	const cookies = typeof document !== 'undefined' ? parse(document.cookie) : {};

	// Extract form values from cookies with defaults
	const formValues = {
		rememberName: cookies.rememberName || 'notSelected',
		rememberMelody: cookies.rememberMelody || 'notSelected',
		selectedRhythm: cookies.selectedRhythm || 'notSelected',
		sortBy: cookies.sortBy || 'sort_by_number_asc',
		onlyFavorite: cookies.onlyFavorite || 'off',
		currentPage: cookies.currentPage || '1',
		itemsPerPage: cookies.itemsPerPage || '20'
	};

	return {
		tunes,
		formValues
	};
}
