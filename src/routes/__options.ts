import { derived } from 'svelte/store';
import { t } from 'svelte-i18n';

export const rememberNameOption = derived(t, ($t) => [
	{
		label: $t('unselected'),
		value: 'notSelected',
		id: 'rememberName1'
	},
	{
		label: $t('memorized'),
		value: 'yes',
		id: 'rememberName2'
	},
	{
		label: $t('not_memorized'),
		value: 'no',
		id: 'rememberName3'
	}
]);

export const rememberMelodyOption = derived(t, ($t) => [
	{
		label: $t('unselected'),
		value: 'notSelected',
		id: 'rememberMelody1'
	},
	{
		label: $t('memorized'),
		value: 'yes',
		id: 'rememberMelody2'
	},
	{
		label: $t('not_memorized'),
		value: 'no',
		id: 'rememberMelody3'
	}
]);

export const onlyFavoriteOption = derived(t, () => [
	{
		label: 'ON',
		value: 'on',
		id: 'onlyFavorite1'
	},
	{
		label: 'OFF',
		value: 'off',
		id: 'onlyFavorite2'
	}
]);

export const sortByOption = derived(t, ($t) => [
	{ label: $t('sort_no_asc'), value: 'sort_by_number_asc', id: 'sortByNumber_asc' },
	{ label: $t('sort_no_desc'), value: 'sort_by_number_desc', id: 'sortByNumber_desc' },
	{ label: $t('sort_name_asc'), value: 'sort_by_name_asc', id: 'sortByName_asc' },
	{ label: $t('sort_name_desc'), value: 'sort_by_name_desc', id: 'sortByName_desc' },
	{ label: $t('sort_key_asc'), value: 'sort_by_key_asc', id: 'sortByKey_asc' },
	{ label: $t('sort_key_desc'), value: 'sort_by_key_desc', id: 'sortByKey_desc' },
	{ label: $t('sort_playcount_asc'), value: 'sort_by_playcount_asc', id: 'sortByPlaycount_asc' },
	{ label: $t('sort_playcount_desc'), value: 'sort_by_playcount_desc', id: 'sortByPlaycount_desc' },
	{ label: $t('sort_lastplayed_asc'), value: 'sort_by_lastplayed_asc', id: 'sortByLastplayed_asc' },
	{
		label: $t('sort_lastplayed_desc'),
		value: 'sort_by_lastplayed_desc',
		id: 'sortByLastplayed_desc'
	}
]);

export const sortByOptionLoggedOut = derived(t, ($t) => [
	{ label: $t('sort_no_asc'), value: 'sort_by_number_asc', id: 'sortByNumber_asc' },
	{ label: $t('sort_no_desc'), value: 'sort_by_number_desc', id: 'sortByNumber_desc' },
	{ label: $t('sort_name_asc'), value: 'sort_by_name_asc', id: 'sortByName_asc' },
	{ label: $t('sort_name_desc'), value: 'sort_by_name_desc', id: 'sortByName_desc' },
	{ label: $t('sort_key_asc'), value: 'sort_by_key_asc', id: 'sortByKey_asc' },
	{ label: $t('sort_key_desc'), value: 'sort_by_key_desc', id: 'sortByKey_desc' }
]);
