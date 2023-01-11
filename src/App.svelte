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
  import { MdRefresh, MdAdd } from "svelte-icons/md";

  const defaultStopParams: operations["getArrivalsAndDeparturesForStop"]["parameters"]["query"] =
    {
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
    references = data.references;
    departures = data.entry.stopTimes;
  }
  setInterval(() => {
    if (departures.length > 0 && $selectedStopID && !$editMode) {
      getStopData($selectedStopID);
    }
  }, 20000);

  type savedStopGroup = {
    [key in components["schemas"]["TransitStop"]["type"]]: components["schemas"]["TransitStop"][];
  };

  let groupSavedStops: savedStopGroup;
  $: groupSavedStops = $savedStops.reduce((result, currentStop) => {
    (result[currentStop.type] = result[currentStop.type] || []).push(
      currentStop
    );
    return result;
  }, {} as savedStopGroup);
</script>

<main class="flex flex-row flex-wrap justify-center gap-4">
  {#if $editMode}
    <StopList />
  {:else}
    <div class="mt-4 flex w-full flex-col gap-2 md:w-72">
      {#each Object.entries(groupSavedStops) as [groupType, groupItems]}
        <SavedStopGroup {groupType} {groupItems} {getStopData} />
      {/each}
      <div class="flex gap-2 bg-slate-50 p-2">
        <button
          class="button-outline flex-1 bg-white"
          on:click={() => {
            $editMode = true;
          }}
          ><span class="material-symbols-outlined align-bottom text-base">
            add
          </span><span> Add stop</span>
        </button>
        <button
          class="button-outline flex-1 bg-white text-red-600"
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
          class="button-outline"
          on:click={() => getStopData($selectedStopID)}
          ><span class="material-symbols-outlined pr-1 align-bottom text-base">
            refresh
          </span>{loading ? "Loading..." : "Refresh"}
        </button>
        <button
          class="button-outline"
          on:click={() => {
            departures = [];
            $selectedStopID = "";
          }}>Clear</button
        >
      </div>
    </div>
    <!-- <FetchTest /> -->
    <div
      class="flex w-full flex-col gap-2 pt-4 md:h-screen md:w-72"
      style="overflow: auto;"
    >
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
