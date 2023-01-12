<script lang="ts">
  import { each } from "svelte/internal";
  import type { operations, components } from "./data/bkk-openapi";
  import Departure from "./components/Departure.svelte";
  import StopList from "./components/StopList.svelte";
  import { savedStops, editMode, selectedStopID } from "./data/stores";
  import defaultStops from "./data/defaultStops";
  import FetchTest from "./components/FetchTest.svelte";
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

  // TODO stopID should be from a single source of truth
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

  let groupSavedStops: savedStopGroup;
  $: groupSavedStops = $savedStops.reduce((result, currentStop) => {
    if (currentStop.type) {
      (result[currentStop.type] = result[currentStop.type] || []).push(
        currentStop
      );
    }
    return result;
  }, {} as savedStopGroup);
</script>

<main
  class="flex h-screen flex-row flex-wrap justify-center gap-4 dark:bg-slate-900"
>
  {#if $editMode}
    <StopList />
  {:else}
    <div class="mt-4 ml-1 mr-1 flex w-full flex-col gap-2 sm:w-72">
      {#each Object.entries(groupSavedStops) as [groupType, groupItems]}
        <SavedStopGroup {groupType} {groupItems} {getStopData} />
      {/each}

      <div class="flex gap-2 rounded bg-slate-50 p-2 dark:bg-slate-700">
        <button
          class="button-outline flex-1 bg-white dark:border-none dark:bg-slate-800 dark:text-white"
          on:click={() => {
            $editMode = true;
          }}
          ><span class="material-symbols-outlined align-bottom text-base">
            add
          </span><span> Add stop</span>
        </button>

        <button
          class="button-outline flex-1 bg-white text-red-600 dark:border-none dark:bg-slate-800 dark:text-red-400"
          on:click={() => {
            $savedStops = defaultStops;
          }}
          ><span class="material-symbols-outlined mr-1 align-bottom text-base">
            delete_forever
          </span><span> Delete stops</span></button
        >
      </div>

      <div class="flex items-center gap-2">
        <button
          class="button-outline dark:text-slate-100"
          on:click={() => getStopData($selectedStopID)}
          ><span class="material-symbols-outlined pr-1 align-bottom text-base">
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
    </div>
    <!-- <FetchTest /> -->
    <div class="flex h-screen w-full flex-col gap-2 overflow-auto pt-4 sm:w-72">
      {#each departures as departure (crypto.randomUUID())}
        <Departure {departure} {references} />
      {/each}
    </div>
  {/if}
</main>

<style>
  .button-outline {
    @apply flex-1 rounded border p-2;
  }
</style>
