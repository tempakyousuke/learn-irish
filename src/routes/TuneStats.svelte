<script lang="ts">
    import { t } from 'svelte-i18n';
    import type { Tune } from '../types/tune';

    export let tunes: Tune[] = [];
    export let rememberNameIds: string[] = [];
    export let rememberMelodyIds: string[] = [];
    export let totalCount: number = 0;
    export let dailyTotal: number = 0;
</script>

<div class="grid grid-cols-4 place-content-between md:w-[50rem] w-[28rem] mx-auto gap-x-1 gap-y-8">
    <div class="col-span-2">
        <div class="md:text-2xl text-xl text-center">{$t('tune_memorized_name')}</div>
        <div
            class="mt-2 mx-auto border-2 border-teal-300 bg-teal-100 rounded-xl text-4xl shadow-xl py-2 text-center max-w-56"
        >
            {rememberNameIds.length}/{tunes.length}
        </div>
    </div>
    <div class="col-span-2">
        <div class="md:text-2xl text-xl text-center">{$t('tune_memorized_melody')}</div>
        <div
            class="mt-2 mx-auto border-2 border-teal-300 bg-teal-100 rounded-xl text-4xl shadow-xl py-2 text-center max-w-56"
        >
            {rememberMelodyIds.length}/{tunes.length}
        </div>
    </div>
    <div class="col-span-2">
        <div class="md:text-2xl text-xl text-center">{$t('todays_plays')}</div>
        <div
            class="mt-2 mx-auto border-2 border-teal-300 bg-teal-100 rounded-xl text-4xl shadow-xl py-2 text-center max-w-56"
        >
            {totalCount}
        </div>
    </div>
    <div class="col-span-2">
        <div class="md:text-2xl text-xl text-center">{$t('todays_plays')}</div>
        <div
            class="mt-2 mx-auto border-2 border-teal-300 bg-teal-100 rounded-xl text-4xl shadow-xl py-2 text-center max-w-56"
        >
            {dailyTotal}
        </div>
    </div>
</div>