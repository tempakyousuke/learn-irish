<script lang="ts">
    import { rememberNameOption, rememberMelodyOption, onlyFavoriteOption, sortByOption } from './__options';
    import { t } from 'svelte-i18n';
    import RadioButtons from '$lib/forms/RadioButtons.svelte';

    export let rememberName: string;
    export let rememberMelody: string;
    export let onlyFavorite: string;
    export let selectedRhythm: string;
    export let sortBy: string;
    export let rhythms: string[] = [];
</script>

<div class="mt-10 md:w-8/12 w-11/12 mx-auto">
    <div class="text-2xl font-bold mx-auto">{$t('search_filter')}</div>
    <div class="row">
        <div class="item-name">{$t('memorized_name')}</div>
        <div class="item-detail">
            <RadioButtons
                className="flex md:flex-row flex-col"
                options={$rememberNameOption}
                bind:userSelected={rememberName}
                name="rememberName"
            />
        </div>
    </div>
    <div class="row">
        <div class="item-name">{$t('memorized_melody')}</div>
        <div class="item-detail">
            <RadioButtons
                className="flex md:flex-row flex-col"
                options={$rememberMelodyOption}
                bind:userSelected={rememberMelody}
                name="rememberMelody"
            />
        </div>
    </div>
    <div class="row">
        <div class="item-name">{$t('show_favorites_only')}</div>
        <div class="item-detail">
            <RadioButtons
                className="flex md:flex-row flex-col"
                options={$onlyFavoriteOption}
                bind:userSelected={onlyFavorite}
                name="onlyFavorite"
            />
        </div>
    </div>
    <div class="row">
        <div class="item-name">{$t('tune_type')}</div>
        <div class="item-detail">
            <select bind:value={selectedRhythm} name="selectedRhythm">
                <option value="notSelected"></option>
                {#each rhythms as rhythm}
                    <option value={rhythm}>
                        {rhythm}
                    </option>
                {/each}
            </select>
        </div>
    </div>
    <div class="row">
        <div class="item-name">{$t('sort')}</div>
        <div class="item-detail">
            <select id="sortByNameSelect" bind:value={sortBy}>
                {#each $sortByOption as opt}
                    <option value={opt.value} id={opt.id}>{opt.label}</option>
                {/each}
            </select>
        </div>
    </div>
</div>

<style>
    .row {
        display: flex;
        margin-top: 1.75rem;
        height: 2.5rem;
    }

    .item-name {
        width: 33.33%;
        text-align: right;
        padding-right: 0.5rem;
        font-size: 1.25rem;
        font-weight: bold;
    }

    .item-detail {
        width: 66.67%;
        padding-left: 0.5rem;
        font-size: 1.25rem;
    }
</style>