import { parse } from 'cookie';
import { getTunes } from '$modules/getTunes';

export async function load() {
  // Fetch tunes data using the existing getTunes function
  const tunes = await getTunes();
  
  // Get cookies - client-side only
  const cookies = typeof document !== 'undefined' ? parse(document.cookie) : {};
  
  // Extract form values from cookies with defaults
  const formValues = {
    rememberName: cookies.rememberName || 'notSelected',
    rememberMelody: cookies.rememberMelody || 'notSelected',
    selectedRhythm: cookies.selectedRhythm || 'notSelected', 
    sortBy: cookies.sortBy || 'sort_by_number_asc',
    onlyFavorite: cookies.onlyFavorite || 'off'
  };

  return {
    tunes,
    formValues
  };
}