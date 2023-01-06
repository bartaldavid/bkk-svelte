<script lang="ts">
  import { each } from "svelte/internal";
  import type { operations, components } from "./data/bkk-openapi";
  import Departure from "./lib/Departure.svelte";
  import StopList from "./lib/StopList.svelte";
  import { savedStops } from "./data/stores";
  import { editMode } from "./data/stores";
    import defaultStops from "./data/defaultStops";

  const stopDataUrl =
    "https://futar.bkk.hu/api/query/v1/ws/otp/api/where/arrivals-and-departures-for-stop.json?";

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
  // TODO make this a getdata(url,params, type) fn
  function getData(): void {
    loading = true;
    fetch(
      // TODO find a better solution to this type issue
      stopDataUrl + new URLSearchParams(stopParams as any).toString()
    )
      .then((response) => response.json())
      .then(
        (
          d: components["schemas"]["ArrivalsAndDeparturesForStopOTPMethodResponse"]
        ) => {
          if (d.code !== 200) {
            throw new Error(d.status);
          }
          return d.data;
        }
      )
      .then((tripData) => {
        references = tripData?.references;
        departures = tripData?.entry?.stopTimes;
      })
      .catch((err) => console.log(err))
      .finally(() => (loading = false));
  }

  setInterval(() => departures.length > 0 && getData(), 20000);
</script>

<main class="flex-row flex-wrap justify-center flex gap-4">
  {#if $editMode}
  <StopList />

  {:else}

  <div class="flex flex-col gap-2 w-full md:w-72 mt-4">
    {#each $savedStops as stop}
      <button
        class="p-2 bg-slate-100 rounded"
        on:click={() => {
          stopParams = { ...stopParams, stopId: stop.id };
          getData();
        }}>{stop.label}
       <span class="text-sm text-gray-400">
          {stop.type}
        </span>
        </button
      >
    {/each}
    <div class="flex gap-2">
      <button class="button-outline" on:click={() => { $editMode = true }}>Add stops</button>
      <button class="button-outline" on:click={() => { $savedStops = defaultStops }}>Reset defaults</button>
    </div>
    <div class="items-center gap-2 flex">
      <button class="button-outline" on:click={getData}
        >{loading ? "Loading..." : "Refresh"}</button
      >
      <button
        class="button-outline"
        on:click={() => (departures = [])}>Clear</button
      >

    </div>
  </div>
  <div
    class="flex flex-col gap-2 w-full md:w-72 md:h-screen pt-4"
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
    @apply border p-2 mt-4 rounded flex-1;
  }
</style>