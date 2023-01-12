<script lang="ts">
  import type { components, operations } from "../data/bkk-openapi";
  import { savedStops, editMode } from "../data/stores";
  import Stop from "./Stop.svelte";
  import { fetchData } from "../hooks/fetch";
  import { stopsForLocationUrl } from "../data/api-links";

  let loading = false;
  // TODO display error if something goes wrong
  let error = "";
  let data: components["schemas"]["TransitListEntryWithReferencesTransitStop"] =
    {};
  let references: components["schemas"]["TransitReferences"];
  let listOfNearbyStops: components["schemas"]["TransitStop"][] = [];
  let accuracy: string;
  let searchQuery: string = "";
  let stopsForLocationParams: operations["getStopsForLocation"]["parameters"]["query"] =
    { query: "", lon: 47.452734, lat: 19.18329 };

  async function getStops() {
    loading = true;
    stopsForLocationParams = { ...stopsForLocationParams, query: searchQuery };
    // setCurrentLoc();
    ({ loading, error, data } = await fetchData<
      components["schemas"]["StopsForLocationResponse"]
    >(stopsForLocationUrl, stopsForLocationParams));
    references = data.references!;
    listOfNearbyStops = data.list!;
  }

  const setCurrentLoc = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        stopsForLocationParams = {
          ...stopsForLocationParams,
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };
        accuracy = pos.coords.accuracy.toFixed(0);
      },
      (error) => (accuracy = error.message)
    );
  };
</script>

<div class="m-1 mt-4 flex w-full flex-col md:w-72">
  <div class="mb-2 flex flex-row rounded bg-slate-200 p-2 dark:bg-slate-600">
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
      on:keydown={(e) => {
        searchQuery.length > 2 && getStops();
      }}
      autofocus
      class="flex-1 bg-slate-200 outline-none dark:bg-slate-600 dark:text-slate-100"
    />
    <button on:click={getStops} class="dark:text-slate-100"
      >{loading ? "Loading..." : "Search"}</button
    >
  </div>
  <!-- <button on:click={setCurrentLoc}>Set loc as target</button> -->

  <div class="flex flex-col gap-1">
    {#if searchQuery.length < 3 && $savedStops}
      {#each $savedStops as savedStop}
        <Stop {references} stop={savedStop} />
      {/each}
    {:else}
      {#each listOfNearbyStops as nearbyStop}
        {#if nearbyStop.locationType == 0}
          <Stop {references} stop={nearbyStop} />
        {/if}
      {/each}
    {/if}
  </div>
</div>
