<script lang="ts">
  import type { components, operations } from "../data/bkk-openapi";
  import {
    savedStops,
    editMode,
    user,
    type savedStop,
    fetchError,
  } from "../data/stores";
  import Stop from "./Stop.svelte";
  import { fetchData } from "../util/fetch";
  import { stopsForLocationUrl } from "../data/api-links";

  let loading = false;
  let error = "";
  let data: components["schemas"]["TransitListEntryWithReferencesTransitStop"] =
    {};
  let references: components["schemas"]["TransitReferences"];
  let listOfNearbyStops: components["schemas"]["TransitStop"][] = [];
  let searchQuery: string = "";
  let stopsForLocationParams: operations["getStopsForLocation"]["parameters"]["query"] =
    { query: "", lon: 47.452734, lat: 19.18329 };
  let timer: NodeJS.Timeout;

  let stopsToDisplay: savedStop[];

  // FIXME refractor this to be a bit cleaner
  $: stopsToDisplay =
    searchQuery.length < 3
      ? $savedStops
      : listOfNearbyStops.filter((stop) => {
          return stop?.locationType == 0 && stop?.routeIds?.length;
        });

  async function getStops() {
    loading = true;
    stopsForLocationParams = { ...stopsForLocationParams, query: searchQuery };
    ({ loading, error, data } = await fetchData<
      components["schemas"]["StopsForLocationResponse"]
    >(stopsForLocationUrl, stopsForLocationParams));
    $fetchError = error;
    references = data.references!;
    listOfNearbyStops = data.list!;
  }

  function debounceFetch() {
    clearTimeout(timer);
    if (searchQuery.length > 2) {
      timer = setTimeout(() => getStops(), 300);
    }
  }
</script>

<div class="m-1 mt-4 flex w-full flex-col sm:w-72">
  <div class="mb-2 flex flex-row rounded bg-slate-200 p-2 dark:bg-slate-700">
    <button
      on:click={() => {
        $editMode = false;
      }}
      class="w-6 pr-2"
      ><span
        class="material-symbols-outlined inline-flex pr-2 align-middle dark:text-slate-100"
        >arrow_back</span
      ></button
    >
    <input
      type="text"
      placeholder="Search for stops"
      bind:value={searchQuery}
      on:keyup={() => {
        debounceFetch();
      }}
      autofocus
      class="flex-1 bg-slate-200 outline-none dark:bg-slate-700 dark:text-slate-100"
    />
    <!-- FIXME this should only be a loading indicator -->
    <button on:click={getStops} class="dark:text-slate-100"
      >{loading ? "Loading..." : "Search"}</button
    >
  </div>

  <div class="flex flex-col gap-1">
    {#each stopsToDisplay as stop}
      <Stop {references} {stop} />
    {/each}
  </div>
</div>
