<script lang="ts">
  import { each } from "svelte/internal";
  import type { operations, components } from "./data/bkk-openapi";
  import Departure from "./components/Departure.svelte";
  import SearchView from "./components/SearchView.svelte";
  import { savedStops, editMode, selectedStopID } from "./data/stores";
  import { fetchData } from "./hooks/fetch";
  import { stopDataUrl } from "./data/api-links";
  import SavedStopGroup from "./components/SavedStopGroup.svelte";

  const defaultStopParams: operations["getArrivalsAndDeparturesForStop"]["parameters"]["query"] =
    {
      version: "4",
      onlyDepartures: true,
      limit: 10,
      minutesBefore: 0,
      minutesAfter: 90,
    };

  let departures: components["schemas"]["TransitScheduleStopTime"][] = [];
  let references: components["schemas"]["OTPTransitReferences"] = {};

  let loading = false;
  let error = "";
  let data: components["schemas"]["TransitEntryWithReferencesTransitArrivalsAndDepartures"] =
    {};

  // TODO stopID should probably be from a single source of truth
  async function getStopData(stopId: string): Promise<void> {
    loading = true;
    const stopParams = { ...defaultStopParams, stopId: [stopId] };
    ({ loading, error, data } = await fetchData<
      components["schemas"]["ArrivalsAndDeparturesForStopOTPMethodResponse"]
    >(stopDataUrl, stopParams));
    references = data.references!;
    departures = data?.entry?.stopTimes!;
  }
  setInterval(() => {
    if (departures.length > 0 && $selectedStopID && !$editMode) {
      getStopData($selectedStopID);
    }
  }, 20000);

  type savedStopGroup = {
    [key in components["schemas"]["TransitStop"]["type"] as string]: components["schemas"]["TransitStop"][];
  };

  let savedStopGroups: savedStopGroup;
  $: savedStopGroups = $savedStops.reduce((result, currentStop) => {
    if (currentStop.type) {
      (result[currentStop.type] = result[currentStop.type] || []).push(
        currentStop
      );
    }
    return result;
  }, {} as savedStopGroup);
</script>

<main class="flex h-screen flex-row flex-wrap justify-center gap-4">
  {#if $editMode}
    <SearchView />
  {:else}
    <div
      class="mt-4 ml-1 mr-1 flex w-full flex-col {$savedStops.length === 0 &&
      departures.length === 0
        ? 'justify-center'
        : ''} gap-2 sm:w-72"
    >
      {#each Object.entries(savedStopGroups) as [groupType, groupItems]}
        <SavedStopGroup {groupType} {groupItems} {getStopData} />
      {:else}
        <div class="dark:text-slate-50 text-4xl text-center p-4 pb-0">
          BartalFUTÁR
        </div>
        <div class="dark:text-slate-200 text-center pb-10">
          Add stops to get started
        </div>
      {/each}

      <div
        class="flex gap-2 rounded bg-slate-50 p-2 dark:bg-slate-800 {$savedStops.length ===
          0 && departures.length === 0
          ? 'w-52 self-center'
          : ''}"
      >
        <button
          class="button-outline bg-white dark:border-none dark:bg-slate-700 dark:text-white"
          on:click={() => {
            $editMode = true;
          }}
          ><span class="material-symbols-outlined align-bottom text-base">
            add
          </span><span> Add stop</span>
        </button>

        {#if $savedStops.length > 0}
          <button
            class="button-outline bg-white text-red-500 dark:border-none dark:bg-slate-700 dark:text-red-400"
            on:click={() => {
              $savedStops = [];
            }}
            ><span
              class="material-symbols-outlined mr-1 align-bottom text-base"
            >
              delete_forever
            </span><span> Delete all</span></button
          >
        {/if}
      </div>
    </div>

    {#if departures.length > 0}
      <div
        class="flex h-screen w-full flex-col gap-2 pt-4 sm:w-72 sm:overflow-auto"
      >
        <div class="flex items-center gap-2">
          <button
            class="button-outline dark:text-slate-100"
            on:click={() => getStopData($selectedStopID)}
            ><span
              class="material-symbols-outlined pr-1 align-bottom text-base"
            >
              refresh
            </span>{loading ? "Loading..." : "Refresh"}
          </button>
          <button
            class="button-outline dark:text-slate-100"
            on:click={() => {
              departures = [];
              $selectedStopID = "";
            }}>Clear</button
          >
        </div>

        {#each departures as departure (crypto.randomUUID())}
          <Departure {departure} {references} />
        {/each}
      </div>
    {/if}
  {/if}
</main>

<style>
  .button-outline {
    @apply flex-1 rounded border p-2;
  }
</style>
