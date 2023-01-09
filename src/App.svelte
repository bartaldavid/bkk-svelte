<script lang="ts">
  import { each } from "svelte/internal";
  import type { operations, components } from "./data/bkk-openapi";
  import Departure from "./components/Departure.svelte";
  import StopList from "./components/StopList.svelte";
  import { savedStops } from "./data/stores";
  import { editMode } from "./data/stores";
  import defaultStops from "./data/defaultStops";
  import FetchTest from "./components/FetchTest.svelte";
  import { fetchData } from "./hooks/fetch";
  import { stopDataUrl } from "./data/api-links";

  let stopParams: operations["getArrivalsAndDeparturesForStop"]["parameters"]["query"] =
    {
      stopId: [""],
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
  // TODO make this a getdata(url,params, type) fn
  async function getData(): Promise<void> {
    loading = true;
    ({ loading, error, data } = await fetchData<
      components["schemas"]["ArrivalsAndDeparturesForStopOTPMethodResponse"]
    >(stopDataUrl, stopParams));
    references = data.references;
    departures = data.entry.stopTimes;
  }

  setInterval(() => departures.length > 0 && getData(), 20000);
</script>

<main class="flex flex-row flex-wrap justify-center gap-4">
  {#if $editMode}
    <StopList />
  {:else}
    <div class="mt-4 flex w-full flex-col gap-2 md:w-72">
      {#each $savedStops as stop}
        <button
          class="rounded bg-slate-100 p-2"
          on:click={() => {
            stopParams = { ...stopParams, stopId: [stop.id] };
            getData();
          }}
          >{stop.name}
          <span class="text-sm text-gray-400">
            {stop.type}
          </span>
        </button>
      {/each}
      <div class="flex gap-2">
        <button
          class="button-outline"
          on:click={() => {
            $editMode = true;
          }}>Add stops</button
        >
        <button
          class="button-outline"
          on:click={() => {
            $savedStops = defaultStops;
          }}>Reset defaults</button
        >
      </div>
      <div class="flex items-center gap-2">
        <button class="button-outline" on:click={getData}
          >{loading ? "Loading..." : "Refresh"}</button
        >
        <button class="button-outline" on:click={() => (departures = [])}
          >Clear</button
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
    @apply mt-4 flex-1 rounded border p-2;
  }
</style>
